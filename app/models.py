from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db, login
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy.types import JSON

@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))

class User(UserMixin, db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    is_admin: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False, nullable=False)
    games: so.WriteOnlyMapped['Game'] = so.relationship(back_populates='player')

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Game(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    result: so.Mapped[int] = so.mapped_column(sa.Integer)
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc))
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey('user.id'),
                                               index=True)

    player: so.Mapped['User'] = so.relationship('User', back_populates='games')

    def __repr__(self):
        return '<Game {}>'.format(self.result)

class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'
    question_id: so.Mapped[int] = so.mapped_column(primary_key=True)
    game_name: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)
    description: so.Mapped[str] = so.mapped_column(sa.String(255), nullable=False)
    user_id = sa.Column(sa.Integer, sa.ForeignKey('user.id'), nullable=False)
    category: so.Mapped[str] = so.mapped_column(sa.String(50), nullable=False)
    question_text: so.Mapped[str] = so.mapped_column(sa.String(200), nullable=False)
    answer: so.Mapped[list] = so.mapped_column(sa.Text, nullable=False)
    location: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=True)

    def __repr__(self):
        return f'<QuizQuestion "{self.game_name}": {self.question_text[:50]}...>'

class UserGameHistory(db.Model):
    __tablename__ = 'user_game_history'
    id: so.Mapped[int] = so.mapped_column(primary_key=True, autoincrement=True)
    user_id: so.Mapped[int] = so.mapped_column(sa.Integer, sa.ForeignKey('user.id'), nullable=False)
    game_name: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)
    correct_answers: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)
    attempts: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)
    completion_time: so.Mapped[float] = so.mapped_column(sa.REAL, nullable=False)
    
    def __repr__(self):
        return f'<UserGameHistory User "{self.user_id}" Game "{self.game_name}" Correct "{self.correct_answers}">'
    
class GameLeaderboard(db.Model):
    __tablename__ = 'game_leaderboard'
    __table_args__ = (
        sa.PrimaryKeyConstraint('user_id', 'game_name'),
    )
    user_id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64))
    game_name: so.Mapped[str] = so.mapped_column(sa.String(100), primary_key=True)
    correct_answers: so.Mapped[int] = so.mapped_column(sa.Integer)
    attempts: so.Mapped[int] = so.mapped_column(sa.Integer)
    completion_time: so.Mapped[float] = so.mapped_column(sa.REAL)

    def __repr__(self):
        return f'<GameLeaderboard User "{self.username}" Game "{self.game_name}" Correct "{self.correct_answers}">'
