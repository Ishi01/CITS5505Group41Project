from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
login.login_view = 'login'

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)

    from app import models
    with app.app_context():
        db.create_all()
        from app.load_data import load_quiz_questions
        load_quiz_questions()
        
    from app.routes import main
    app.register_blueprint(main)
    
    return app