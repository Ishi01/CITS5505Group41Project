import os
from cachelib.file import FileSystemCache
basedir = os.path.abspath(os.path.dirname(__file__))

# holds the configuration settings for the Flask application
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'default_password'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    SCRIPT_MODE = False   
    SESSION_TYPE = 'filesystem'
    SESSION_FILE_DIR = None  # Ensure this is not set
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_FILE_THRESHOLD = 500
    SESSION_CACHE = FileSystemCache('/path/to/session/dir', threshold=500, mode=0o600)
        
class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    WTF_CSRF_ENABLED = False
    SESSION_TYPE = 'filesystem'
    SESSION_FILE_DIR = './test_sessions'
    SCRIPT_MODE = True
    SERVER_NAME = 'localhost.localdomain'
    SESSION_PERMANENT = False  # Ensure sessions don't 'expire' during tests
    LOGIN_DISABLED = False
    SESSION_CACHE = FileSystemCache('./test_sessions', threshold=500, mode=0o600)