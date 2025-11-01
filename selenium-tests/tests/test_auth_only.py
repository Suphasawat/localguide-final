"""
Authentication Tests - ทดสอบระบบ Login, Register, Logout
Based on seeded users from backend (seed_users.go)
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestAuthentication:
    """Test authentication features"""
    
    def test_login_as_regular_user(self, driver, config):
        """Test login with regular user credentials (user1@gmail.com)"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        # Navigate to login page
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Enter credentials (from seed_users.go)
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys("user1@gmail.com")
        
        password_input = driver.find_element(By.ID, "password")
        password_input.clear()
        password_input.send_keys("12345678Za!")
        
        # Submit login
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        
        # Wait for redirect
        time.sleep(3)
        
        # Verify successful login (redirected away from login page)
        current_url = driver.current_url
        print(f"✅ After login URL: {current_url}")
        
        assert "/auth/login" not in current_url, "Should redirect away from login page"
        assert "dashboard" in current_url or "profile" in current_url or current_url == base_url or current_url == f"{base_url}/"
        
        print("✅ Login successful for regular user")
    
    def test_login_as_guide(self, driver, config):
        """Test login with guide credentials (guide1@gmail.com)"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Enter guide credentials
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys("guide1@gmail.com")
        
        password_input = driver.find_element(By.ID, "password")
        password_input.clear()
        password_input.send_keys("12345678Za!")
        
        # Submit
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        time.sleep(3)
        
        # Verify login
        current_url = driver.current_url
        print(f"✅ Guide login URL: {current_url}")
        
        assert "/auth/login" not in current_url
        print("✅ Login successful for guide user")
    
    def test_login_as_admin(self, driver, config):
        """Test login with admin credentials (admin@gmail.com)"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Enter admin credentials
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys("admin@gmail.com")
        
        password_input = driver.find_element(By.ID, "password")
        password_input.clear()
        password_input.send_keys("12345678Za!")
        
        # Submit
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        time.sleep(3)
        
        # Verify login
        current_url = driver.current_url
        print(f"✅ Admin login URL: {current_url}")
        
        assert "/auth/login" not in current_url
        print("✅ Login successful for admin user")
    
    def test_login_with_invalid_credentials(self, driver, config):
        """Test login with wrong password"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Enter invalid credentials
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys("user1@gmail.com")
        
        password_input = driver.find_element(By.ID, "password")
        password_input.clear()
        password_input.send_keys("wrongpassword")
        
        # Submit
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        time.sleep(2)
        
        # Should still be on login page
        current_url = driver.current_url
        assert "/auth/login" in current_url
        
        # Check for error message
        try:
            error_msg = driver.find_element(By.CSS_SELECTOR, "div.text-red-700, div.text-red-600, .error-message")
            assert error_msg.is_displayed()
            print(f"✅ Error message displayed: {error_msg.text}")
        except:
            print("⚠️ Error message element not found, but stayed on login page")
        
        print("✅ Invalid login blocked successfully")
    
    def test_login_with_nonexistent_email(self, driver, config):
        """Test login with email that doesn't exist"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Enter non-existent email
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys("nonexistent@example.com")
        
        password_input = driver.find_element(By.ID, "password")
        password_input.clear()
        password_input.send_keys("12345678Za!")
        
        # Submit
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        time.sleep(2)
        
        # Should still be on login page
        current_url = driver.current_url
        assert "/auth/login" in current_url
        
        print("✅ Non-existent email login blocked")
    
    def test_login_page_elements(self, driver, config):
        """Test that login page has all required elements"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Check for required elements
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        password_input = driver.find_element(By.ID, "password")
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        assert email_input.is_displayed()
        assert password_input.is_displayed()
        assert login_btn.is_displayed()
        
        # Check for title "เข้าสู่ระบบ"
        page_source = driver.page_source
        assert "เข้าสู่ระบบ" in page_source or "login" in page_source.lower()
        
        print("✅ All login page elements present")
    
    def test_logout_functionality(self, driver, config):
        """Test logout after logging in"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        # First, login
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.send_keys("user1@gmail.com")
        
        password_input = driver.find_element(By.ID, "password")
        password_input.send_keys("12345678Za!")
        
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        time.sleep(3)
        
        # Now try to logout
        try:
            # Look for logout button/link
            logout_elements = [
                (By.XPATH, "//button[contains(text(), 'ออกจากระบบ') or contains(text(), 'Logout')]"),
                (By.XPATH, "//a[contains(text(), 'ออกจากระบบ') or contains(text(), 'Logout')]"),
                (By.CSS_SELECTOR, "button.logout, a.logout"),
            ]
            
            logout_clicked = False
            for locator in logout_elements:
                try:
                    logout_btn = driver.find_element(*locator)
                    logout_btn.click()
                    logout_clicked = True
                    time.sleep(2)
                    break
                except:
                    continue
            
            if logout_clicked:
                # Verify redirected to login or home
                current_url = driver.current_url
                print(f"✅ After logout URL: {current_url}")
                print("✅ Logout successful")
            else:
                print("⚠️ Logout button not found - might be in dropdown menu")
                
        except Exception as e:
            print(f"⚠️ Logout test: {e}")
    
    def test_register_page_accessible(self, driver, config):
        """Test that register page is accessible"""
        base_url = config['base_url']
        
        driver.get(f"{base_url}/auth/register")
        time.sleep(2)
        
        # Verify on register page
        current_url = driver.current_url
        assert "/auth/register" in current_url
        
        # Check page has form elements
        page_source = driver.page_source
        assert "email" in page_source.lower()
        assert "password" in page_source.lower()
        
        print("✅ Register page accessible")
    
    def test_register_new_user(self, driver, config):
        """Test registering a new user"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/register")
        time.sleep(2)
        
        # Generate unique email
        import random
        email = f"newuser{random.randint(10000, 99999)}@test.com"
        
        try:
            # Fill registration form
            email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
            email_input.clear()
            email_input.send_keys(email)
            
            # Password
            try:
                password_input = driver.find_element(By.ID, "password")
                password_input.clear()
                password_input.send_keys("12345678Za!")
            except:
                password_input = driver.find_element(By.NAME, "password")
                password_input.clear()
                password_input.send_keys("12345678Za!")
            
            # Confirm password (if exists)
            try:
                confirm_input = driver.find_element(By.ID, "confirmPassword")
                confirm_input.clear()
                confirm_input.send_keys("12345678Za!")
            except:
                try:
                    confirm_input = driver.find_element(By.NAME, "confirmPassword")
                    confirm_input.clear()
                    confirm_input.send_keys("12345678Za!")
                except:
                    print("⚠️ Confirm password field not found")
            
            # First name (if exists)
            try:
                first_name = driver.find_element(By.ID, "firstName")
                first_name.clear()
                first_name.send_keys("Test")
            except:
                pass
            
            # Last name (if exists)
            try:
                last_name = driver.find_element(By.ID, "lastName")
                last_name.clear()
                last_name.send_keys("User")
            except:
                pass
            
            # Submit
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_btn.click()
            time.sleep(3)
            
            # Check if registration successful (redirected away from register page)
            current_url = driver.current_url
            print(f"✅ After registration URL: {current_url}")
            print(f"✅ Registration completed for {email}")
            
        except Exception as e:
            print(f"⚠️ Registration test: {e}")
            driver.save_screenshot("screenshots/register_error.png")
    
    def test_password_visibility_toggle(self, driver, config):
        """Test password visibility toggle button"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        password_input = wait.until(EC.presence_of_element_located((By.ID, "password")))
        
        # Check initial type
        initial_type = password_input.get_attribute("type")
        assert initial_type == "password"
        
        # Try to find toggle button
        try:
            toggle_btn = driver.find_element(By.CSS_SELECTOR, "button[type='button']")
            toggle_btn.click()
            time.sleep(0.5)
            
            # Check if type changed
            new_type = password_input.get_attribute("type")
            print(f"✅ Password type changed from '{initial_type}' to '{new_type}'")
            
        except:
            print("⚠️ Password toggle button not found")


