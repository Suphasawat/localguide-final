import pytest
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from config import Config

@pytest.fixture(scope="function")
def driver():
    """Create and configure Chrome WebDriver instance"""
    
    chrome_options = Options()
    
    if Config.HEADLESS:
        chrome_options.add_argument('--headless')
    
    # Additional Chrome options
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    # Set timeouts
    driver.implicitly_wait(Config.IMPLICIT_WAIT)
    driver.set_page_load_timeout(Config.PAGE_LOAD_TIMEOUT)
    
    yield driver
    
    # Teardown
    driver.quit()

@pytest.fixture(scope="function")
def screenshot_on_failure(driver, request):
    """Take screenshot on test failure"""
    yield
    
    if Config.SCREENSHOT_ON_FAILURE and request.node.rep_call.failed:
        # Create screenshot directory if not exists
        os.makedirs(Config.SCREENSHOT_DIR, exist_ok=True)
        
        # Generate screenshot filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        test_name = request.node.name
        screenshot_path = os.path.join(
            Config.SCREENSHOT_DIR, 
            f"{test_name}_{timestamp}.png"
        )
        
        # Save screenshot
        driver.save_screenshot(screenshot_path)
        print(f"\nScreenshot saved: {screenshot_path}")

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to access test result for screenshot on failure"""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)

def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption(
        "--headed",
        action="store_true",
        default=False,
        help="Run tests in headed mode (browser visible)"
    )

@pytest.fixture(scope="session", autouse=True)
def configure_headless(request):
    """Configure headless mode based on command line option"""
    if request.config.getoption("--headed"):
        Config.HEADLESS = False
