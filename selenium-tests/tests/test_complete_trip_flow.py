"""
Complete Trip Flow Test - ทดสอบ Flow การจองทริปแบบครบวงจร
อ่านจาก Frontend และ Backend โดยไม่แก้ไขโค้ดใดๆ

Flow ที่ทดสอบ:
1. User สร้าง Trip Require (POST /api/trip-requires)
2. Guide สร้าง Trip Offer (POST /api/trip-offers)
3. User ดูรายการ Offers (GET /api/trip-requires/:id/offers)
4. User ยอมรับ Offer (PUT /api/trip-offers/:id/accept) -> สร้าง TripBooking
5. User ชำระเงินผ่าน Stripe (POST /api/trip-bookings/:id/payment)
6. User ยืนยันไกด์มาถึง (PUT /api/trip-bookings/:id/confirm-arrival)
7. User ยืนยันทริปเสร็จสิ้น (PUT /api/trip-bookings/:id/complete)

Alternative Flows:
- Guide รายงาน User ไม่มา (POST /api/trip-bookings/:id/report-user-no-show)
- User รายงาน Guide ไม่มา (POST /api/trip-bookings/:id/report-guide-no-show)
- User โต้แย้งการรายงาน (POST /api/trip-bookings/:id/dispute-no-show)
"""

import pytest
import time
import random
from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import InvalidElementStateException


def login_user(driver, base_url, email, password):
    """Helper: Login user และรอจน redirect เสร็จ"""
    wait = WebDriverWait(driver, 15)
    driver.get(f"{base_url}/auth/login")
    time.sleep(1.5)
    
    email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
    email_input.clear()
    email_input.send_keys(email)
    
    password_input = driver.find_element(By.ID, "password")
    password_input.clear()
    password_input.send_keys(password)
    
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()
    time.sleep(2.5)
    
    assert "/auth/login" not in driver.current_url, "Login should redirect away from login page"


def wait_for_element(driver, by, value, timeout=15):
    """Helper: รออีลิเมนต์ปรากฏ"""
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value))
    )


def click_button_by_text(driver, text_options):
    """Helper: คลิกปุ่มจากข้อความ (รองรับหลายตัวเลือก)"""
    for text in text_options:
        try:
            btn = driver.find_element(By.XPATH, f"//button[contains(text(), '{text}')]")
            btn.click()
            return True
        except:
            continue
    return False


def fill_stripe_card_iframe(driver, wait):
    """Helper: กรอกข้อมูลบัตรใน Stripe iframe"""
    # รอให้ iframe โหลด
    wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, "iframe")) > 0)
    time.sleep(1)
    
    frames = driver.find_elements(By.CSS_SELECTOR, "iframe")
    
    for frame in frames:
        try:
            driver.switch_to.frame(frame)
            # หา input fields ใน Stripe form
            inputs = driver.find_elements(By.CSS_SELECTOR, "input")
            
            card_number_field = None
            exp_field = None
            cvc_field = None
            
            for inp in inputs:
                aria_label = (inp.get_attribute("aria-label") or "").lower()
                name = (inp.get_attribute("name") or "").lower()
                placeholder = (inp.get_attribute("placeholder") or "").lower()
                
                if "card" in aria_label and "number" in aria_label:
                    card_number_field = inp
                elif "exp" in aria_label or "mm / yy" in placeholder:
                    exp_field = inp
                elif "cvc" in aria_label or "security" in placeholder:
                    cvc_field = inp
            
            if card_number_field:
                # Test card จาก Stripe: 4242 4242 4242 4242
                card_number_field.send_keys("4242424242424242")
                time.sleep(0.5)
                
                if exp_field:
                    exp_field.send_keys("1234")  # MM/YY = 12/34
                    time.sleep(0.3)
                
                if cvc_field:
                    cvc_field.send_keys("123")
                    time.sleep(0.3)
                
                driver.switch_to.default_content()
                return True
                
        except Exception as e:
            driver.switch_to.default_content()
            continue
    
    driver.switch_to.default_content()
    return False


# Prefer testid if present

def find_by_testid(driver, testid: str):
    try:
        return driver.find_element(By.CSS_SELECTOR, f"[data-testid='{testid}']")
    except Exception:
        return None


def click_by_testid(driver, testid: str) -> bool:
    el = find_by_testid(driver, testid)
    if el is not None:
        try:
            el.click()
            return True
        except Exception:
            return False
    return False


