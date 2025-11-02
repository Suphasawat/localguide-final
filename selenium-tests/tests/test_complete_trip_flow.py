import pytest
import time
import random
from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import InvalidElementStateException
from selenium.webdriver.common.keys import Keys


def login_user(driver, config, email, password):
    """Helper: Login user และรอจน redirect เสร็จ"""
    base_url = config['base_url']
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

def test_post_trip(driver, config):
    """ทดสอบการสร้าง trip require ตั้งแต่ login จนถึง save สำเร็จ"""
    wait = WebDriverWait(driver, 15)
    base_url = config['base_url']
    
    # 1. Login
    login_user(driver, config, "user1@gmail.com", "12345678Za!")
    
    # 2. ไปหน้า create trip require
    driver.get(f"{base_url}/user/trip-requires/create")
    time.sleep(2)
    
    # 3. กรอกหัวข้อ (title)
    trip_title = f"Test Trip {datetime.now().strftime('%Y%m%d_%H%M%S')}"
    title_input = wait.until(EC.presence_of_element_located((By.NAME, "title")))
    title_input.clear()
    title_input.send_keys(trip_title)
    
    # 4. กรอกรายละเอียด (description)
    description_input = driver.find_element(By.NAME, "description")
    description_input.clear()
    description_input.send_keys("This is a test trip for automated testing")
    
    # 5. เลือกจังหวัด (province_id)
    province_select_el = wait.until(
        EC.presence_of_element_located((By.NAME, "province_id"))
    )
    province_select = Select(province_select_el)
    # เลือกตัวเลือกแรกที่ไม่ใช่ค่า "0" (รองรับชื่อจังหวัดเป็นไทย)
    for opt in province_select.options:
        val = opt.get_attribute("value")
        if val and val != "0":
            province_select.select_by_value(val)
            break
    time.sleep(0.5)
    
    # 6. กรอกราคาต่ำสุด และสูงสุด
    min_price_input = driver.find_element(By.NAME, "min_price")
    min_price_input.clear()
    min_price_input.send_keys("3000")
    
    max_price_input = driver.find_element(By.NAME, "max_price")
    max_price_input.clear()
    max_price_input.send_keys("8000")
    
    # 7. เลือกวันที่เริ่มต้น และสิ้นสุด
    start_date_input = driver.find_element(By.NAME, "start_date")
    start_date_input.clear()
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%d/%m/%Y")
    start_date_input.send_keys(tomorrow)
    
    end_date_input = driver.find_element(By.NAME, "end_date")
    end_date_input.clear()
    day_after = (datetime.now() + timedelta(days=3)).strftime("%d/%m/%Y")
    end_date_input.send_keys(day_after)
    
    # 8. กรอกจำนวนคน (group_size)
    group_size_input = driver.find_element(By.NAME, "group_size")
    group_size_input.clear()
    group_size_input.send_keys("4")
    
    # 9. เลือกคะแนนไกด์ขั้นต่ำ (optional)
    min_rating_select = Select(driver.find_element(By.NAME, "min_rating"))
    min_rating_select.select_by_value("4")
    
    # 10. กรอกความต้องการพิเศษ (optional)
    requirements_input = driver.find_element(By.NAME, "requirements")
    requirements_input.send_keys("ต้องการไกด์พูดภาษาอังกฤษได้")
    
    # 11. Submit form
    submit_btn = wait.until(EC.element_to_be_clickable(
        (By.CSS_SELECTOR, "button[type='submit']")
    ))
    submit_btn.click()
    time.sleep(3)
    
    # 12. Verify modal สำเร็จปรากฏ
    modal_title = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//h3[contains(text(), 'สำเร็จ')]")
    ))
    assert modal_title.is_displayed(), "Success modal should appear"
    
    # 13. Click ปุ่มไปที่รายการของฉัน
    go_to_list_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(text(), 'ไปที่รายการของฉัน')]")
    ))
    go_to_list_btn.click()
    time.sleep(2)
    
    # 14. Verify redirect to trip requires list
    assert "/user/trip-requires" in driver.current_url, "Should redirect to trip requires list page"

