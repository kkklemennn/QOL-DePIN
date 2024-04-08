import os
import requests
import json
from dotenv import load_dotenv
import time
import random

# Load environment variables from a .env file (if present)
load_dotenv()

# Access environment variables
PUB_TOKEN = os.getenv("PUB_TOKEN", "")
PROJECT_NAME = os.getenv("PROJECT_NAME", "")
EVENT_TYPE = os.getenv("EVENT_TYPE", "DEFAULT")

# Construct the W3bstream endpoint URL
W3BSTREAM_ENDPOINT = f"http://dev.w3bstream.com:8889/srv-applet-mgr/v0/event/{PROJECT_NAME}?eventType={EVENT_TYPE}"

# Function to generate sensor reading and current Unix timestamp
def generate_sensor_data():
    sensor_reading = round(random.uniform(0, 100), 2)  # Generate a random float between 0 and 100
    timestamp = int(time.time() * 1000)  # Current Unix timestamp in milliseconds
    return sensor_reading, timestamp

# Function to send data to the W3bstream endpoint
def send_data(sensor_reading, timestamp):
    # Define the payload
    payload = {
        "data": {
            "sensor_reading": sensor_reading,
            "timestamp": timestamp
        },
        "public_key": "YOUR_PUBLIC_KEY_HERE",
        "deviceId": "YOUR_DEVICE_ID_HERE",
        "signature": "YOUR_SIGNATURE_HERE"
    }

    # Convert the payload to a JSON string
    payload_json = json.dumps(payload)

    # Specify content type and any other necessary headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PUB_TOKEN}",  # Assuming your API expects a Bearer token
    }

    try:
        # Sending the POST request to the W3bstream endpoint
        response = requests.post(W3BSTREAM_ENDPOINT, data=payload_json, headers=headers)

        # Check if the request was successful
        if response.status_code in [200, 201]:
            print("Data successfully sent to the W3bstream endpoint.")
            print("Response:", response.json())  # Assuming JSON response
        else:
            print(f"Failed to send data. Status code: {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"An error occurred: {e}")

# Generate sensor data
sensor_reading, timestamp = generate_sensor_data()

# Send the generated data
send_data(sensor_reading, timestamp)