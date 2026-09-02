from datetime import date, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
import pandas as pd
import requests

app = FastAPI()


def geocode_location(location: str):
    """Resolves a location name to coordinates using Open-Meteo's Geocoding API."""
    url = "https://geocoding-api.open-meteo.com/v1/search"
    try:
        response = requests.get(
            url,
            params={"name": location, "count": 1, "language": "en", "format": "json"},
            timeout=10,
        )
    except requests.exceptions.RequestException as exc:
        raise HTTPException(
            status_code=502, detail=f"Could not reach the geocoding service: {exc}"
        )

    results = response.json().get("results")
    if not results:
        raise HTTPException(status_code=404, detail=f"Location '{location}' not found.")

    match = results[0]
    return {
        "name": match["name"],
        "country": match.get("country", ""),
        "latitude": match["latitude"],
        "longitude": match["longitude"],
    }


@app.get("/api/weather-history")
def get_weather_history(location: str, days: int = 7):
    """Resolves a location to coordinates, then fetches and processes its daily weather history."""
    place = geocode_location(location)

    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    url = "https://api.open-meteo.com/v1/forecast"
    try:
        response = requests.get(
            url,
            params={
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "daily": "temperature_2m_max,temperature_2m_min",
                "timezone": "auto",
            },
            timeout=10,
        )
    except requests.exceptions.RequestException as exc:
        raise HTTPException(
            status_code=502, detail=f"Could not reach the weather service: {exc}"
        )
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data.")

    daily = response.json().get("daily", {})
    if not daily:
        raise HTTPException(status_code=502, detail="No weather data returned.")

    df = pd.DataFrame(
        {
            "date": daily["time"],
            "max_temp": daily["temperature_2m_max"],
            "min_temp": daily["temperature_2m_min"],
        }
    )
    df["avg_temp"] = (df["max_temp"] + df["min_temp"]) / 2

    return {
        "location": f"{place['name']}, {place['country']}" if place["country"] else place["name"],
        "latitude": place["latitude"],
        "longitude": place["longitude"],
        "days": df.to_dict(orient="records"),
    }


# Mount the static folder to serve HTML/JS directly
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
