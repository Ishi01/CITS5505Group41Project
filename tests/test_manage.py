# tests/test_manage.py
import json
import unittest
from test_app import BaseTestCase, db
from app.models import QuizQuestion, User
from flask import url_for, jsonify
from flask_login import current_user, login_user

class TestManage(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Create an admin user
        self.admin_user = User(
            username='admin', 
            email='admin@example.com', 
            is_admin=True)
        self.admin_user.set_password('adminpass')
        db.session.add(self.admin_user)

        # Create a normal user
        self.normal_user = User(
            username='normaluser', 
            email='normal@example.com', 
            is_admin=False)
        self.normal_user.set_password('normalpass')
        db.session.add(self.normal_user)

        # Create a quiz game
        self.quiz_question = QuizQuestion(
            category='countries',
            game_name='Test Game',
            description='Test Description',
            user_id=0,
            question_text='What country has the city Perth?',
            answer=json.dumps(['Australia']),
            location='global'
        )
        db.session.add(self.quiz_question)
        db.session.commit()

        # Login as admin for testing
        with self.client:
            response = self.client.post('/login', data={
                'username': 'admin',
                'password': 'adminpass'
            }, follow_redirects=True)
            self.assertTrue(current_user.is_authenticated, response)

    def test_manage_page_access(self):
        # Access manage page as admin
        response = self.client.get(url_for('manage.manage_page'))
        self.assertEqual(response.status_code, 200)

        # Logout and login as a normal user
        self.client.get('/logout', follow_redirects=True)
        self.client.post('/login', data={
            'username': 'normaluser',
            'password': 'normalpass'
        }, follow_redirects=True)

        # Try to access manage page as non-admin
        response = self.client.get(url_for('manage.manage_page'))
        self.assertEqual(response.status_code, 403)

    def test_delete_game(self):
        # Attempt to delete a game as admin
        response = self.client.post(url_for('manage.delete_game'), data={'game_name': 'Test Game'}, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')

        # Verify game is deleted
        game = QuizQuestion.query.filter_by(game_name='Test Game').first()
        self.assertIsNone(game)

    def test_delete_user_admin(self):
        # Store the user ID in a variable before deletion
        user_id = self.normal_user.id

        # Attempt to delete the user as admin
        response = self.client.post(url_for('manage.delete_user'), data={'user_id': user_id}, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')

        # Check if the user still exists in the database using the stored user ID
        deleted_user = User.query.get(user_id)
        self.assertIsNone(deleted_user, "The user should have been deleted from the database")

    def test_delete_game_as_normal_user(self):
        self.client.get('/logout', follow_redirects=True)
        self.client.post('/login', data={
            'username': 'normaluser',
            'password': 'normalpass'
        }, follow_redirects=True)
        response = self.client.post(url_for('manage.delete_game'), data={'game_name': 'Test Game'}, follow_redirects=True)
        self.assertNotEqual(response.status_code, 200)
        self.assertEqual(response.status_code, 403)

    def test_delete_nonexistent_game(self):
        response = self.client.post(url_for('manage.delete_game'), data={'game_name': 'Nonexistent Game'}, follow_redirects=True)
        self.assertNotEqual(response.status_code, 200)
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertEqual(data['status'], 'error')


    def tearDown(self):
        super().tearDown()

if __name__ == '__main__':
    unittest.main()
