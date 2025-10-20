import requests

url = 'http://localhost:3000/api/login'
payload = {
    'username': 'Fa-Dali',
    'password': 'fadaliastro'
}

response = requests.post(url, json=payload)
print(response.text)