from flask import Blueprint, request, jsonify
from . import db
from .models import User
from .models import Message

main = Blueprint("main", __name__)

@main.route('/')
def index():
    return {"message": "Witaj w aplikacji Secure Messaging App!"}

# Rejestracja u¿ytkownika
@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

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
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"message": "Invalid credentials!"}), 400


# Endpoint do pobierania wiadomoœci
@main.route('/messages', methods=['GET'])
def get_messages():
    messages = Message.query.all()
    messages_list = [
        {"id": msg.id, "message": msg.message, "author": msg.author}
        for msg in messages
    ]
    return jsonify({"messages": messages_list}), 200

# Endpoint do dodawania wiadomoœci
@main.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    message = data.get('message')
    author = data.get('author')

    if not message or not author:
        return jsonify({"message": "Message and author are required!"}), 400

    new_message = Message(message=message, author=author)
    db.session.add(new_message)
    db.session.commit()
    return jsonify({"message": "Message created successfully!"}), 201