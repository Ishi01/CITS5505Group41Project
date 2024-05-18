from test_app import BaseTestCase, db
from app.models import User, UserGameHistory
from werkzeug.security import generate_password_hash
from bs4 import BeautifulSoup

class LeaderboardTestCase(BaseTestCase):
    def setUp(self):
        super().setUp()

        user1 = User(username='user1', email='user1@example.com')
        user1.set_password('password1')
        user2 = User(username='user2', email='user2@example.com')
        user2.set_password('password2')
        user3 = User(username='user3', email='user3@example.com')
        user3.set_password('password3')

        db.session.add_all([user1, user2, user3])
        db.session.commit()

        history1 = UserGameHistory(
            user_id=user1.id,
            game_name='Quiz 1',
            correct_answers=10,
            attempts=1,
            completion_time=5.5
        )
        history2 = UserGameHistory(
            user_id=user2.id,
            game_name='Quiz 2',
            correct_answers=20,
            attempts=2,
            completion_time=10.5
        )
        history3 = UserGameHistory(
            user_id=user3.id,
            game_name='Quiz 3',
            correct_answers=30,
            attempts=3,
            completion_time=15.5
        )
        # History entry for user1 on Quiz 3 with lower scores that user3
        history4 = UserGameHistory(
            user_id=user1.id,
            game_name='Quiz 3',
            correct_answers=15,
            attempts=5, 
            completion_time=20.5
        )

        db.session.add_all([history1, history2, history3, history4])
        db.session.commit()

    def test_leaderboard(self):
        response = self.client.get('/leaderboard')
        self.assertEqual(response.status_code, 200)

        print(response.data)
        # Parse the HTML
        soup = BeautifulSoup(response.data, 'html.parser')

        # Locate all the leaderboard blocks
        leaderboards = soup.find_all(class_='leaderboard')
        self.assertTrue(len(leaderboards) > 0, "There should be at least one leaderboard section")

        # Test for the specific structure and content in each leaderboard block
        for leaderboard in leaderboards:
            game_name = leaderboard.find('h3').text.strip()
            table = leaderboard.find('table')
            rows = table.find_all('tr')[1:]  # Skip header row

            for index, row in enumerate(rows, start=1):
                cols = row.find_all('td')
                rank = cols[0].text.strip()
                username = cols[1].text.strip()
                correct_answers = cols[2].text.strip()
                attempts = cols[3].text.strip()
                completion_time = cols[4].text.strip()

                # Assert the rank matches the row index
                self.assertEqual(str(index), rank, f"Rank {index} does not match row index for {game_name}")

                if game_name == 'Quiz 3' and username == 'user3':
                    self.assertEqual(correct_answers, '30', "Correct answers for user3 in Quiz 3 should be 30")