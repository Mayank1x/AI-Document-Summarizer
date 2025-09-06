import requests

url = "http://127.0.0.1:5000/upload"

# Open your test file (replace 'sample.pdf' with your own test file)
files = {"file": open("D:\Ai document summarizer\Mayank Rathore Resume ATS 86.pdf", "rb")}  

# Send POST request with file
response = requests.post(url, files=files)

# Print response JSON
print("Status code:", response.status_code)
print("Response text:", response.text)

