import requests

response = requests.post("http://127.0.0.1:5000/offline-summary", json={
    "fixture_id": 878076,
    "video_duration": 120
})

print("Status Code:", response.status_code)
#print("Response Text:\n", response.text)  # نطبع الرد كامل كنص لفهم المشكلة
