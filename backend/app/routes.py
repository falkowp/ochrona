import jwt
import datetime
import io
import pyotp
import qrcode
from flask import Blueprint, request, jsonify, send_file
from functools import wraps
from . import db
from .models import User, Message
from .utils import limiter, validate_password

SECRET_KEY = "your_secret_key"

main = Blueprint("main", __name__)


# Middleware do wymaganego tokena JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401

        return f(decoded, *args, **kwargs)
    return decorated


# Rejestracja u¿ytkownika
@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required!"}), 400

    # Sprawdzenie czy u¿ytkownik istnieje
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists!"}), 400

    # Walidacja has³a
    if not validate_password(password):
        return jsonify({"message": "Password is too weak!"}), 400

    # Stworzenie nowego u¿ytkownika
    new_user = User(username=username)
    new_user.set_password(password)
    new_user.generate_otp_secret()  # Generowanie sekretnika OTP
    db.session.add(new_user)
    db.session.commit()

    # Generowanie kodu QR dla aplikacji uwierzytelniaj¹cej
    totp = pyotp.TOTP(new_user.otp_secret)
    otp_url = totp.provisioning_uri(username, issuer_name="TrelkaczApp")
    qr = qrcode.make(otp_url)

    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    return send_file(buffer, mimetype="image/png",
                     as_attachment=False,
                     download_name="otp_qr.png")


# Logowanie u¿ytkownika
@main.route('/login', methods=['POST'])
@limiter.limit("5 per minute")  # Limity zapytañ do logowania
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    otp = data.get('otp')

    # Znalezienie u¿ytkownika
    user = User.query.filter_by(username=username).first()

    if not user or not user.verify_password(password):
        return jsonify({"message": "Invalid credentials!"}), 400

    # Weryfikacja OTP z tolerancj¹ czasu
    def verify_otp(secret, otp):
        totp = pyotp.TOTP(secret)
        # Sprawdzenie OTP z tolerancj¹ +/- 30 sekund (1 window)
        return totp.verify(otp, valid_window=1)

    if not verify_otp(user.otp_secret, otp):
        return jsonify({"message": "Invalid code! Please check the code in app and try again."}), 400

    # Generowanie tokena JWT
    token = jwt.encode(
        {
            "user_id": user.id,
            "username": user.username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    return jsonify({"token": token}), 200


# Pobieranie wiadomoœci
@main.route('/messages', methods=['GET'])
@token_required
def get_messages(decoded):
    messages = Message.query.all()
    messages_list = [
        {
            "id": msg.id,
            "message": msg.message,
            "author": msg.author,
            "created_at": msg.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_at": msg.updated_at.strftime('%Y-%m-%d %H:%M:%S') if msg.updated_at else None
        }
        for msg in messages
    ]
    return jsonify({"messages": messages_list}), 200


# Tworzenie wiadomoœci
@main.route('/messages', methods=['POST'])
@token_required
def create_message(decoded):
    data = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({"message": "Message is required!"}), 400

    new_message = Message(message=message, author=decoded['username'])
    db.session.add(new_message)
    db.session.commit()
    return jsonify({"message": "Message created successfully!"}), 201


# Edycja wiadomoœci
@main.route('/messages/<int:message_id>', methods=['PUT'])
@token_required
def update_message(decoded, message_id):
    data = request.get_json()
    new_content = data.get('message')

    if not new_content:
        return jsonify({"message": "New message content is required!"}), 400

    message = Message.query.filter_by(id=message_id, author=decoded['username']).first()

    if not message:
        return jsonify({"message": "Message not found or not authorized!"}), 404

    message.message = new_content
    message.updated_at = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Message updated successfully!"}), 200


# Usuwanie wiadomoœci
@main.route('/messages/<int:message_id>', methods=['DELETE'])
@token_required
def delete_message(decoded, message_id):
    message = Message.query.filter_by(id=message_id, author=decoded['username']).first()

    if not message:
        return jsonify({"message": "Message not found or not authorized!"}), 404

    db.session.delete(message)
    db.session.commit()

    return jsonify({"message": "Message deleted successfully!"}), 200
