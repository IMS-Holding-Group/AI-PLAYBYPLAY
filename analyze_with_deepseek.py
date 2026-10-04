# -*- coding: utf-8 -*-
import requests

# --- مفاتيحك ---
API_FOOTBALL_KEY  = "090f30ede667fc392255ad703176cb79"
DEEPSEEK_API_KEY = "sk-0af591eff7be4addacbf7e29297c5d4e"
FIXTURE_ID = 878076  # ← ID لمباراة جارية أو منتهية

# --- روابط API ---
headers = { "x-apisports-key": API_FOOTBALL_KEY  }
url_stats = f"https://v3.football.api-sports.io/fixtures/statistics?fixture={FIXTURE_ID}"
url_events = f"https://v3.football.api-sports.io/fixtures/events?fixture={FIXTURE_ID}"

# --- جلب بيانات المباراة ---
def get_match_data():
    res_stats = requests.get(url_stats, headers=headers)
    res_events = requests.get(url_events, headers=headers)
    if res_stats.status_code != 200 or res_events.status_code != 200:
        return None, None
    return res_stats.json()['response'], res_events.json()['response']

# --- تجهيز البرومبت ---
def build_prompt(stats, events, question):
    prompt = "بيانات المباراة:\n\n"
    for team_stat in stats:
        team = team_stat['team']['name']
        prompt += f"\n{team}:\n"
        for item in team_stat['statistics']:
            prompt += f"- {item['type']}: {item['value']}\n"

    prompt += "\nأحداث المباراة:\n"
    for e in events:
        minute = e['time']['elapsed']
        team = e['team']['name']
        player = e['player']['name']
        type_ = e['type']
        detail = e['detail']
        prompt += f"- الدقيقة {minute}: {team} - {player} - {type_} ({detail})\n"

    prompt += f"\nسؤال المستخدم: {question}\n"
    prompt += "الرجاء تقديم تحليل ذكي مبني فقط على هذه البيانات."
    return prompt

# --- إرسال إلى DeepSeek ---
def send_to_deepseek(prompt):
    url = "https://api.deepseek.com/v1/chat/completions"
    headers_ds = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "أنت محلل رياضي محترف. جاوب فقط بناء على البيانات."},
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers_ds, json=payload)
    return response.json()

# --- تشغيل تفاعلي ---
question = input("اكتب سؤالك عن المباراة: ")

stats, events = get_match_data()
if not stats or not events:
    print("فشل في جلب البيانات من API-Football.")
else:
    prompt = build_prompt(stats, events, question)
    response = send_to_deepseek(prompt)
    print("\nرد الأخطبوط:\n")
    print(response['choices'][0]['message']['content'])


