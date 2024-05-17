# tests/test_user.py
import unittest
from test_app import BaseTestCase, db
from app.models import User, UserGameHistory
from flask import url_for

class TestUser(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Create a test user
        self.user = User(username='testuser', email='testuser@example.com')
        self.user.set_password('testpassword')
        db.session.add(self.user)
        db.session.commit()

        # Add some game history for the user
        self.game_history = UserGameHistory(
            user_id=self.user.id,
            game_name='Trivia Game',
            correct_answers=10,
            attempts=15,
            completion_time=300  # in seconds
        )
        db.session.add(self.game_history)
        db.session.commit()

    def test_user_profile_by_id(self):
        # Test the endpoint that retrieves user profile by user ID
        response = self.client.get(url_for('user.user_profile', user_id=self.user.id))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Trivia Game', response.get_data(as_text=True))
        self.assertIn('testuser', response.get_data(as_text=True))

    def test_user_profile_by_username(self):
        # Test the endpoint that retrieves user profile by username
        response = self.client.get(url_for('user.user_profile', user_name=self.user.username))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Trivia Game', response.get_data(as_text=True))
        self.assertIn('testuser', response.get_data(as_text=True))

    def test_user_profile_not_found(self):
        # Test the response for a non-existent user
        response = self.client.get(url_for('user.user_profile', user_id=999))
        self.assertEqual(response.status_code, 404)
        response = self.client.get(url_for('user.user_profile', user_name='unknown'))
        self.assertEqual(response.status_code, 404)

    def tearDown(self):
        super().tearDown()

if __name__ == '__main__':
    unittest.main()
