import unittest
import os
from flask import current_app
from app import create_app, db
from app.models import User, Game
from config import TestConfig
from flask_login import current_user, login_user, logout_user, login_required
import shutil

class BaseTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()
        # Create session directory if not available
        self.session_dir = self.app.config.get('SESSION_FILE_DIR', './flask_session/')
        if not os.path.exists(self.session_dir):
            os.makedirs(self.session_dir)

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        if os.path.exists(self.session_dir):
            shutil.rmtree(self.session_dir)  # Clean up session files