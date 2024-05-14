import os
basedir = os.path.abspath(os.path.dirname(__file__))

# holds the configuration settings for the Flask application
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'default_password'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')