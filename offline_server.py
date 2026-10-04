from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from prompt_builder import build_master_prompt

app = Flask(__name__)
CORS(app)

DEEPSEEK_API_KEY = "sk-0af591eff7be4addacbf7e29297c5d4e"
API_FOOTBALL_KEY = "090f30ede667fc392255ad703176cb79"

def call_deepseek(prompt):
    res = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
        json={
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000
        }
    )
    return res.json()["choices"][0]["message"]["content"]

@app.route("/offline-summary", methods=["POST"])
def offline_summary():
    data = request.get_json()
    fixture_id = data.get("fixture_id")
    video_duration = data.get("video_duration", 120)  # بالثواني

    headers = {"x-apisports-key": API_FOOTBALL_KEY}
    stats_url = f"https://v3.football.api-sports.io/fixtures/statistics?fixture={fixture_id}"
    events_url = f"https://v3.football.api-sports.io/fixtures/events?fixture={fixture_id}"

    stats = requests.get(stats_url, headers=headers).json()["response"]
    events = requests.get(events_url, headers=headers).json()["response"]

    full_prompt = build_master_prompt(stats, events, question="قدم تحليلًا مفصلًا للمباراة اعتمادًا على الإحصائيات والأحداث فقط.")

    full_text = call_deepseek(full_prompt)

    num_chunks = video_duration // 10
    words = full_text.split()
    words_per_chunk = max(10, len(words) // num_chunks)
    segments = [' '.join(words[i:i+words_per_chunk]) for i in range(0, len(words), words_per_chunk)]

    return jsonify({
        "segments": segments[:num_chunks]
    })

if __name__ == "__main__":
    app.run(debug=True) 
