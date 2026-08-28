import requests

# We need coordinates to get weather data
latitude = -1.2921# Kenya Nairobi latitude
longitude = 36.8219   # Kenya Nairobi longitude

# Build the API URL with our parameters
url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m"

# Make the request
response = requests.get(url)
data = response.json()

print(data)

temperature = data['current']['temperature_2m']
print(f"Temperature in Nairobi: {temperature}°C")
