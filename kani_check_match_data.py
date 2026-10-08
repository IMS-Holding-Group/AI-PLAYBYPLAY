# -*- coding: utf-8 -*-
import requests
import json

# --- مفاتيحك ---
API_KEY = ""  # ← ضع مفتاح API-Football هنا
FIXTURE_ID = 878076  # ← مثال: مباراة الفتح والاتحاد

# --- إعداد headers ---
headers = { "x-apisports-key": API_KEY }

# --- روابط API-Football ---
url_stats = f"https://v3.football.api-sports.io/fixtures/statistics?fixture={FIXTURE_ID}"
url_events = f"https://v3.football.api-sports.io/fixtures/events?fixture={FIXTURE_ID}"

# --- جلب البيانات ---
res_stats = requests.get(url_stats, headers=headers)
res_events = requests.get(url_events, headers=headers)

# --- التحقق من نجاح الطلبات ---
if res_stats.status_code != 200 or res_events.status_code != 200:
    print("\nفشل في جلب البيانات. تأكد من المفتاح و Fixture ID.")
    exit()

# --- استخراج البيانات من JSON ---
stats = res_stats.json()['response']
events = res_events.json()['response']

# --- طباعة الإحصائيات ---
print("\nإحصائيات المباراة:")
for team_stat in stats:
    print(f"\n{team_stat['team']['name']}:")
    for stat in team_stat['statistics']:
        print(f"- {stat['type']}: {stat['value']}")

# --- طباعة الأحداث ---
print("\nأحداث المباراة:")
for e in events:
    minute = e['time']['elapsed']
    team = e['team']['name']
    player = e['player']['name']
    type_ = e['type']
    detail = e['detail']
    print(f"- الدقيقة {minute}: {team} - {player} - {type_} ({detail})")


