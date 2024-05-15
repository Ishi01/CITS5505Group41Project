from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db, login
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))

class User(UserMixin, db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True,
                                                unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True,
                                             unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))

    games: so.WriteOnlyMapped['Game'] = so.relationship(
        back_populates='player')

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
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id),
                                               index=True)

    player: so.Mapped[User] = so.relationship(back_populates='games')

    def __repr__(self):
        return '<Game {}>'.format(self.score)

class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'

    question_id: so.Mapped[int] = so.mapped_column(primary_key=True)
    category: so.Mapped[str] = so.mapped_column(sa.String(50), nullable=False)
    question_text: so.Mapped[str] = so.mapped_column(sa.String(200), nullable=False)
    answer: so.Mapped[str] = so.mapped_column(sa.String(200), nullable=False)

    def __repr__(self):
        return f'<QuizQuestion {self.question_text[:50]}...>'
