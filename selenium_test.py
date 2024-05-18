import time
import unittest
import subprocess
from flask_sqlalchemy import SQLAlchemy
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from app import create_app, db
from config import TestConfig

class SeleniumTests(unittest.TestCase):
    localhost = "http://localhost:5000/"

    def setUp(self):
        self.testApp = create_app(TestConfig)
        self.app_context = self.testApp.app_context()
        self.app_context.push()
        db.create_all()

        # Start Flask server as a subprocess
        #self.server_process = subprocess.Popen(["python", "-m", "flask", "run"])

        # Headless Selenium WebDriver setup
        self.driver = webdriver.Chrome()
        time.sleep(2)  # Add a 2-second delay
        self.driver.get(self.localhost)

    def tearDown(self):
        self.driver.quit()
        #self.server_process.terminate()
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # Example test method
    def test_home_page(self):
        self.assertTrue("<title>Home - Quick Quiz</title>" in self.driver.page_source)

if __name__ == '__main__':
    unittest.main()