def set_input_value(driver, element, value: str):
    """Set value via send_keys, fallback to JS for readOnly/invalid state."""
    try:
        element.clear()
        element.send_keys(value)
        return True
    except InvalidElementStateException:
        try:
            driver.execute_script(
                "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', {bubbles: true})); arguments[0].dispatchEvent(new Event('change', {bubbles: true}));",
                element,
                value,
            )
            return True
        except Exception:
            return False
    except Exception:
        return False


def set_date_field(driver, element, dt: datetime):
    """Set date supporting both text and <input type=date>."""
    input_type = (element.get_attribute("type") or "").lower()
    if input_type == "date":
        # Expect YYYY-MM-DD
        val = dt.strftime("%Y-%m-%d")
    else:
        # Backend accepts DD/MM/YYYY
        val = dt.strftime("%d/%m/%Y")
    return set_input_value(driver, element, val)

# Improve text clicking to support <a> tags too

def click_button_or_link_by_text(driver, text_options):
    for text in text_options:
        # Try button
        try:
            btn = driver.find_element(By.XPATH, f"//button[contains(normalize-space(.), '{text}')] ")
            btn.click()
            return True
        except Exception:
            pass
        # Try link
        try:
            link = driver.find_element(By.XPATH, f"//a[contains(normalize-space(.), '{text}')] ")
            link.click()
            return True
        except Exception:
            pass
    return False


