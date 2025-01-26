from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  
    app.config['SECRET_KEY'] = 'mysecretkey'  

    db.init_app(app)

    with app.app_context():
        from .models import User  
        db.create_all()  

    from .routes import main  
    app.register_blueprint(main)

    return app
