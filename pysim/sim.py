import os
import requests
import json
import time
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
PUB_TOKEN = os.getenv("PUB_TOKEN", "")
PROJECT_NAME = os.getenv("PROJECT_NAME", "")
EVENT_TYPE = os.getenv("EVENT_TYPE", "DEFAULT")
W3BSTREAM_ENDPOINT = f"http://dev.w3bstream.com:8889/srv-applet-mgr/v0/event/{PROJECT_NAME}?eventType={EVENT_TYPE}"

def send_data():
    temperature, humidity, timestamp = generate_sensor_data()
    # Prepare data payload
    # data_payload = json.dumps({"sensor_reading": sensor_reading, "timestamp": timestamp})
    data_payload = {
        "temperature": temperature,
        "humidity": humidity,
        "timestamp": timestamp
    }

    # Hardcoded payload for testing purposes
    payload = {
    "data": {
        "temperature": "25.8",
        "humidity": "48.0",
        "timestamp": "1720047574",
        "public_key": "cc6d788fc040dfa2987d69a8c2f78ac70e06b0b747003f8158db146104eb894f6b75aa1531e1b813148ebdf1e0db3af409c8b1d7eb8b1c6c23c6b61ef75e262b",
        "latitude": "46.050030",
        "longitude": "14.468389",
        "accuracy": "9.0"
    },
    "signature": "0e11bcc3c81d9a1453cf994074e4bd8de69c8f878df1b0a4fb59688a7cba46fe75d9f76183713f20e95a2571c0f0690c0210e35148c14f7f62a5e0b9fb6627ae"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PUB_TOKEN}"
    }

    # Right before the requests.post call in the send_data function:
    print("Sending payload:", json.dumps(payload, indent=4))


    response = requests.post(W3BSTREAM_ENDPOINT, json=payload, headers=headers)

    if response.status_code in [200, 201]:
        print("Data successfully sent to the W3bstream endpoint.")
    else:
        print(f"Failed to send data. Status code: {response.status_code}, Response: {response.text}")

def generate_sensor_data():
    temperature = round(random.uniform(0, 100), 2)  # Generate a random float between 0 and 100
    humidity = round(random.uniform(0, 100), 2)  # Generate a random float between 0 and 100
    timestamp = str(int(time.time() * 1000))  # Current Unix timestamp in milliseconds, converted to string
    return temperature, humidity, timestamp

send_data()