def test_guide_apply_to_trip(driver, config):
    """ทดสอบการที่ไกด์สมัครรับงาน trip require และสร้าง offer"""
    wait = WebDriverWait(driver, config.get('wait_time', 20))
    base_url = config['base_url']
    
    # 1. ไกอินด้วยบัญชีไกด์
    login_user(driver, config, "guide1@gmail.com", "12345678Za!")
    time.sleep(2)

    # 2. ไปที่หน้า trip requires list
    driver.get(f"{base_url}/guide/browse-trips")
    time.sleep(2)

    # 3. คลิกปุ่ม/ลิงก์ "เสนอแพ็กเกจ" (link ที่มี href '/guide/trip-offers/create')
    try:
        offer_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//a[contains(@href, '/guide/trip-offers/create') and contains(normalize-space(.), 'เสนอแพ็กเกจ')]")
        ))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", offer_btn)
        offer_btn.click()
    except Exception:
        link = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//a[contains(@href, '/guide/trip-offers/create')]")
        ))
        driver.execute_script("arguments[0].click();", link)

    # รอให้ URL เปลี่ยนเป็นหน้า create
    wait.until(EC.url_contains("/guide/trip-offers/create"))
    time.sleep(0.5)

    # 4. กรอกข้อมูลในฟอร์มเสนอแพ็กเกจ 
    title_input = wait.until(EC.presence_of_element_located((By.NAME, "title")))
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", title_input)
    try:
        title_input.clear()
    except Exception:
        pass
    title_input.send_keys("แพ็กเกจทัวร์ เชียงราย 3 วัน")

    # กรอก description (รองรับทั้ง send_keys และ JS fallback สำหรับ React controlled)
    desc_locator = (By.XPATH, "//textarea[@name='description' or contains(@placeholder,'อธิบายรายละเอียด')]")
    description_input = wait.until(EC.presence_of_element_located(desc_locator))
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", description_input)
    try:
        description_input.click()
        # ใช้ select-all + delete แทน clear() เผื่อ clear ล้มเหลวกับ React
        description_input.send_keys(Keys.COMMAND, "a")
        description_input.send_keys(Keys.DELETE)
        description_input.send_keys("รายละเอียดแพ็กเกจทัวร์ เชียงราย 3 วัน 2 คืน รวมที่พัก อาหาร ไกด์ท้องถิ่น")
    except Exception:
        # Fallback: ใช้ native setter + dispatchEvent ให้ React จับ onChange ได้
        driver.execute_script(
            "const el=arguments[0], val=arguments[1];"
            "const setter=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;"
            "setter.call(el, val);"
            "el.dispatchEvent(new Event('input', {bubbles:true}));",
            description_input,
            "รายละเอียดแพ็กเกจทัวร์ เชียงราย 3 วัน 2 คืน รวมที่พัก อาหาร ไกด์ท้องถิ่น"
        )

    # คลิกปุ่ม "ตรวจสอบและส่ง"
    try:
        submit_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit' and normalize-space(.)='ตรวจสอบและส่ง']")
        ))
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", submit_btn)
        submit_btn.click()
    except Exception:
        submit_btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[type='submit']")))
        driver.execute_script("arguments[0].click();", submit_btn)

    # ยืนยันใน Modal
    try:
        confirm_btn = WebDriverWait(driver, 10).until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(normalize-space(.),'ยืนยัน')]")
        ))
        driver.execute_script("arguments[0].click();", confirm_btn)
    except Exception:
        pass

    # รอผลลัพธ์: success overlay หรือ redirect ไปหน้ารายการข้อเสนอ
    WebDriverWait(driver, 15).until(
        EC.url_contains("/guide/my-offers")
    )

def test_user_apply_to_trip(driver, config):
    """ทดสอบการที่ผู้ใช้สมัครรับงาน trip offer ที่ไกด์สร้าง"""
    wait = WebDriverWait(driver, config.get('wait_time', 20))
    base_url = config['base_url']
    
    # 1. ผู้ใช้ล็อกอิน
    login_user(driver, config, "user1@gmail.com", "12345678Za!")

    # 2. ไปหน้ารายการข้อเสนอ
    driver.get(f"{base_url}/user/trip-requires")
    time.sleep(2)

    # 3. คลิกดูข้อเสนอ
    offer_link = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//a[contains(@href, '/user/trip-requires/') and contains(normalize-space(.), 'ดูข้อเสนอ')]")
    ))
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", offer_link)
    offer_link.click()
    time.sleep(2)

    # 4. คลิกปุ่ม "ยอมรับข้อเสนอ"
    accept_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(normalize-space(.), 'ยอมรับข้อเสนอ')]")
    ))
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", accept_btn)
    accept_btn.click()
    
    accept_confirm_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(normalize-space(.), 'ยืนยันยอมรับ')]")
    ))
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", accept_confirm_btn)
    accept_confirm_btn.click()
    time.sleep(3)

