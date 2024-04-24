import os

# holds the configuration settings for the Flask application
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'