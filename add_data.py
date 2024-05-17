import os
from app import create_app, db
from app.models import User, UserGameHistory
from config import Config
from sqlalchemy.exc import IntegrityError

def add_test_data():
    app = create_app(Config)
    app.config['SCRIPT_MODE'] = True  # Set SCRIPT_MODE to True
    app.app_context().push()

    # Create users if they don't exist
    users_data = [
        {'username': 'user1', 'email': 'user1@example.com', 'password': 'password1'},
        {'username': 'user2', 'email': 'user2@example.com', 'password': 'password2'},
        {'username': 'user3', 'email': 'user3@example.com', 'password': 'password3'}
    ]

    users = []
    for user_data in users_data:
        user = User.query.filter_by(username=user_data['username']).first()
        if not user:
            user = User(username=user_data['username'], email=user_data['email'])
            user.set_password(user_data['password'])
            db.session.add(user)
        users.append(user)
    
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"An error occurred while adding users: {e}")

    # Retrieve users from the database to get their IDs
    user1 = User.query.filter_by(username='user1').first()
    user2 = User.query.filter_by(username='user2').first()
    user3 = User.query.filter_by(username='user3').first()

    # Create game history data for 'World Geography'
    game_histories_data = [
        {'user_id': user1.id, 'game_name': 'World Geography', 'correct_answers': 15, 'attempts': 20, 'completion_time': 300.5},
        {'user_id': user2.id, 'game_name': 'World Geography', 'correct_answers': 12, 'attempts': 18, 'completion_time': 350.0},
        {'user_id': user3.id, 'game_name': 'World Geography', 'correct_answers': 20, 'attempts': 25, 'completion_time': 280.0},
        {'user_id': user1.id, 'game_name': 'World Geography', 'correct_answers': 10, 'attempts': 15, 'completion_time': 400.0},
        {'user_id': user2.id, 'game_name': 'World Geography', 'correct_answers': 18, 'attempts': 22, 'completion_time': 310.0},
    ]

    for history_data in game_histories_data:
        history = UserGameHistory(**history_data)
        db.session.add(history)

    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"An error occurred while adding game histories: {e}")

    print("Data added successfully!")

if __name__ == "__main__":
    add_test_data()