def test_pay_trip_offer(driver, config):
    """ทดสอบการที่ผู้ใช้ชำระเงินสำหรับ trip offer ที่ยอมรับแล้ว"""
    wait = WebDriverWait(driver, config.get('wait_time', 20))
    base_url = config['base_url']
    
    # 1. ผู้ใช้ล็อกอิน
    login_user(driver, config, "user1@gmail.com", "12345678Za!")

    # 2. ไปหน้าการจอง
    driver.get(f"{base_url}/trip-bookings")
    time.sleep(2)

    # 3. คลิกปุ่ม "ชำระเงิน"
    try:
        pay_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='ชำระเงิน']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", pay_btn)
        pay_btn.click()
    except Exception:
        # fallback: หาแบบ contains แล้วใช้ JS click
        pay_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ชำระเงิน')]")))
        driver.execute_script("arguments[0].click();", pay_btn)
    time.sleep(2)

    # 4. กรอกข้อมูลบัตรเครดิต 
    card_number = "4242 4242 4242 4242"
    card_exp = "12 / 34"   # หรือ "12/34" ขึ้นกับฟอร์ม
    card_cvc = "123"

    def fill_in_frame_input(locator):
        try:
            el = wait.until(EC.element_to_be_clickable(locator))
            driver.execute_script("arguments[0].scrollIntoView(true);", el)
            el.click()
            el.clear()
            el.send_keys(locator, Keys.NULL)  # noop to satisfy static analysis
            return el
        except Exception:
            return None

    # Try direct inputs first
    try:
        num_input = driver.find_element(By.ID, "Field-numberInput")
    except Exception:
        num_input = None

    # If not found, try locating inside any iframe
    original_handle = driver.current_window_handle
    if not num_input:
        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        for frame in iframes:
            try:
                driver.switch_to.frame(frame)
                try:
                    num_input = driver.find_element(By.ID, "Field-numberInput")
                    if num_input:
                        break
                except Exception:
                    # try common selectors used by card elements
                    try:
                        num_input = driver.find_element(By.CSS_SELECTOR, "input[name='number'], input[placeholder*='1234']")
                        if num_input:
                            break
                    except Exception:
                        pass
            finally:
                driver.switch_to.default_content()

        # if we found the iframe, switch into it again for typing
        if num_input:
            parent_iframe = frame
            driver.switch_to.frame(parent_iframe)

    # Fill card number (JS fallback for controlled inputs)
    if num_input:
        try:
            num_input.click()
            num_input.clear()
            num_input.send_keys(card_number)
        except Exception:
            driver.execute_script(
                "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input',{bubbles:true}));",
                num_input, card_number
            )

    # Fill expiry and cvc - try same iframe or global context
    try:
        # expiry
        try:
            exp_input = driver.find_element(By.NAME, "exp" )  # common name
        except Exception:
            try:
                exp_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='MM'], input[placeholder*='exp']")
            except Exception:
                exp_input = None

        if exp_input:
            try:
                exp_input.clear()
                exp_input.send_keys(card_exp)
            except Exception:
                driver.execute_script(
                    "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input',{bubbles:true}));",
                    exp_input, card_exp
                )

        # cvc
        try:
            cvc_input = driver.find_element(By.NAME, "cvc")
        except Exception:
            try:
                cvc_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='CVC'], input[placeholder*='CVV']")
            except Exception:
                cvc_input = None

        if cvc_input:
            try:
                cvc_input.clear()
                cvc_input.send_keys(card_cvc)
            except Exception:
                driver.execute_script(
                    "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input',{bubbles:true}));",
                    cvc_input, card_cvc
                )
    finally:
        # ensure we are back to main document
        driver.switch_to.default_content()

    time.sleep(0.5)

    # 5. กดปุ่ม "ชำระเงิน"
    try:
        pay_submit = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit' and normalize-space(.)='ชำระเงิน']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", pay_submit)
        pay_submit.click()
    except Exception:
        pay_submit = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ชำระเงิน')]")))
        driver.execute_script("arguments[0].click();", pay_submit)
    time.sleep(3)

