# tests/test_periodictable.py
import unittest
from test_app import BaseTestCase, db
from app.models import QuizQuestion, User, Feedback
from flask import url_for, json
from flask_login import current_user

class TestPeriodicTable(BaseTestCase):
    def setUp(self):
        super().setUp()
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

        self.quiz_question = QuizQuestion(
            category='elements',
            game_name='Element Quiz',
            description='Questions about elements',
            user_id=self.user.id,
            question_text='Which element is often used to make a balloon float? (1 Answer)',
            answer=json.dumps(['He']),
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

    # Test if the /periodic-table route is returning the correct page and data
    def test_periodic_table_route(self):
        response = self.client.get(url_for('periodictable.periodic_table'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Element Quiz', response.get_data(as_text=True))

    # Test starting a game session and check session values
    def test_start_game_session(self):
        response = self.client.get(url_for('periodictable.start_game_session'))
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])

    ## Testing the rating system
    ## First we set the current session by selecting the appropriate game `Test Game`
    ## Session must contain the game name
    ## Secondly we submit a rating for this game (which checks the session)
    def test_submit_rating(self):
        with self.client as c:
            response = c.post(url_for('periodictable.set_location'), json={'game_name': 'Element Quiz'})
            with c.session_transaction() as sess:
                self.assertEqual(sess['game_name'], 'Element Quiz')
                self.assertEqual(response.status_code, 200, "Failed to set location")

            # Submit a positive rating for the game
            response = c.post(url_for('periodictable.submit_rating'), json={
                'rating_type': 'positive',
                'game_name': 'Element Quiz'
            })
            data = response.get_json()
            self.assertTrue(data['success'], data)
            self.assertTrue(data['success'], "Rating submission failed")

            # Verify that the feedback was correctly inserted into the database
            feedback_entry = Feedback.query.filter_by(game_name='Element Quiz', user_id=self.user.id).first()
            self.assertIsNotNone(feedback_entry, "Feedback entry should not be None")
            self.assertEqual(feedback_entry.feedback, 1, "Feedback value should be 1 for positive rating")
            self.assertEqual(feedback_entry.user_id, self.user.id, "User ID should match the logged in user's ID")

    def test_submit_rating_no_session_periodictable(self):
        with self.client as c:
            # Attempt to submit a rating without setting the session
            response = c.post(url_for('periodictable.submit_rating'), json={
                'rating_type': 'positive',
                'game_name': 'Element Quiz'
            })
            self.assertNotEqual(response.status_code, 200, "Expected failure due to no session set")

    def test_submit_invalid_rating_type_periodictable(self):
        with self.client as c:
            c.post(url_for('periodictable.set_location'), json={'game_name': 'Element Quiz'})
            response = c.post(url_for('periodictable.submit_rating'), json={
                'rating_type': 'neutral',
            })
            data = response.get_json()
            self.assertTrue(data['error'], "Expected failure due to invalid rating type")




    def tearDown(self):
        super().tearDown()

if __name__ == '__main__':
    unittest.main()
