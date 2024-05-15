import json
from flask import Blueprint, jsonify, render_template, request, current_app
import random
import os
from . import db
from app.forms import LoginForm, RegistrationForm
from flask import flash, redirect, url_for
from flask_login import current_user, login_user, logout_user, login_required
import sqlalchemy as sa
from app.models import User, QuizQuestion
from urllib.parse import urlsplit

main = Blueprint('main', __name__)

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