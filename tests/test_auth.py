from test_app import BaseTestCase, db
from app.models import User
from werkzeug.security import generate_password_hash

class AuthTestCase(BaseTestCase):
    def test_login_page(self):
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Login", response.data)

    def test_successful_login(self):
        # Create a user instance for testing login
        user = User(username='testuser', email='test@example.com')
        user.set_password('test123')
        db.session.add(user)
        db.session.commit()

        response = self.client.post('/login', data={
            'username': 'testuser',
            'password': 'test123'
        }, follow_redirects=True)

        self.assertIn(b"Welcome", response.data)

    def test_failed_login(self):
        response = self.client.post('/login', data={
            'username': 'wronguser',
            'password': 'wrongpassword'
        }, follow_redirects=True)
        
        self.assertIn(b"Invalid username or password", response.data)

    def test_successful_registration(self):
        response = self.client.post('/register', data={
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpassword123',
            'password2': 'newpassword123'  # Assume your form has a confirm password field
        }, follow_redirects=True)
        self.assertIn(b'Congratulations, you are now a registered user!', response.data)

    def test_logout(self):
        # Log in a user
        self.test_successful_login()
        
        # Now log out
        response = self.client.get('/logout', follow_redirects=True)
        self.assertIn(b"Home", response.data)