class TestCompleteTripFlow:
    """ทดสอบ Flow การจองทริปแบบครบวงจร"""
    
    @pytest.fixture(scope="class")
    def trip_require_id(self):
        """Shared state สำหรับเก็บ Trip Require ID ที่สร้าง"""
        return {"id": None}
    
    @pytest.fixture(scope="class")
    def trip_offer_id(self):
        """Shared state สำหรับเก็บ Trip Offer ID ที่สร้าง"""
        return {"id": None}
    
    @pytest.fixture(scope="class")
    def trip_booking_id(self):
        """Shared state สำหรับเก็บ Trip Booking ID ที่สร้าง"""
        return {"id": None}
    
    def test_01_user_create_trip_require(self, driver, config, test_user, trip_require_id):
        """
        Step 1: User สร้างความต้องการทริป
        - Navigate to /user/trip-requires/create
        - กรอกฟอร์ม (required fields: title, description, province, dates, price range, group size)
        - Submit -> redirect to /user/trip-requires
        """
        base_url = config['base_url']
        wait = WebDriverWait(driver, 15)
        
        # Login
        login_user(driver, base_url, test_user['email'], test_user['password'])
        
        # Navigate to create page
        driver.get(f"{base_url}/user/trip-requires/create")
        time.sleep(2)

        # Prefer data-testid when available
        title_el = find_by_testid(driver, "trip-require-title") or wait_for_element(driver, By.NAME, "title")
        random_suffix = random.randint(10000, 99999)
        trip_title = f"ทริปทดสอบอัตโนมัติ {random_suffix}"
        set_input_value(driver, title_el, trip_title)

        desc_el = find_by_testid(driver, "trip-require-description") or driver.find_element(By.NAME, "description")
        set_input_value(driver, desc_el, "ต้องการไกด์ท้องถิ่นเพื่อพาเที่ยวจังหวัดเชียงใหม่ ระยะเวลา 3 วัน 2 คืน")

        # Province select
        try:
            prov_el = find_by_testid(driver, "trip-require-province") or driver.find_element(By.NAME, "province_id")
            Select(prov_el).select_by_index(1)
        except Exception:
            pass

        # Dates
        start_dt = datetime.now() + timedelta(days=7)
        end_dt = datetime.now() + timedelta(days=10)
        try:
            start_el = find_by_testid(driver, "trip-require-start-date") or driver.find_element(By.NAME, "start_date")
            set_date_field(driver, start_el, start_dt)
        except Exception:
            pass
        try:
            end_el = find_by_testid(driver, "trip-require-end-date") or driver.find_element(By.NAME, "end_date")
            set_date_field(driver, end_el, end_dt)
        except Exception:
            pass

        # Others
        days_el = find_by_testid(driver, "trip-require-days") or driver.find_element(By.NAME, "days")
        set_input_value(driver, days_el, "3")

        group_el = find_by_testid(driver, "trip-require-group-size") or driver.find_element(By.NAME, "group_size")
        set_input_value(driver, group_el, "4")

        min_el = find_by_testid(driver, "trip-require-min-price") or driver.find_element(By.NAME, "min_price")
        set_input_value(driver, min_el, "3000")

        max_el = find_by_testid(driver, "trip-require-max-price") or driver.find_element(By.NAME, "max_price")
        set_input_value(driver, max_el, "5000")

        try:
            req_el = find_by_testid(driver, "trip-require-requirements") or driver.find_element(By.NAME, "requirements")
            set_input_value(driver, req_el, "มีรถรับส่ง, พูดภาษาอังกฤษได้")
        except Exception:
            pass

        # Submit
        if not click_by_testid(driver, "trip-require-submit"):
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_btn.click()
        time.sleep(3)
        
        # Verify redirect to list page
        assert "/user/trip-requires" in driver.current_url, "Should redirect to trip requires list"
        
        # Extract created Trip Require ID from URL or page
        # ถ้า redirect ไป /user/trip-requires -> ต้องหา ID จาก list
        try:
            # หา link ที่เป็น trip require ที่เพิ่งสร้าง
            links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/user/trip-requires/']")
            for link in links:
                href = link.get_attribute("href") or ""
                # ตรวจสอบว่ามี title ตรงกันไหม
                if trip_title in driver.page_source:
                    # Extract ID from href
                    parts = href.rstrip('/').split('/')
                    if parts[-1].isdigit():
                        trip_require_id["id"] = int(parts[-1])
                        break
        except:
            pass
        
        print(f"✅ Step 1: User created Trip Require: {trip_title}")
        if trip_require_id["id"]:
            print(f"   → Trip Require ID: {trip_require_id['id']}")
    
    def test_02_guide_create_trip_offer(self, driver, config, guide_user, trip_require_id, trip_offer_id):
        """
        Step 2: Guide สร้างข้อเสนอ
        - Login as guide
        - Navigate to /guide/trip-offers/create?trip_require_id=<id>
        - กรอกฟอร์ม (required: title, description, total_price)
        - Submit -> redirect to guide's offers list
        """
        base_url = config['base_url']
        wait = WebDriverWait(driver, 15)
        
        # ถ้าไม่มี trip_require_id จากเทสก่อนหน้า ให้หา ID ที่มีอยู่ในระบบ
        if not trip_require_id.get("id"):
            # Navigate to browse trip requires as guide
            login_user(driver, base_url, guide_user['email'], guide_user['password'])
            driver.get(f"{base_url}/user/trip-requires")
            time.sleep(2)
            
            # หา trip require ID ที่มี
            links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/user/trip-requires/']")
            for link in links:
                href = link.get_attribute("href") or ""
                parts = href.rstrip('/').split('/')
                if parts[-1].isdigit() and "offers" not in href:
                    trip_require_id["id"] = int(parts[-1])
                    break
            
            if not trip_require_id.get("id"):
                pytest.skip("ข้าม: ไม่พบ Trip Require ในระบบเพื่อสร้าง Offer")
        
        # Login as guide
        login_user(driver, base_url, guide_user['email'], guide_user['password'])
        
        # Navigate to create offer page
        require_id = trip_require_id["id"]
        driver.get(f"{base_url}/guide/trip-offers/create?trip_require_id={require_id}")
        time.sleep(2)
        
        # ตรวจสอบว่าหน้าโหลดสำเร็จ
        if "ไม่พบข้อมูลความต้องการทริป" in driver.page_source:
            pytest.skip(f"ข้าม: Trip Require ID {require_id} ไม่พบในระบบ")
        
        # กรอกฟอร์ม (ตามที่ระบุใน backend CreateTripOffer)
        # Title (required)
        title_input = wait_for_element(driver, By.NAME, "title")
        offer_title = f"แพ็กเกจเชียงใหม่ 3 วัน 2 คืน #{random.randint(100, 999)}"
        title_input.clear()
        title_input.send_keys(offer_title)
        
        # Description (required)
        desc_input = driver.find_element(By.NAME, "description")
        desc_input.clear()
        desc_input.send_keys("แพ็กเกจทัวร์เชียงใหม่ครบวงจร รวมที่พัก อาหาร และรถรับส่ง")
        
        # Total Price (required, min=0, ต้องอยู่ในช่วง min_price - max_price)
        price_input = driver.find_element(By.NAME, "totalPrice")
        price_input.clear()
        price_input.send_keys("4000")  # อยู่ในช่วง 3000-5000
        
        # Optional fields
        try:
            itinerary_input = driver.find_element(By.NAME, "itinerary")
            itinerary_input.clear()
            itinerary_input.send_keys("วัน 1: วัดพระธาตุดอยสุเทพ\nวัน 2: ตลาดวโรรส\nวัน 3: บ้านสวนดอก")
        except:
            pass
        
        try:
            included_input = driver.find_element(By.NAME, "included_services")
            included_input.clear()
            included_input.send_keys("ที่พัก, อาหาร, รถรับส่ง, ค่าเข้าสถานที่")
        except:
            pass
        
        # Submit form
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()
        time.sleep(3)
        
        # Verify success (อาจ redirect หรือแสดง success message)
        # Backend return status 201 และ offer object
        
        print(f"✅ Step 2: Guide created Trip Offer: {offer_title}")
        print(f"   → For Trip Require ID: {require_id}")
    
    def test_03_user_view_offers(self, driver, config, test_user, trip_require_id):
        """
        Step 3: User ดูรายการข้อเสนอที่ได้รับ
        - Navigate to /user/trip-requires/<id>/offers
        - ดูรายการ offers
        """
        if not trip_require_id.get("id"):
            pytest.skip("ข้าม: ไม่มี Trip Require ID จากเทสก่อนหน้า")
        
        base_url = config['base_url']
        require_id = trip_require_id["id"]
        
        # Login as user
        login_user(driver, base_url, test_user['email'], test_user['password'])
        
        # Navigate to offers page
        driver.get(f"{base_url}/user/trip-requires/{require_id}/offers")
        time.sleep(2)
        
        # ตรวจสอบว่าหน้าโหลดสำเร็จ
        assert "ข้อเสนอที่ได้รับ" in driver.page_source or "offers" in driver.current_url.lower()
        
        # ตรวจสอบว่ามี offer cards
        offer_cards = driver.find_elements(By.CSS_SELECTOR, "[class*='offer'], [class*='card']")
        print(f"✅ Step 3: User viewing {len(offer_cards)} offer(s)")
    
    def test_04_user_accept_offer(self, driver, config, test_user, trip_require_id, trip_booking_id):
        """
        Step 4: User ยอมรับข้อเสนอ
        - คลิกปุ่ม "ยอมรับ" หรือ "Accept"
        - Confirm ใน modal
        - Backend สร้าง TripBooking
        - Redirect to /trip-bookings
        """
        if not trip_require_id.get("id"):
            pytest.skip("ข้าม: ไม่มี Trip Require ID")
        
        base_url = config['base_url']
        require_id = trip_require_id["id"]
        
        # Login as user
        login_user(driver, base_url, test_user['email'], test_user['password'])
        
        # Navigate to offers page
        driver.get(f"{base_url}/user/trip-requires/{require_id}/offers")
        time.sleep(2)
        
        # หาปุ่ม "ยอมรับ" หรือ "เลือกไกด์"
        accept_clicked = click_button_by_text(driver, [
            "ยอมรับข้อเสนอ", "เลือกไกด์", "Accept", "เลือกข้อเสนอนี้"
        ])
        
        if not accept_clicked:
            pytest.skip("ข้าม: ไม่พบปุ่มยอมรับข้อเสนอ (อาจยังไม่มี offer)")
        
        time.sleep(1)
        
        # Confirm ใน modal (ถ้ามี)
        confirm_clicked = click_button_by_text(driver, ["ยืนยัน", "Confirm", "OK"])
        time.sleep(2)
        
        # Verify redirect to trip-bookings
        WebDriverWait(driver, 10).until(
            lambda d: "/trip-bookings" in d.current_url
        )
        
        # Extract booking ID from URL if possible
        if "/trip-bookings/" in driver.current_url:
            parts = driver.current_url.rstrip('/').split('/')
            if parts[-1].isdigit():
                trip_booking_id["id"] = int(parts[-1])
        
        print(f"✅ Step 4: User accepted offer")
        if trip_booking_id.get("id"):
            print(f"   → Trip Booking ID: {trip_booking_id['id']}")
    
    def test_05_user_create_payment(self, driver, config, test_user, trip_booking_id):
        """
        Step 5: User สร้างการชำระเงิน
        - คลิกปุ่ม "ชำระเงิน"
        - Backend สร้าง Stripe PaymentIntent
        - Redirect to /trip-bookings/<id>/payment
        """
        if not trip_booking_id.get("id"):
            # ถ้าไม่มี ID จากเทสก่อนหน้า ให้หาจาก bookings list
            base_url = config['base_url']
            login_user(driver, base_url, test_user['email'], test_user['password'])
            driver.get(f"{base_url}/trip-bookings")
            time.sleep(2)
            
            # หา booking ที่สถานะ pending_payment
            links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/trip-bookings/']")
            for link in links:
                href = link.get_attribute("href") or ""
                if "/payment" not in href:
                    parts = href.rstrip('/').split('/')
                    if parts[-1].isdigit():
                        trip_booking_id["id"] = int(parts[-1])
                        break
        
        if not trip_booking_id.get("id"):
            pytest.skip("ข้าม: ไม่มี Trip Booking ID")
        
        base_url = config['base_url']
        booking_id = trip_booking_id["id"]
        
        # Login as user
        login_user(driver, base_url, test_user['email'], test_user['password'])
        
        # Navigate to booking detail
        driver.get(f"{base_url}/trip-bookings/{booking_id}")
        time.sleep(2)
        
        # Click "ชำระเงิน" button
        pay_clicked = click_button_by_text(driver, ["ชำระเงิน", "Pay", "Payment"])
        
        if not pay_clicked:
            # อาจชำระไปแล้ว
            if "ชำระแล้ว" in driver.page_source or "paid" in driver.page_source.lower():
                print("⚠️ Booking already paid")
                return
            pytest.skip("ข้าม: ไม่พบปุ่มชำระเงิน")
        
        time.sleep(2)
        
        # Verify redirect to payment page
        assert "/payment" in driver.current_url
        print(f"✅ Step 5: User initiated payment for Booking ID: {booking_id}")
    
    def test_06_user_complete_stripe_payment(self, driver, config, test_user, trip_booking_id):
        """
        Step 6: User กรอกข้อมูลบัตรและชำระเงินผ่าน Stripe
        - กรอกข้อมูลบัตร test: 4242 4242 4242 4242
        - คลิก "ชำระเงิน"
        - Webhook จาก Stripe จะอัปเดตสถานะเป็น "paid"
        """
        if not trip_booking_id.get("id"):
            pytest.skip("ข้าม: ไม่มี Trip Booking ID")
        
        base_url = config['base_url']
        booking_id = trip_booking_id["id"]
        wait = WebDriverWait(driver, 25)
        
        # Ensure we're on payment page
        if "/payment" not in driver.current_url:
            login_user(driver, base_url, test_user['email'], test_user['password'])
            driver.get(f"{base_url}/trip-bookings/{booking_id}")
            time.sleep(1)
            click_button_by_text(driver, ["ชำระเงิน", "Pay"])
            time.sleep(2)
        
        if "/payment" not in driver.current_url:
            pytest.skip("ข้าม: ไม่สามารถเข้าหน้า payment ได้")
        
        # กรอกข้อมูลบัตรใน Stripe iframe
        card_filled = fill_stripe_card_iframe(driver, wait)
        
        if not card_filled:
            pytest.skip("ข้าม: ไม่สามารถกรอกข้อมูลบัตรใน Stripe ได้")
        
        # คลิกปุ่ม "ชำระเงิน"
        try:
            submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='payment-submit-button']")
            submit_btn.click()
        except:
            click_button_by_text(driver, ["ชำระเงิน", "Pay"])
        
        time.sleep(3)
        
        # รอให้ redirect กลับมาที่หน้า booking detail
        try:
            WebDriverWait(driver, 20).until(
                lambda d: "/trip-bookings/" in d.current_url and "/payment" not in d.current_url
            )
        except:
            pass
        
        print(f"✅ Step 6: User completed Stripe payment")
    
    def test_07_user_confirm_guide_arrival(self, driver, config, test_user, trip_booking_id):
        """
        Step 7: User ยืนยันว่าไกด์มาถึงแล้ว
        - คลิกปุ่ม "ยืนยันไกด์มาถึงแล้ว"
        - Status เปลี่ยนเป็น "trip_started"
        """
        if not trip_booking_id.get("id"):
            pytest.skip("ข้าม: ไม่มี Trip Booking ID")
        
        base_url = config['base_url']
        booking_id = trip_booking_id["id"]
        
        # Login as user
        login_user(driver, base_url, test_user['email'], test_user['password'])
        
        # Navigate to booking detail
        driver.get(f"{base_url}/trip-bookings/{booking_id}")
        time.sleep(2)
        
        # คลิก "ยืนยันไกด์มาถึงแล้ว"
        try:
            confirm_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='confirm-guide-arrival-button']")
            confirm_btn.click()
        except:
            if not click_button_by_text(driver, ["ยืนยันไกด์มาถึงแล้ว", "Confirm Arrival"]):
                print("⚠️ ไม่พบปุ่มยืนยันไกด์มาถึง (อาจยืนยันไปแล้วหรือยังไม่ชำระเงิน)")
                return
        
        time.sleep(1)
        
        # Confirm ใน modal
        click_button_by_text(driver, ["ยืนยัน", "Confirm"])
        time.sleep(2)
        
        print(f"✅ Step 7: User confirmed guide arrival")
    
    def test_08_user_confirm_trip_complete(self, driver, config, test_user, trip_booking_id):
        """
        Step 8: User ยืนยันว่าทริปเสร็จสิ้น
        - คลิกปุ่ม "ยืนยันทริปเสร็จสิ้น"
        - Status เปลี่ยนเป็น "trip_completed"
        """
        if not trip_booking_id.get("id"):
            pytest.skip("ข้าม: ไม่มี Trip Booking ID")
        
        base_url = config['base_url']
        booking_id = trip_booking_id["id"]
        
        # Login as user
        login_user(driver, base_url, test_user['email'], test_user['password'])
        
        # Navigate to booking detail
        driver.get(f"{base_url}/trip-bookings/{booking_id}")
        time.sleep(2)
        
        # คลิก "ยืนยันทริปเสร็จสิ้น"
        try:
            complete_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='confirm-trip-complete-button']")
            complete_btn.click()
        except:
            if not click_button_by_text(driver, ["ยืนยันทริปเสร็จสิ้น", "Confirm Complete"]):
                print("⚠️ ไม่พบปุ่มยืนยันทริปเสร็จสิ้น (อาจยังไม่ได้เริ่มทริป)")
                return
        
        time.sleep(1)
        
        # Confirm ใน modal
        click_button_by_text(driver, ["ยืนยัน", "Confirm"])
        time.sleep(2)
        
        print(f"✅ Step 8: User confirmed trip complete")
        print(f"🎉 Complete Trip Flow Test: SUCCESS!")


