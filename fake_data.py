from sqlalchemy import create_engine, MetaData, Table, insert
from faker import Faker
import random
from datetime import datetime, timedelta

# Configure your database URL
DATABASE_URL = "sqlite:///app.db"

# Create a database engine
engine = create_engine(DATABASE_URL)

# Initialize Faker
fake = Faker()

# Create and reflect metadata
metadata = MetaData()
metadata.reflect(bind=engine)

# Define the tables from the reflected metadata
user_table = metadata.tables['user']
game_table = metadata.tables['game']
quiz_questions_table = metadata.tables['quiz_questions']

# Generate fake data for the user table
def create_fake_users(n):
    return [{
        'username': fake.user_name(),
        'email': fake.email(),
        'password_hash': fake.sha256(),
    } for _ in range(n)]

# Generate fake data for the game table
def create_fake_games(users, n):
    return [{
        'result': random.randint(0, 100),
        'timestamp': datetime.now() - timedelta(days=random.randint(0, 30)),
        'user_id': random.choice(users)['id'],
    } for _ in range(n)]

# Generate fake data for the quiz questions table
def create_fake_questions(users, n):
    categories = ['Science', 'History', 'Geography', 'Entertainment', 'Sports']
    return [{
        'category': random.choice(categories),
        'question_text': fake.sentence(),
        'answer': fake.word(),
        'location': fake.city(),
        'game_name': fake.word(),
        'description': fake.text(),
        'user_id': random.choice(users)['id'],
    } for _ in range(n)]

# Insert fake data into the database
with engine.connect() as conn:
    trans = conn.begin()  # Start a transaction

    # Create users and insert them
    fake_users = create_fake_users(10)
    conn.execute(insert(user_table), fake_users)
    
    # Retrieve users to get their IDs, converting rows to dictionaries
    users = [row._asdict() for row in conn.execute(user_table.select()).fetchall()]

    # Create games and insert them
    fake_games = create_fake_games(users, 50)
    conn.execute(insert(game_table), fake_games)

    # Create quiz questions and insert them
    fake_questions = create_fake_questions(users, 20)
    conn.execute(insert(quiz_questions_table), fake_questions)

    trans.commit()  # Commit the transaction
    print("Fake data inserted successfully!")
