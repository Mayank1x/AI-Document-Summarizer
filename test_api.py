import requests

url = "http://127.0.0.1:5000/ask"
data = {"prompt": "Summarize the benefits of AI in education."}

response = requests.post(url, json=data)
print(response.json())
