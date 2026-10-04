from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from prompt_builder import build_master_prompt
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
print("Flask جاهز للتشغيل")
CORS(app)

DEEPSEEK_API_KEY = "sk-0af591eff7be4addacbf7e29297c5d4e"
API_FOOTBALL_KEY = "090f30ede667fc392255ad703176cb79"
MAX_WORDS = 300

latest_stats = None
latest_events = None
fixture_id = 1098863  # ← الدوري اللبناني الممتاز

def truncate_text(text, max_words=300):
    words = text.split()
    return ' '.join(words[:max_words]) + '...' if len(words) > max_words else text

def get_match_data(fixture_id):
    headers = {"x-apisports-key": API_FOOTBALL_KEY}
    stats_url = f"https://v3.football.api-sports.io/fixtures/statistics?fixture={fixture_id}"
    events_url = f"https://v3.football.api-sports.io/fixtures/events?fixture={fixture_id}"

    stats_res = requests.get(stats_url, headers=headers)
    events_res = requests.get(events_url, headers=headers)

    if stats_res.status_code != 200 or events_res.status_code != 200:
        print("API Error")
        return None, None

    return stats_res.json()['response'], events_res.json()['response']

def update_match_data():
    global latest_stats, latest_events
    print("🔄 [مجدول] التحقق من حالة المباراة...")

    try:
        status_url = f"https://v3.football.api-sports.io/fixtures?id={fixture_id}"
        headers = {"x-apisports-key": API_FOOTBALL_KEY}
        res = requests.get(status_url, headers=headers)
        fixture_data = res.json().get("response", [])
        if not fixture_data:
            print("⚠ [مجدول] لم يتم العثور على المباراة.")
            return
        match_status = fixture_data[0]['fixture']['status']['short']
        print(f"📡 حالة المباراة الآن: {match_status}")

        if match_status not in ["1H", "2H", "LIVE"]:
            print("⏸ [مجدول] المباراة غير مباشرة. تم إيقاف التحديث التلقائي.")
            return
    except Exception as e:
        print(f"⚠ [مجدول] خطأ أثناء التحقق من حالة المباراة: {e}")
        return

    print("🔄 [مجدول] تحديث البيانات من API-Football...")
    stats, events = get_match_data(fixture_id)
    if stats or events:
        latest_stats = stats
        latest_events = events
        print("✅ [مجدول] تم تحديث الإحصائيات والأحداث.")
    else:
        print("⚠ [مجدول] لا توجد بيانات حالياً.")
@app.route('/')
def home():
    return 'السيرفر شغال تمام!'
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get("question")

    print("📦 fixture المستخدم:", fixture_id)
    stats = latest_stats
    events = latest_events

    print("🔍 [المطور] الإحصائيات:", "موجودة ✅" if stats else "❌ لا توجد إحصائيات")
    print("🎯 [المطور] الأحداث:", "موجودة ✅" if events else "❌ لا توجد أحداث")
    if events:
        print(f"📋 عدد الأحداث المخزنة: {len(events)}")
        for e in events[-3:]:
            print(f"🕒 الدقيقة {e['time']['elapsed']} - {e['team']['name']} - {e['player']['name']} - {e['type']} ({e['detail']})")

    if not stats and not events:
        return jsonify({
            "reply": "🚀 المباراة بدأت مؤخرًا، وراح توصلك البيانات والتحليل أول ما تبدأ الأحداث أو تتوفر الإحصائيات! ✨ تابع معنا 😉"
        })

    stats = stats or []
    events = events or []

    prompt = build_master_prompt(stats, events, question)

    headers_ds = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "أنت محلل رياضي ذكي، تجاوب المستخدم بناءً على تحليل بيانات المباراة فقط، وبأسلوب مختصر وواضح."},
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post("https://api.deepseek.com/v1/chat/completions", headers=headers_ds, json=payload)
        result = response.json()
        full_reply = result['choices'][0]['message']['content']
        reply = truncate_text(full_reply, MAX_WORDS)

        return jsonify({"reply": reply})

    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": "⚠️ حدث خطأ أثناء تحليل السؤال. جرب مرة ثانية بعد شوية."})

scheduler = BackgroundScheduler()
scheduler.add_job(func=update_match_data, trigger="interval", minutes=5)
scheduler.start()

def initial_update_if_live():
    try:
        status_url = f"https://v3.football.api-sports.io/fixtures?id={fixture_id}"
        headers = {"x-apisports-key": API_FOOTBALL_KEY}
        res = requests.get(status_url, headers=headers)
        fixture_data = res.json().get("response", [])
        if not fixture_data:
            print("⚠ لا يمكن تنفيذ أول تحديث: لم يتم العثور على المباراة.")
            return
        match_status = fixture_data[0]['fixture']['status']['short']
        if match_status in ["1H", "2H", "LIVE"]:
            print("🚀 أول تحديث لأن المباراة مباشرة")
            update_match_data()
        else:
            print(f"⏸ أول تحديث تم تجاهله لأن المباراة {match_status} وليست مباشرة")
    except Exception as e:
        print(f"⚠ فشل أول تحديث: {e}")

initial_update_if_live()

if __name__ == '__main__':
    print("تشغيل السيرفر الان")
    try:
        app.run(debug=True, port=200)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


        