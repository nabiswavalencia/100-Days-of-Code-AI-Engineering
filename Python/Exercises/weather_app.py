# This is a function that asks a user for their location, checks the weather for the past few days, based on how they have specified, and gives them a feedback in graph form

import requests 
from datetime import datetime, timedelta 
import pandas as pd 
import matplotlib.pyplot as plt
import os


def weather_pattern():

    #Get weather data
    longitude = float(input("Please provide your longitude: "))
    latitude = float(input ("Please provide your latitude: ")) 
    days_ago = int(input ("How many days do you want to check the weather pattern (including today): "))
    location = input("What is the location? ")

    today = datetime.now()
    week_ago = today - timedelta(days=days_ago-1) 
    # timedelta represents a duration or a span of time (eg days, weeks or hours)

    # Format dates for API (YYYY-MM-DD)
    start_date = week_ago.strftime("%Y-%m-%d")
    end_date = today.strftime("%Y-%m-%d")

    # latitude = -1.2921# Kenya Nairobi latitude
    # longitude = 36.8219   # Kenya Nairobi longitude

    # Get Nairobi weather for past week
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&start_date={start_date}&end_date={end_date}&daily=temperature_2m_max,temperature_2m_min"

    response = requests.get(url)
    data = response.json()

    daily_data = data['daily']

    # Process with pandas
    df = pd.DataFrame({
        'date': daily_data['time'],
        'max_temp': daily_data['temperature_2m_max'],
        'min_temp': daily_data['temperature_2m_min']
    })


# 3. Calculate average
    df['avg_temp'] = (df['max_temp'] + df['min_temp']) / 2
    # Convert date strings to datetime
    df['date'] = pd.to_datetime(df['date'])

    print(df)

    ## 4. Create visualization


    plt.figure(figsize=(10, 6))
    plt.plot(df['date'], df['max_temp'], 'r-o', label='Max')
    plt.plot(df['date'], df['min_temp'], 'b-o', label='Min')
    plt.plot(df['date'], df['avg_temp'], 'g--', label='Average')

    plt.xlabel('Date')
    plt.ylabel('Temperature (°C)')
    plt.title(f'{location} Weather - Past {days_ago} days')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()

    # 5. Save everything
    if not os.path.exists('data'):
        os.makedirs('data')

    plt.savefig(f'data/{location}weather_chart.png')
    df.to_csv(f'data/{location}_weather.csv', index=False)

    print(f"Average temperature: {df['avg_temp'].mean():.1f}°C")
    print("Files saved in 'data' folder")


weather_pattern()

