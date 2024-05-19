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



    def test_register_login_create(self):
        # Register
        self.driver.get(self.localhost + "/register")
        self.assertTrue("<title>Register - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("creator")
        self.driver.find_element(By.NAME, "email").send_keys("creator@example.com")
        self.driver.find_element(By.NAME, "password").send_keys("creator")
        self.driver.find_element(By.NAME, "password2").send_keys("creator")
        self.driver.find_element(By.NAME, "submit").click()
        success_text = "Congratulations, you are now a registered user!"
        self.assertTrue(success_text in self.driver.page_source)
        
        # Log in
        self.driver.get(self.localhost + "login")
        self.assertTrue("<title>Sign In - Quick Quiz</title>" in self.driver.page_source)
        self.driver.find_element(By.NAME, "username").send_keys("creator")
        self.driver.find_element(By.NAME, "password").send_keys("creator")
        self.driver.find_element(By.NAME, "submit").click()
        self.assertTrue("Please Select a Quiz to Start" in self.driver.page_source)
        
        # Navigate to Create Game
        self.driver.get(self.localhost + "creategame")
        self.assertTrue("<title>Quick Quiz</title>" in self.driver.page_source)

        # Fill in the form to create a game
        self.driver.find_element(By.ID, "game_name").send_keys("Global Geography Quiz")
        self.driver.find_element(By.ID, "description").send_keys("Test your knowledge of global geography!")
        
        # Add questions
        self.driver.find_element(By.NAME, "question_text[]").send_keys("Where is Paris located?")
        self.driver.find_element(By.NAME, "location[]").send_keys("Europe")
        self.driver.find_element(By.NAME, "data[]").send_keys("France")
        
        # Explicit wait for the button to be clickable
        button = self.driver.find_element(By.ID, "addQuestion")
        self.driver.execute_script("arguments[0].click();", button)

        time.sleep(1)

        # Second question
        question_blocks = self.driver.find_elements(By.CLASS_NAME, "question_block")
        question_blocks[1].find_element(By.NAME, "question_text[]").send_keys("Which country is known as the Land of the Rising Sun?")
        question_blocks[1].find_element(By.NAME, "location[]").send_keys("East Asia")
        question_blocks[1].find_element(By.NAME, "data[]").send_keys("Japan")
        
        # Submit the form
        submit_button = self.driver.find_element(By.XPATH, "//button[@class='btn btn-primary' and text()='Submit Game']")
        self.driver.execute_script("arguments[0].click();", submit_button)

        time.sleep(1)

        print(self.driver.page_source)

        # Check for submission success
        self.assertTrue("created successfully!" in self.driver.page_source)




if __name__ == '__main__':
    unittest.main()