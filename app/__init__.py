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
login.login_view = 'login'

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Avoiding reinitializing extensions if they're already set up
    # The tearDown() method doesn't seem to remove Session properly
    if not hasattr(app, 'extensions_setup_done'):
        db.init_app(app)
        migrate.init_app(app, db)
        login.init_app(app)

        if app.config['TESTING']:
            app.config['SESSION_TYPE'] = 'filesystem'
        else:
            app.config['SESSION_TYPE'] = 'sqlalchemy'
            app.config['SESSION_SQLALCHEMY'] = db
        
        Session(app)
        app.extensions_setup_done = True

    # Register blueprints
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
