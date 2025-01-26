from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Inicjalizacja obiektu SQLAlchemy
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # Ścieżka do bazy danych
    app.config['SECRET_KEY'] = 'mysecretkey'  # Tajny klucz do sesji

    # Inicjalizacja SQLAlchemy z aplikacją
    db.init_app(app)

    # Tworzenie tabel, jeśli nie istnieją (tylko dla SQLite)
    with app.app_context():
        from .models import User  # Załaduj modele, aby je zarejestrować w SQLAlchemy
        db.create_all()  

    # Rejestracja blueprintów
    from .routes import main  # Importowanie blueprintu
    app.register_blueprint(main)

    return app
