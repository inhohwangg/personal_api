# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

# 브라우저 드라이버 설정
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# 스크래핑할 URL
login_url = 'https://www.wehago.com/#/login'
schedule_url = 'https://www.wehago.com/#/schedule?defaultView=month'

# 로그인 페이지로 이동
driver.get(login_url)

# 페이지가 완전히 로드될 때까지 잠시 기다립니다.
time.sleep(2)

# ID와 비밀번호 입력
username = 'sk1440sk'  # 여기에 실제 ID를 입력하세요
password = '6481320p!'  # 여기에 실제 비밀번호를 입력하세요

# ID 입력
id_input = driver.find_element(By.ID, 'inputId')
id_input.send_keys(username)

# 비밀번호 입력
password_input = driver.find_element(By.ID, 'inputPw')
password_input.send_keys(password)

# 로그인 버튼 클릭
login_button = driver.find_element(By.XPATH, "//button/span[text()='로그인']")
login_button.click()

# 페이지가 완전히 로드될 때까지 잠시 기다립니다.
time.sleep(5)  # 대기 시간을 늘림

# 일정 페이지로 이동
driver.get(schedule_url)

# 페이지가 완전히 로드될 때까지 잠시 기다립니다.
WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, 'rbc-month-view')))

# 월 데이터 가져오기
month_year = driver.find_element(By.CLASS_NAME, 'rbc-toolbar-label').text
print('month_year : ', month_year)

# 일정 데이터를 포함하는 요소를 찾습니다.
days = driver.find_elements(By.CLASS_NAME, 'calendar_box')
print('days : ', len(days))

if not days:
    print("No days elements found.")
else:
    print(f"Found {len(days)} days elements.")

# Set to hold unique schedule data
event_titles = set()
schedule_data = []

for day in days:
    try:
        # 날짜 정보를 찾기 위해 다양한 방법 시도
        day_text = day.find_element(By.TAG_NAME, 'a').text
        day_date = f'{month_year}.{day_text}'
        print(f"Processing day: {day_date}")  # Debugging line to see the day being processed

        # 이벤트 요소들을 찾기
        events = day.find_elements(By.XPATH, ".//div[contains(@class, 'rbc-event-content')]")
        print(f"Found {len(events)} events for this day.")  # Debugging line to see number of events

        for event in events:
            event_title = event.text
            print(f"Found event: {event_title}")  # Debugging line to see event title
            if event_title and '[' in event_title:
                if event_title not in event_titles:
                    event_titles.add(event_title)
                    schedule_data.append({'date': day_date, 'event': event_title})
    except Exception as e:
        print(f"Error processing day: {e}")

print(schedule_data)  # 데이터 출력

# JSON 파일로 저장
with open('schedules.json', 'w', encoding='utf-8') as f:
    json.dump(schedule_data, f, ensure_ascii=False, indent=4)

# 브라우저 종료
driver.quit()

print("Scraping complete. Data saved to schedules.json")