def test_guide_arrive_trip(driver, config):
    """ทดสอบการที่ไกด์ทำเครื่องหมายการเดินทางว่าเริ่มต้นแล้ว"""
    wait = WebDriverWait(driver, config.get('wait_time', 20))
    base_url = config['base_url']
    
    # 1. ผู้ใช้ล็อกอิน
    login_user(driver, config, "user1@gmail.com", "12345678Za!")

    # 2. ไปหน้าการจอง
    driver.get(f"{base_url}/trip-bookings")
    time.sleep(2)

    # 3. กดปุ่ม "เริ่มการเดินทาง"
    try:
        start_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='ไปหน้าทริป']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", start_btn)
        start_btn.click()
    except Exception:
        # fallback: หาแบบ contains แล้วใช้ JS click
        start_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ไปหน้าทริป')]")))
        driver.execute_script("arguments[0].click();", start_btn)
    time.sleep(2)

    # 4. กดปุ่ม "ยืนยันไกด์มาถึงแล้ว"
    try:
        arrive_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='ยืนยันไกด์มาถึงแล้ว']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", arrive_btn)
        arrive_btn.click()
    except Exception:
        # fallback: หาแบบ contains แล้วใช้ JS click
        arrive_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ยืนยันไกด์มาถึงแล้ว')]")))
        driver.execute_script("arguments[0].click();", arrive_btn)
    
    try:
        final_confirm_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='ยืนยัน']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", final_confirm_btn)
        final_confirm_btn.click()
    except Exception:
        # fallback: หาแบบ contains แล้วใช้ JS click
        final_confirm_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ยืนยัน')]")))
        driver.execute_script("arguments[0].click();", final_confirm_btn)
    time.sleep(3)



    # 5.กดปุ่ม "ยืนยันทริปเสร็จสิ้น"
    try:
        complete_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='ยืนยันทริปเสร็จสิ้น']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", complete_btn)
        complete_btn.click()
    except Exception:
        # fallback: หาแบบ contains แล้วใช้ JS click
        complete_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ยืนยันทริปเสร็จสิ้น')]")))
        driver.execute_script("arguments[0].click();", complete_btn)
    time.sleep(3)

    # 6. กดปุ่ม "ยืนยัน"
    try:
        final_confirm_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='ยืนยัน']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", final_confirm_btn)
        final_confirm_btn.click()
    except Exception:
        # fallback: หาแบบ contains แล้วใช้ JS click
        final_confirm_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ยืนยัน')]")))
        driver.execute_script("arguments[0].click();", final_confirm_btn)
    time.sleep(3)

    # 7. กดปุ่ม "เขียนรีวิว"
    try:    
        review_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='เขียนรีวิว']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", review_btn)
        review_btn.click()
    except Exception:
        # fallback: หาแบบ contains แล้วใช้ JS click
        review_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'เขียนรีวิว')]")))
        driver.execute_script("arguments[0].click();", review_btn)
    time.sleep(2)

    # 8. กรอกรีวิว และให้คะแนน 5 ดาว
    try:
        wait.until(EC.url_contains("/reviews/create/"))
    except Exception:
        pass

    # กรอกข้อความรีวิว (React controlled -> ใช้ JS setter เป็น fallback)
    review_locator = (By.XPATH, "//textarea[contains(@placeholder,'เขียนรีวิวของคุณที่นี่')]")
    review_textarea = wait.until(EC.presence_of_element_located(review_locator))
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", review_textarea)
    review_text = "ทริปดีมาก ไกด์ดูแลดี รายละเอียดครบถ้วน ประทับใจมากครับ"

    try:
        review_textarea.clear()
        review_textarea.send_keys(review_text)
    except Exception:
        driver.execute_script(
            "const el=arguments[0], val=arguments[1];"
            "const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;"
            "setter.call(el, val);"
            "el.dispatchEvent(new Event('input',{bubbles:true}));"
            "el.dispatchEvent(new Event('change',{bubbles:true}));",
            review_textarea, review_text
        )

    # (ตัวเลือก) ติ๊กรีวิวแบบไม่ระบุชื่อ
    try:
        anon_checkbox = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//label[.//span[contains(.,'รีวิวแบบไม่ระบุชื่อ')]]//input[@type='checkbox']")))
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", anon_checkbox)
        if not anon_checkbox.is_selected():
            driver.execute_script("arguments[0].click();", anon_checkbox)
    except Exception:
        pass

    # ส่งรีวิว
    try:
        submit_review_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@type='submit' and normalize-space(.)='ส่งรีวิว']")))
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", submit_review_btn)
        submit_review_btn.click()
    except Exception:
        submit_review_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(normalize-space(.),'ส่งรีวิว')]")))
        driver.execute_script("arguments[0].click();", submit_review_btn)

    # alert ยืนยันจาก frontend
    try:
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        driver.switch_to.alert.accept()
    except Exception:
        pass

    # รอ redirect กลับหน้า booking detail
    wait.until(EC.url_contains("/trip-bookings/"))
    time.sleep(1)