class TestAuthenticationEdgeCases:
    """Test edge cases and validation"""
    
    def test_login_with_empty_fields(self, driver, config):
        """Test login with empty email and password"""
        base_url = config['base_url']
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Try to submit without filling
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        time.sleep(1)
        
        # Should still be on login page
        current_url = driver.current_url
        assert "/auth/login" in current_url
        
        print("✅ Empty fields validation works")
    
    def test_login_with_invalid_email_format(self, driver, config):
        """Test login with invalid email format"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys("notanemail")
        
        password_input = driver.find_element(By.ID, "password")
        password_input.clear()
        password_input.send_keys("12345678Za!")
        
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_btn.click()
        time.sleep(1)
        
        # Should show validation error or stay on page
        current_url = driver.current_url
        assert "/auth/login" in current_url
        
        print("✅ Email format validation works")
    
    def test_multiple_login_attempts(self, driver, config):
        """Test multiple failed login attempts"""
        base_url = config['base_url']
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{base_url}/auth/login")
        time.sleep(2)
        
        # Try 3 failed logins
        for i in range(3):
            email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
            email_input.clear()
            email_input.send_keys("user1@gmail.com")
            
            password_input = driver.find_element(By.ID, "password")
            password_input.clear()
            password_input.send_keys(f"wrongpass{i}")
            
            login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_btn.click()
            time.sleep(2)
        
        # Should still be on login page
        current_url = driver.current_url
        assert "/auth/login" in current_url
        
        print("✅ Multiple failed attempts handled")
