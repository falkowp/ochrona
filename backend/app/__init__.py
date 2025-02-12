from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from .utils import limiter

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SECRET_KEY'] = 'your_secret_key'
    CORS(app, supports_credentials=True)

    db.init_app(app)
    limiter.init_app(app) 

    with app.app_context():
        from .models import User, Message
        db.create_all()

    from .routes import main
    app.register_blueprint(main)

    return app
