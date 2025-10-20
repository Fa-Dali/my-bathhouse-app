import requests

data = {'username': 'Fa-Dali', 'password': 'fadaliastro'}
headers = {}

response = requests.post('http://localhost:3000/api/login', json=data, headers=headers)
print(response.text)