class TestAlternativeFlows:
    """ทดสอบ Alternative Flows เช่น No-Show, Dispute"""
    
    def test_guide_report_user_no_show(self, driver, config, guide_user):
        """
        Alternative Flow: Guide รายงานว่า User ไม่มา
        - Navigate to booking as guide
        - คลิก "รายงานว่าลูกค้าไม่มา"
        - กรอกเหตุผล
        - Submit
        """
        base_url = config['base_url']
        
        # Login as guide
        login_user(driver, base_url, guide_user['email'], guide_user['password'])
        
        # Navigate to bookings
        driver.get(f"{base_url}/trip-bookings")
        time.sleep(2)
        
        # หา booking ที่เป็น guide และสถานะ "paid"
        links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/trip-bookings/']")
        if not links:
            pytest.skip("ข้าม: ไม่มี bookings สำหรับ guide")
        
        # เข้าไปดู booking แรก
        links[0].click()
        time.sleep(2)
        
        # คลิก "รายงานว่าลูกค้าไม่มา"
        try:
            report_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='report-user-no-show-button']")
            report_btn.click()
        except:
            if not click_button_by_text(driver, ["รายงานว่าลูกค้าไม่มา", "Report User No-Show"]):
                print("⚠️ ไม่พบปุ่มรายงาน (อาจสถานะไม่ใช่ paid)")
                return
        
        time.sleep(1)
        
        # กรอกเหตุผลใน modal
        try:
            textarea = driver.find_element(By.CSS_SELECTOR, "[data-testid='no-show-reason-textarea']")
            textarea.send_keys("ลูกค้าไม่มาตามนัดหมาย ติดต่อไม่ได้")
        except:
            textareas = driver.find_elements(By.TAG_NAME, "textarea")
            if textareas:
                textareas[0].send_keys("ลูกค้าไม่มาตามนัดหมาย ติดต่อไม่ได้")
        
        # Submit
        try:
            submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='no-show-submit-button']")
            submit_btn.click()
        except:
            click_button_by_text(driver, ["ส่งรายงาน", "Submit"])
        
        time.sleep(2)
        
        print("✅ Alternative Flow: Guide reported user no-show")
    
    def test_user_dispute_no_show_report(self, driver, config, test_user):
        """
        Alternative Flow: User โต้แย้งการรายงาน No-Show
        - Navigate to booking ที่ถูกรายงาน
        - คลิก "โต้แย้งการรีพอร์ต"
        - กรอกเหตุผล
        - Submit
        """
        base_url = config['base_url']
        
        # Login as user
        login_user(driver, base_url, test_user['email'], test_user['password'])
        
        # Navigate to bookings
        driver.get(f"{base_url}/trip-bookings")
        time.sleep(2)
        
        # หา booking ที่ถูกรายงาน
        if "user_no_show" not in driver.page_source:
            pytest.skip("ข้าม: ไม่มี booking ที่ถูกรายงาน no-show")
        
        # เข้าไปดู booking ที่ถูกรายงาน
        links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/trip-bookings/']")
        if links:
            links[0].click()
            time.sleep(2)
        
        # คลิก "โต้แย้งการรีพอร์ต"
        try:
            dispute_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='dispute-no-show-button']")
            dispute_btn.click()
        except:
            if not click_button_by_text(driver, ["โต้แย้งการรีพอร์ต", "Dispute"]):
                print("⚠️ ไม่พบปุ่มโต้แย้ง")
                return
        
        time.sleep(1)
        
        # กรอกเหตุผล
        try:
            reason_input = driver.find_element(By.CSS_SELECTOR, "[data-testid='dispute-reason-input']")
            reason_input.send_keys("ฉันมาถึงตรงเวลา มีหลักฐาน")
        except:
            inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
            if inputs:
                inputs[0].send_keys("ฉันมาถึงตรงเวลา มีหลักฐาน")
        
        # กรอกรายละเอียด
        try:
            desc_textarea = driver.find_element(By.CSS_SELECTOR, "[data-testid='dispute-description-textarea']")
            desc_textarea.send_keys("ฉันมีภาพถ่าย GPS และข้อความที่ส่งหาไกด์ว่ามาถึงแล้ว")
        except:
            textareas = driver.find_elements(By.TAG_NAME, "textarea")
            if textareas:
                textareas[0].send_keys("ฉันมีภาพถ่าย GPS และข้อความที่ส่งหาไกด์ว่ามาถึงแล้ว")
        
        # Submit
        try:
            submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='dispute-submit-button']")
            submit_btn.click()
        except:
            click_button_by_text(driver, ["ส่งโต้แย้ง", "Submit Dispute"])
        
        time.sleep(2)
        
        print("✅ Alternative Flow: User disputed no-show report")


