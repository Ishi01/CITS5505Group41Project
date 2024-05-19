import json
from flask import Blueprint, jsonify, render_template, request, current_app
import random
import os
from . import db
from app.forms import LoginForm, RegistrationForm
from flask import flash, redirect, url_for
from flask_login import current_user, login_user, logout_user, login_required
import sqlalchemy as sa
from .models import User, Game, QuizQuestion, GameLeaderboard
from urllib.parse import urlsplit
from flask import jsonify
from sqlalchemy.sql import func
from collections import defaultdict


main = Blueprint('main', __name__)

#Starting route, sends to homepage labeled index.html
@main.route('/')
@main.route('/index')
def index():
    return render_template('index.html', title='Home')

@main.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(
            sa.select(User).where(User.username == form.username.data))
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password,please try again.')
            flash('If you are a new user, please register first.')
            return redirect(url_for('main.login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or urlsplit(next_page).netloc != '':
            next_page = url_for('main.index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@main.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@main.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('main.login'))
    return render_template('register.html', title='Register', form=form)

@main.route('/get-rankings')
def get_rankings():
    # Query the game_leaderboard view for rankings
    rankings = db.session.query(
        GameLeaderboard.username,
        GameLeaderboard.game_name,
        GameLeaderboard.correct_answers,
        GameLeaderboard.attempts,
        GameLeaderboard.completion_time
    ).order_by(
        GameLeaderboard.game_name,
        GameLeaderboard.correct_answers.desc(),
        GameLeaderboard.attempts.asc(),
        GameLeaderboard.completion_time.asc()
    ).all()

    # Group rankings by game_name
    grouped_rankings = defaultdict(list)
    for ranking in rankings:
        grouped_rankings[ranking.game_name].append({
            'username': ranking.username,
            'correct_answers': ranking.correct_answers,
            'attempts': ranking.attempts,
            'completion_time': ranking.completion_time
        })

    return jsonify(grouped_rankings)

@main.route('/leaderboard')
def leaderboard():
    # Query the game_leaderboard view for rankings
    rankings = db.session.query(
        GameLeaderboard.username,
        GameLeaderboard.game_name,
        GameLeaderboard.correct_answers,
        GameLeaderboard.attempts,
        GameLeaderboard.completion_time
    ).order_by(
        GameLeaderboard.game_name,
        GameLeaderboard.correct_answers.desc(),
        GameLeaderboard.attempts.asc(),
        GameLeaderboard.completion_time.asc()
    ).all()

    # Group rankings by game_name
    grouped_rankings = defaultdict(list)
    for ranking in rankings:
        grouped_rankings[ranking.game_name].append({
            'username': ranking.username,
            'correct_answers': ranking.correct_answers,
            'attempts': ranking.attempts,
            'completion_time': str(round(ranking.completion_time, 2)) + "s"
        })

    return render_template('leaderboard.html', grouped_rankings=grouped_rankings, enumerate=enumerate, title='Leaderboard')