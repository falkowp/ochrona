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
from pydantic import ValidationError
from .utils import UserRegistrationModel
import bleach

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

@main.route('/', methods=['GET'])
def test():
    return jsonify({"message": "works!"})

# Rejestracja u¿ytkownika
@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        validated_data = UserRegistrationModel(**data)
    except ValidationError as e:
        return jsonify({"message": "Login or password does not meet requirements."}), 400

    username = validated_data.username
    password = validated_data.password

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
@main.route('/login_step1', methods=['POST'])
@limiter.limit("5 per minute")
def login_step1():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not user.verify_password(password):
        return jsonify({"message": "Wrong login or password!"}), 400

    return jsonify({"message": "Credentials valid. Proceed to OTP verification."}), 200

def verify_otp(secret, otp):
    totp = pyotp.TOTP(secret)
    return totp.verify(otp, valid_window=1)

@main.route('/login_step2', methods=['POST'])
@limiter.limit("5 per minute")
def login_step2():
    data = request.get_json()
    username = data.get('username')
    otp = data.get('otp')

    user = User.query.filter_by(username=username).first()

    if not user or not verify_otp(user.otp_secret, otp):
        return jsonify({"message": "Invalid OTP!"}), 400

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

@main.route('/change_password', methods=['POST'])
@token_required  # Wymaga tokena JWT
def change_password(decoded):
    data = request.get_json()
    current_password = data.get('current_password')
    otp = data.get('otp')
    new_password = data.get('new_password')

    # Pobierz u¿ytkownika z bazy na podstawie tokena JWT
    user = User.query.filter_by(id=decoded["user_id"]).first()

    if not user:
        return jsonify({"message": "User not found."}), 404

    # Weryfikacja starego has³a
    if not user.verify_password(current_password):
        return jsonify({"message": "Incorrect current password."}), 400

    # Weryfikacja OTP
    if not verify_otp(user.otp_secret, otp):
        return jsonify({"message": "Invalid OTP."}), 400

    # Walidacja nowego has³a
    password_issues = []
    if len(new_password) < 8:
        password_issues.append("Password must be at least 8 characters long.")
    if not any(char.isdigit() for char in new_password):
        password_issues.append("Password must include at least one number.")
    if not any(char.isupper() for char in new_password):
        password_issues.append("Password must include at least one uppercase letter.")
    if not any(char.islower() for char in new_password):
        password_issues.append("Password must include at least one lowercase letter.")

    if password_issues:
        return jsonify({"message": "New password does not meet security requirements.", "issues": password_issues}), 400

    # Zmieñ has³o u¿ytkownika
    user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully."}), 200




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


def sanitize_input(data):
    return bleach.clean(data)

# Zastosowanie przy tworzeniu wiadomoœci:
@main.route('/messages', methods=['POST'])
@token_required
def create_message(decoded):
    data = request.get_json()
    raw_message = data.get('message')

    if not raw_message:
        return jsonify({"message": "Message is required!"}), 400

    sanitized_message = sanitize_input(raw_message)

    new_message = Message(message=sanitized_message, author=decoded['username'])
    db.session.add(new_message)
    db.session.commit()
    return jsonify({"message": "Message created successfully!"}), 201



# Edycja wiadomoœci
@main.route('/messages/<int:message_id>', methods=['PUT'])
@token_required
def update_message(decoded, message_id):
    import bleach  # Importujemy w razie braku wczeœniejszego
    data = request.get_json()
    new_content = data.get('message')

    if not new_content:
        return jsonify({"message": "New message content is required!"}), 400

    # Pobieramy wiadomoœæ przypisan¹ do u¿ytkownika
    message = Message.query.filter_by(id=message_id, author=decoded['username']).first()

    if not message:
        return jsonify({"message": "Message not found or not authorized!"}), 404

    # Sanitization of new content
    sanitized_content = bleach.clean(new_content)

    # Aktualizacja treœci wiadomoœci
    message.message = sanitized_content
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

@main.errorhandler(429)
def ratelimit_error(e):
    return jsonify({
        "message": "Too many requests! Try again later",
        "description": str(e.description)
    }), 429

@main.route('/user/message_count', methods=['GET'])
@token_required
def get_message_count(decoded):
    user_messages_count = Message.query.filter_by(author=decoded["username"]).count()
    return jsonify({"messageCount": user_messages_count}), 200
