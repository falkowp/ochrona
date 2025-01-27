from flask_sqlalchemy import SQLAlchemy
from . import db
import datetime
from argon2 import PasswordHasher

ph = PasswordHasher()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    otp_secret = db.Column(db.String(32), nullable=True)

    def set_password(self, plain_password):
        self.password = ph.hash(plain_password)

    def verify_password(self, plain_password):
        try:
            return ph.verify(self.password, plain_password)
        except:
            return False

    def generate_otp_secret(self):
        from .utils import generate_otp_secret
        self.otp_secret = generate_otp_secret()

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.datetime.utcnow)
