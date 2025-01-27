import jwt
import datetime
from flask import Blueprint, request, jsonify
from functools import wraps
from . import db
from .models import User, Message

SECRET_KEY = "your_secret_key"  # U¿ywane do podpisywania JWT

main = Blueprint("main", __name__)

# Dekorator do ochrony endpointów z weryfikacj¹ JWT
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

# Strona g³ówna
@main.route('/')
def index():
    return {"message": "Welcome to the Secure Messaging App!"}

# Rejestracja u¿ytkownika
@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required!"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists!"}), 400

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201

# Logowanie u¿ytkownika
@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
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
    else:
        return jsonify({"message": "Invalid credentials!"}), 400

# Pobieranie wiadomoœci
@main.route('/messages', methods=['GET'])
@token_required
def get_messages(decoded):
    messages = Message.query.all()
    messages_list = [
        {"id": msg.id, "message": msg.message, "author": msg.author}
        for msg in messages
    ]
    return jsonify({"messages": messages_list}), 200

# Dodawanie wiadomoœci
@main.route('/messages', methods=['POST'])
@token_required
def create_message(decoded):
    data = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({"message": "Message is required!"}), 400

    author = decoded['username']

    new_message = Message(message=message, author=author)
    db.session.add(new_message)
    db.session.commit()
    return jsonify({"message": "Message created successfully!"}), 201
