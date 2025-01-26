from flask_sqlalchemy import SQLAlchemy
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Kolumna dla ID
    username = db.Column(db.String(80), unique=True, nullable=False)  # Kolumna dla loginu
    password = db.Column(db.String(120), nullable=False)  # Kolumna dla has³a

    def __repr__(self):
        return f'<User {self.username}>'

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(80), nullable=False)

    def __repr__(self):
        return f'<Message {self.message[:20]}...>'