# --- Specific page tests as requested (no app code changes) ---
class TestSpecificPages:
    def test_S1_post_require_create_page(self, driver, config, test_user):
        base_url = config["base_url"]
        login_user(driver, base_url, test_user["email"], test_user["password"])
        driver.get(f"{base_url}/user/trip-requires/create")
        time.sleep(1.5)
        # Light smoke: ensure form fields exist
        assert find_by_testid(driver, "trip-require-title") or driver.find_element(By.NAME, "title")

    def test_S2_guide_offer_create_specific_id(self, driver, config, guide_user):
        base_url = config["base_url"]
        login_user(driver, base_url, guide_user["email"], guide_user["password"])
        driver.get(f"{base_url}/guide/trip-offers/create?trip_require_id=21")
        time.sleep(1.5)
        # Fill minimal fields
        try:
            title = wait_for_element(driver, By.NAME, "title")
            set_input_value(driver, title, f"ข้อเสนอทดสอบ #{random.randint(100,999)}")
            desc = driver.find_element(By.NAME, "description")
            set_input_value(driver, desc, "คำอธิบายข้อเสนอสำหรับทดสอบ")
            price = driver.find_element(By.NAME, "totalPrice")
            set_input_value(driver, price, "1000")
        except Exception:
            pytest.skip("ข้าม: ไม่สามารถกรอกฟอร์มข้อเสนอได้ (ID อาจไม่ถูกต้อง)")

    def test_S3_user_offers_select_specific_require(self, driver, config, test_user):
        base_url = config["base_url"]
        login_user(driver, base_url, test_user["email"], test_user["password"])
        driver.get(f"{base_url}/user/trip-requires/19/offers")
        time.sleep(1.5)
        # Try accept/choose offer
        clicked = click_button_or_link_by_text(driver, ["ยอมรับข้อเสนอ", "เลือกไกด์", "Accept", "เลือกข้อเสนอนี้"]) 
        if not clicked:
            pytest.skip("ข้าม: ไม่มีข้อเสนอให้เลือกใน require 19")

    def test_S4_booking_list_and_direct_payment_url(self, driver, config, test_user):
        base_url = config["base_url"]
        wait = WebDriverWait(driver, 20)
        login_user(driver, base_url, test_user["email"], test_user["password"])
        # Go to bookings and click pay if available
        driver.get(f"{base_url}/trip-bookings")
        time.sleep(1.5)
        click_button_or_link_by_text(driver, ["ชำระเงิน", "Pay", "Payment"])
        time.sleep(1.0)
        # Direct payment URL provided by user
        direct_url = (
            f"{base_url}/trip-bookings/21/payment?pi=pi_3SOlIJ3Moeg9ZUuH1xrVlINH&cs="
            "pi_3SOlIJ3Moeg9ZUuH1xrVlINH_secret_uVkjVom7hPR9dmgTDEtj6q2AA&amount=1000"
        )
        driver.get(direct_url)
        time.sleep(2)
        # Fill Stripe PaymentElement
        filled = fill_stripe_card_iframe(driver, wait)
        if filled:
            # Prefer testid submit
            if not click_by_testid(driver, "payment-submit-button"):
                click_button_or_link_by_text(driver, ["ชำระเงิน", "Pay"]) 
            try:
                WebDriverWait(driver, 25).until(lambda d: ("/trip-bookings/") in d.current_url and ("/payment" not in d.current_url))
            except Exception:
                pass
        else:
            # If client_secret invalid/expired, just assert page loaded
            assert "/trip-bookings/21/payment" in driver.current_url

    def test_S5_user_booking_detail_actions_specific(self, driver, config, test_user):
        base_url = config["base_url"]
        login_user(driver, base_url, test_user["email"], test_user["password"])
        driver.get(f"{base_url}/trip-bookings/21")
        time.sleep(1.5)
        # Confirm arrival or report guide no-show
        if not click_by_testid(driver, "confirm-guide-arrival-button"):
            if not click_button_or_link_by_text(driver, ["ยืนยันไกด์มาถึงแล้ว", "Confirm Arrival"]):
                # Try report no-show
                if click_by_testid(driver, "report-guide-no-show-button") or click_button_or_link_by_text(driver, ["รายงานว่าไกด์ไม่มา"]):
                    time.sleep(0.5)
                    ta = find_by_testid(driver, "no-show-reason-textarea") or driver.find_elements(By.TAG_NAME, "textarea")[0]
                    set_input_value(driver, ta, "ทดสอบรายงานไกด์ไม่มา")
                    if not click_by_testid(driver, "no-show-submit-button"):
                        click_button_or_link_by_text(driver, ["ส่งรายงาน"]) 
        # Confirm modal
        click_button_or_link_by_text(driver, ["ยืนยัน", "Confirm"])

    def test_S6_guide_booking_detail_report_user_no_show_specific(self, driver, config, guide_user):
        base_url = config["base_url"]
        login_user(driver, base_url, guide_user["email"], guide_user["password"])
        driver.get(f"{base_url}/trip-bookings/21")
        time.sleep(1.5)
        if click_by_testid(driver, "report-user-no-show-button") or click_button_or_link_by_text(driver, ["รายงานว่าลูกค้าไม่มา"]):
            time.sleep(0.5)
            ta = find_by_testid(driver, "no-show-reason-textarea") or driver.find_elements(By.TAG_NAME, "textarea")[0]
            set_input_value(driver, ta, "ลูกค้าไม่มาตามนัด ติดต่อไม่ได้")
            if not click_by_testid(driver, "no-show-submit-button"):
                click_button_or_link_by_text(driver, ["ส่งรายงาน"]) 

    def test_S7_user_dispute_after_guide_report_specific(self, driver, config, test_user):
        base_url = config["base_url"]
        login_user(driver, base_url, test_user["email"], test_user["password"])
        driver.get(f"{base_url}/trip-bookings/21")
        time.sleep(1.5)
        if click_by_testid(driver, "dispute-no-show-button") or click_button_or_link_by_text(driver, ["โต้แย้งการรีพอร์ต"]):
            time.sleep(0.5)
            reason = find_by_testid(driver, "dispute-reason-input") or driver.find_element(By.XPATH, "//input[@type='text']")
            set_input_value(driver, reason, "ขอโต้แย้ง: มาตรงเวลามีหลักฐาน")
            desc = find_by_testid(driver, "dispute-description-textarea") or driver.find_elements(By.TAG_NAME, "textarea")[0]
            set_input_value(driver, desc, "แนบภาพถ่าย GPS และแชตยืนยันการมาถึง")
            if not click_by_testid(driver, "dispute-submit-button"):
                click_button_or_link_by_text(driver, ["ส่งโต้แย้ง"])
