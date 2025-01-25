from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Inicjalizacja obiektu SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # Œcie¿ka do bazy danych
    app.config['SECRET_KEY'] = 'mysecretkey'  # Tajny klucz do sesji

    # Inicjalizacja SQLAlchemy z aplikacj¹
    db.init_app(app)

    # Rejestracja blueprintów
    from .routes import main  # Importowanie blueprintu
    app.register_blueprint(main)

    return app
