import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Test configuration"""
    
    # URLs
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080')
    
    # Browser settings
    HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'
    BROWSER = os.getenv('BROWSER', 'chrome')
    
    # Timeouts
    IMPLICIT_WAIT = int(os.getenv('IMPLICIT_WAIT', '10'))
    EXPLICIT_WAIT = int(os.getenv('EXPLICIT_WAIT', '20'))
    PAGE_LOAD_TIMEOUT = int(os.getenv('PAGE_LOAD_TIMEOUT', '30'))
    
    # Screenshots
    SCREENSHOT_ON_FAILURE = os.getenv('SCREENSHOT_ON_FAILURE', 'true').lower() == 'true'
    SCREENSHOT_DIR = os.getenv('SCREENSHOT_DIR', 'screenshots')
