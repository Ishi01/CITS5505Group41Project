import json
import os
import time

import sqlalchemy as sa
from flask import (
    Blueprint,
    current_app,
    jsonify,
    render_template,
    request,
    session,
)
from app.models import User, Game, UserGameHistory
from flask_session import Session
from flask_login import LoginManager


user = Blueprint('user', __name__)

import random
from flask import render_template, current_app
from os import path

@user.route('/user/<user_identifier>')
def user_profile(user_identifier):
    # Check if the identifier is an integer (user ID) or a string (username)
    if user_identifier.isdigit():
        user = User.query.get(int(user_identifier))
    else:
        user = User.query.filter_by(username=user_identifier).first()

    if user is None:
        return jsonify({'error': 'User not found'}), 404

    # Query the database for the user's game history
    game_history = (
        UserGameHistory.query
        .filter_by(user_id=user.id)
        .add_columns(
            UserGameHistory.game_name,
            UserGameHistory.correct_answers,
            UserGameHistory.attempts,
            UserGameHistory.completion_time
        )
        .all()
    )

    # Render the template with the user's data and game history
    return render_template('user.html', user=user, game_history=game_history)
