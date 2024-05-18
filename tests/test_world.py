# tests/test_world.py
import io
import sys
from test_app import BaseTestCase, db
import unittest
from app.models import QuizQuestion, User, Feedback
from flask import url_for, json
from flask_login import current_user, login_user

class TestWorldMap(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Create a test user with all required fields, including email
        self.user = User(username='testuser', email='test@example.com')
        self.user.set_password('testpass')
        db.session.add(self.user)
        db.session.commit()

        # Simulate login
        with self.client:
            response = self.client.post('/login', data={
                'username': 'testuser',
                'password': 'testpass',
                'remember_me': 'y'
            }, follow_redirects=True)

            self.assertIn(b"Welcome", response.data)
            self.assertTrue(current_user.is_authenticated)

        # Add a test quiz question linked to the test user with all required fields
        self.quiz_question = QuizQuestion(
            category='countries',
            game_name='Test Game',
            description='Test Description',
            user_id=self.user.id,
            question_text='What country has the city Perth?',
            answer=json.dumps(['Australia']),
            location='global'
        )
        db.session.add(self.quiz_question)
        db.session.commit()

    # Test the login feature again.
    def test_successful_login(self):
        with self.client:
            response = self.client.post('/login', data={
                'username': 'testuser',
                'password': 'testpass',
                'remember_me': 'y' 
            }, follow_redirects=True)
            self.assertTrue(current_user.is_authenticated)

    # Test if the /world route is returning the correct page and data
    def test_world_route(self):
        response = self.client.get(url_for('worldmap.world'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Test Game', response.get_data(as_text=True))
        self.assertIn('Test Description', response.get_data(as_text=True))

    # Simulate a POST request to set the game location in the session
    def test_set_location(self):        
        with self.client as c:
            response = c.post(url_for('worldmap.set_location'), json={'game_name': 'Test Game'})
            self.assertEqual(response.status_code, 200)
            with c.session_transaction() as sess:
                self.assertEqual(sess['game_name'], 'Test Game')

    # Test starting a game session and check session values
    def test_start_game_session(self):
        with self.client as c:
            c.post(url_for('worldmap.set_location'), json={'game_name': 'Test Game'})
            response = c.get(url_for('worldmap.start_game_session'))
            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertTrue(data['success'])
            self.assertIsNotNone(data['start_time'])
            with c.session_transaction() as sess:
                self.assertEqual(sess['game_name'], 'Test Game')

    ## Testing the rating system
    ## First we set the current session by selecting the appropriate game `Test Game`
    ## Session must contain the game name
    ## Secondly we submit a rating for this game (which checks the session)
    def test_submit_rating(self):
        with self.client as c:
            response = c.post(url_for('worldmap.set_location'), json={'game_name': 'Test Game'})
            with c.session_transaction() as sess:
                self.assertEqual(sess['game_name'], 'Test Game')
                self.assertEqual(response.status_code, 200, response.get_data(as_text=True))
                
                # Submit a positive rating for the game
                response = c.post(url_for('worldmap.submit_rating'), json={
                    'rating_type': 'positive'
                })
                data = response.get_json()
                self.assertTrue(data['success'], data)
                
                # Verify that the feedback was correctly inserted into the database
                feedback_entry = Feedback.query.filter_by(game_name=sess['game_name'], user_id=current_user.id).first()
                self.assertIsNotNone(feedback_entry, "Feedback entry should not be None")
                self.assertEqual(feedback_entry.feedback, 1, "Feedback value should be 1 for positive rating")
                self.assertEqual(feedback_entry.user_id, self.user.id, "User ID should match the logged in user's ID")

    def test_submit_rating_no_session(self):
        with self.client as c:
            # Attempt to submit a rating without setting the session
            response = c.post(url_for('worldmap.submit_rating'), json={
                'rating_type': 'positive'
            })
            self.assertNotEqual(response.status_code, 200, "Expected failure due to no session set")

    def test_submit_invalid_rating_type(self):
        with self.client as c:
            c.post(url_for('worldmap.set_location'), json={'game_name': 'Test Game'})
            response = c.post(url_for('worldmap.submit_rating'), json={
                'rating_type': 'neutral'
            })
            data = response.get_json()
            self.assertTrue(data['error'], "Expected failure due to invalid rating type")

    def tearDown(self):
        super().tearDown()

if __name__ == '__main__':
    unittest.main()
