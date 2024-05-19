import json
import os
import shutil
import time
import unittest
import sys
import subprocess
from selenium import webdriver
from selenium.webdriver.common.by import By
from sqlalchemy import text
from app import create_app, db
from config import TestConfig, Config
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from flask_migrate import upgrade

class SeleniumTests(unittest.TestCase):
    localhost = "http://localhost:5000/"

    def setUp(self):
        # Create app with the test configuration
        self.testApp = create_app(Config)
        self.app_context = self.testApp.app_context()
        self.app_context.push()
        # Delete the database file if it exists
        db_path = os.path.join("./", 'app.db')
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"Deleted existing database at {db_path}")
        # Extract the database URI from the app configuration
        database_uri = self.testApp.config['SQLALCHEMY_DATABASE_URI']
        if database_uri.startswith("sqlite:///"):
            db_path = database_uri[10:]  # strip the sqlite:/// prefix
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"Deleted existing database at {db_path}")

        # After pushing the app context, run migrations
        upgrade()

        # Start the Flask server in a background thread
        python_executable = sys.executable
        self.server_process = subprocess.Popen([python_executable, "-m", "flask", "run"])

        # Set up Selenium WebDriver
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        self.driver = webdriver.Chrome(options=options)
        self.driver.get(self.localhost)

    def tearDown(self):
        self.driver.quit()
        self.server_process.terminate()
        self.server_process.wait()
        with self.app_context:
            db.session.remove()
            # Connect to the database and drop the view if it exists
            with db.engine.connect() as connection:
                connection.execute(text('DROP VIEW IF EXISTS game_leaderboard'))
                connection.execute(text('DROP TABLE IF EXISTS alembic_version'))
                connection.execute(text('DROP TABLE IF EXISTS sessions'))
            # Now attempt to drop all tables
            db.drop_all()
            db.engine.dispose()
            db_path = os.path.join("./", 'app.db')
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"Deleted existing database at {db_path}")

        self.app_context.pop()
        shutil.rmtree('./flask_session', ignore_errors=True)

    def test_home_page(self):
        self.assertTrue("<title>Home - Quick Quiz</title>" in self.driver.page_source)

    def test_worldmap_page(self):
        self.driver.get(self.localhost + "world")
        self.assertTrue("<title>World Map - Quick Quiz</title>" in self.driver.page_source)

    def test_periodictable_page(self):
        self.driver.get(self.localhost + "periodictable")
        self.assertTrue("<title>Periodic Table - Quick Quiz</title>" in self.driver.page_source)

    def test_register(self):
        # Navigate to the registration page
        self.driver.get(self.localhost + "/register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("testuser0")
        self.driver.find_element(By.NAME, "email").send_keys("testuser0@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "password2").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()
        time.sleep(2)
        self.assertTrue("Congratulations, you are now a registered user!" in self.driver.page_source)
        self.driver.close()

    def test_register_alembic_user(self):
        self.driver.get(self.localhost + "register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("alembic_user")
        self.driver.find_element(By.NAME, "email").send_keys("alembic_user@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("alembic")
        self.driver.find_element(By.NAME, "password2").send_keys("alembic")
        self.driver.find_element(By.NAME, "submit").click()
        time.sleep(2)
        self.assertTrue("Congratulations, you are now a registered user!" in self.driver.page_source)
        self.driver.close()
        
    def test_login_page_newuser(self):
        self.driver.get(self.localhost + "register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("newuser")
        self.driver.find_element(By.NAME, "email").send_keys("newuser@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "password2").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()

        self.driver.get(self.localhost + "login")
        self.assertTrue("<title>Sign In - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("newuser")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()
        self.assertTrue("Please Select a Quiz to Start" in self.driver.page_source)

    def test_manage_page(self):
        self.driver.get(self.localhost + "manage")
        self.assertTrue("Please log in to access this page" in self.driver.page_source)

    def test_user_page(self):
        self.driver.get(self.localhost + "/register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("uniqueuser")
        self.driver.find_element(By.NAME, "email").send_keys("uniqueuser@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "password2").send_keys("newpassword123")
        self.driver.find_element(By.NAME, "submit").click()
        success_text = "Congratulations, you are now a registered user!"
        self.assertTrue(success_text in self.driver.page_source)
        self.driver.get(self.localhost + "user/uniqueuser")
        self.assertTrue("<title>uniqueuser - Quick Quiz</title>" in self.driver.page_source)
        self.driver.close()


if __name__ == '__main__':
    unittest.main()