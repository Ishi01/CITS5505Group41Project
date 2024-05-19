import os
from cachelib import FileSystemCache
basedir = os.path.abspath(os.path.dirname(__file__))

# holds the configuration settings for the Flask application
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'default_password'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    SCRIPT_MODE = False   
    SESSION_TYPE = 'sqlalchemy'
    SESSION_SQLALCHEMY_TABLE = 'sessions'
    SESSION_PERMANENT = False

## Development Config
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'dev.db')

## Testing Config
class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'test-confg-secret-key'
    WTF_CSRF_ENABLED = False
    SESSION_TYPE = 'filesystem'
    SESSION_CACHE = FileSystemCache('./test_sessions', threshold=500, mode=0o600)
    SCRIPT_MODE = True
    SERVER_NAME = 'localhost:5000'
    SESSION_SQLALCHEMY_TABLE = None
    SESSION_PERMANENT = False

## Deployment Config
class DeploymentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'prod.db')
    SESSION_USE_SIGNER = True