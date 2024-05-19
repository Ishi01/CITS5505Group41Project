from flask import Flask
from config import Config, TestConfig
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from app.commands import register_commands

db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
login.login_view = 'main.login'

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)
    
    if not hasattr(app, 'session_interface'):
        Session(app)

    # Register blueprints
    from app.blueprints import register_blueprints
    register_blueprints(app)
    # Register click commands
    register_commands(app)

    return app
