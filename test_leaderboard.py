# test_leaderboard.py

import unittest
from app import create_app, db
from app.models import User, Game
from config import TestConfig

class LeaderboardTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.add_test_data()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def add_test_data(self):
        user1 = User(username='user1', email='user1@example.com')
        user1.set_password('password1')
        user2 = User(username='user2', email='user2@example.com')
        user2.set_password('password2')
        user3 = User(username='user3', email='user3@example.com')
        user3.set_password('password3')

        db.session.add_all([user1, user2, user3])
        db.session.commit()

        game1 = Game(score=100, player=user1)
        game2 = Game(score=200, player=user2)
        game3 = Game(score=300, player=user3)

        db.session.add_all([game1, game2, game3])
        db.session.commit()

    def test_leaderboard(self):
        response = self.client.get('/get-rankings')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(data[0]['username'], 'user3')
        self.assertEqual(data[0]['total_score'], 300)
        self.assertEqual(data[1]['username'], 'user2')
        self.assertEqual(data[1]['total_score'], 200)
        self.assertEqual(data[2]['username'], 'user1')
        self.assertEqual(data[2]['total_score'], 100)

if __name__ == '__main__':
    unittest.main()
