import os
from app import create_app, db
from app.models import User, UserGameHistory
from config import Config

def add_test_data():
    app = create_app(Config)
    app.config['SCRIPT_MODE'] = True  # Set SCRIPT_MODE to True
    app.app_context().push()

    # Create users
    user1 = User(username='user1', email='user1@example.com')
    user1.set_password('password1')
    user2 = User(username='user2', email='user2@example.com')
    user2.set_password('password2')
    user3 = User(username='user3', email='user3@example.com')
    user3.set_password('password3')

    db.session.add_all([user1, user2, user3])
    db.session.commit()

    # Retrieve users from the database to get their IDs
    user1 = User.query.filter_by(username='user1').first()
    user2 = User.query.filter_by(username='user2').first()
    user3 = User.query.filter_by(username='user3').first()

    # Create game history data for 'World Geography'
    game_histories = [
        UserGameHistory(user_id=user1.id, game_name='World Geography', correct_answers=15, attempts=20, completion_time=300.5),
        UserGameHistory(user_id=user2.id, game_name='World Geography', correct_answers=12, attempts=18, completion_time=350.0),
        UserGameHistory(user_id=user3.id, game_name='World Geography', correct_answers=20, attempts=25, completion_time=280.0),
        UserGameHistory(user_id=user1.id, game_name='World Geography', correct_answers=10, attempts=15, completion_time=400.0),
        UserGameHistory(user_id=user2.id, game_name='World Geography', correct_answers=18, attempts=22, completion_time=310.0),
    ]

    db.session.add_all(game_histories)
    db.session.commit()

    print("Data added successfully!")

if __name__ == "__main__":
    add_test_data()
