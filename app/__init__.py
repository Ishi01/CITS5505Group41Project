from flask import Flask
from config import Config
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from app.commands import register_commands

db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
login.login_view = 'login'

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Flask Session
    app.config['SESSION_TYPE'] = 'sqlalchemy'
    app.config['SESSION_SQLALCHEMY'] = db
    app.config['SESSION_PERMANENT'] = False

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)
    Session(app)
            
    from app.routes import main
    app.register_blueprint(main)
    from app.worldmap import worldmap
    app.register_blueprint(worldmap)
    from app.creategame import creategame
    app.register_blueprint(creategame)
    from app.periodictable import periodictable
    app.register_blueprint(periodictable)
    from app.manage import manage
    app.register_blueprint(manage)
    from app.user import user
    app.register_blueprint(user)
    
    register_commands(app)

    return app
