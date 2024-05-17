import os
from app import create_app, db
from app.models import User, Game
from config import Config

def add_test_data():
    app = create_app(Config)
    app.config['SCRIPT_MODE'] = True  # Set SCRIPT_MODE to True
    app.app_context().push()

    # Ensure database tables are created
    db.create_all()

    # Create users
    user1 = User(username='user1', email='user1@example.com')
    user1.set_password('password1')
    user2 = User(username='user2', email='user2@example.com')
    user2.set_password('password2')
    user3 = User(username='user3', email='user3@example.com')
    user3.set_password('password3')

    db.session.add_all([user1, user2, user3])
    db.session.commit()

    # Create game records
    game1 = Game(result=100, user_id=user1.id)
    game2 = Game(result=200, user_id=user2.id)
    game3 = Game(result=300, user_id=user3.id)
    game4 = Game(result=150, user_id=user1.id)  # Additional game record to test leaderboard

    db.session.add_all([game1, game2, game3, game4])
    db.session.commit()

    print("Data added successfully!")

if __name__ == "__main__":
    Config.SCRIPT_MODE = True  # Set SCRIPT_MODE before creating the app instance
    add_test_data()
