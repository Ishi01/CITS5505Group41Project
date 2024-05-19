from sqlalchemy import text
from test_app import BaseTestCase, db
from app.models import GameLeaderboard, User, UserGameHistory
from werkzeug.security import generate_password_hash
from bs4 import BeautifulSoup

class LeaderboardTestCase(BaseTestCase):
    def setUp(self):
        super().setUp()

        # Create users
        user1 = User(username='user1', email='user1@example.com')
        user1.set_password('password1')
        user2 = User(username='user2', email='user2@example.com')
        user2.set_password('password2')
        user3 = User(username='user3', email='user3@example.com')
        user3.set_password('password3')

        db.session.add_all([user1, user2, user3])
        db.session.commit()

        # Create user game histories
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
        history4 = UserGameHistory(
            user_id=user1.id,
            game_name='Quiz 3',
            correct_answers=15,
            attempts=5,
            completion_time=20.5
        )

        db.session.add_all([history1, history2, history3, history4])
        db.session.commit()

        # Print data from user_game_history for debugging
        histories = UserGameHistory.query.all()
        for history in histories:
            print(history)  # Debugging: Print each history entry

        # The session believes the VIEW is a TABLE. This isn't correct
        # You can see a proper testing of /leaderboard in the selenium testing complex
        db.session.execute(text("DROP TABLE IF EXISTS game_leaderboard"))
        db.session.commit()
        
        db.session.execute(text("""
        CREATE VIEW game_leaderboard AS
        WITH ranked_scores AS (
            SELECT
                ugh.user_id,
                u.username,
                ugh.game_name,
                ugh.correct_answers,
                ugh.attempts,
                ugh.completion_time,
                ROW_NUMBER() OVER (
                    PARTITION BY ugh.user_id, ugh.game_name
                    ORDER BY ugh.correct_answers DESC, ugh.attempts ASC, ugh.completion_time ASC
                ) as rank
            FROM
                user_game_history ugh
            JOIN
                user u ON ugh.user_id = u.id
        )
        SELECT
            user_id,
            username,
            game_name,
            correct_answers,
            attempts,
            completion_time
        FROM
            ranked_scores
        WHERE
            rank = 1
        ORDER BY
            game_name, correct_answers DESC, attempts ASC, completion_time ASC;
        """))
        db.session.commit()

    def tearDown(self):
        db.session.execute(text("DROP VIEW IF EXISTS game_leaderboard"))
        db.session.commit()
        super().tearDown()

    def test_leaderboard(self):
        response = self.client.get('/leaderboard')
        self.assertEqual(response.status_code, 200)

        # Parse the HTML
        soup = BeautifulSoup(response.data, 'html.parser')

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

            if game_name == 'Quiz 1' and username == 'user1':
                self.assertEqual(correct_answers, '10', "Correct answers for user1 in Quiz 1 should be 10")
                self.assertEqual(attempts, '1', "Attempts for user1 in Quiz 1 should be 1")
                self.assertEqual(completion_time, '5.5s', "Completion time for user1 in Quiz 1 should be 5.5s")

            if game_name == 'Quiz 2' and username == 'user2':
                self.assertEqual(correct_answers, '20', "Correct answers for user2 in Quiz 2 should be 20")
                self.assertEqual(attempts, '2', "Attempts for user2 in Quiz 2 should be 2")
                self.assertEqual(completion_time, '10.5s', "Completion time for user2 in Quiz 2 should be 10.5s")

            if game_name == 'Quiz 3' and username == 'user3':
                self.assertEqual(correct_answers, '30', "Correct answers for user3 in Quiz 3 should be 30")
                self.assertEqual(attempts, '3', "Attempts for user3 in Quiz 3 should be 3")
                self.assertEqual(completion_time, '15.5s', "Completion time for user3 in Quiz 3 should be 15.5s")

            if game_name == 'Quiz 3' and username == 'user1':
                self.assertEqual(correct_answers, '15', "Correct answers for user1 in Quiz 3 should be 15")
                self.assertEqual(attempts, '5', "Attempts for user1 in Quiz 3 should be 5")
                self.assertEqual(completion_time, '20.5s', "Completion time for user1 in Quiz 3 should be 20.5s")

        # Check GameLeaderboard view for debugging
        leaderboard_entries = db.session.query(GameLeaderboard).all()
        for entry in leaderboard_entries:
            print(entry)  # Debugging: Print each leaderboard entry
