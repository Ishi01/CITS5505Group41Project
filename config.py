import os
basedir = os.path.abspath(os.path.dirname(__file__))

# holds the configuration settings for the Flask application
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'default_password'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    SCRIPT_MODE = False   
        
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