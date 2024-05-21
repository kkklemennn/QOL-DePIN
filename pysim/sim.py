import os
from ecdsa import SigningKey, SECP256k1
from ecdsa.util import sigencode_string
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
PRIVATE_KEY_FILE = "private.key"

def generate_keys_ecdsa():
    if not os.path.exists(PRIVATE_KEY_FILE):
        # Generate a new private key using the SECP256k1 curve
        sk = SigningKey.generate(curve=SECP256k1)
        # Write the private key to a file in PEM format
        with open(PRIVATE_KEY_FILE, "wb") as f:
            f.write(sk.to_pem())
    else:
        # Load the existing private key from the file
        with open(PRIVATE_KEY_FILE, "rb") as f:
            sk = SigningKey.from_pem(f.read())

    # Obtain the corresponding public key
    vk = sk.get_verifying_key()

    return sk, vk

private_key, public_key = generate_keys_ecdsa()
public_key_hex = "04" + public_key.to_string().hex()
print(public_key_hex)

def sign_data(private_key, data):
    """
    Sign the data using the provided ECDSA private key.

    Args:
        private_key (SigningKey): The ECDSA private key for signing.
        data (str): The data payload to sign.

    Returns:
        bytes: The signature as a byte string.
    """
    # Ensure the data is in bytes
    data_bytes = data.encode('utf-8')
    # Sign the data
    signature = private_key.sign(data_bytes, sigencode=sigencode_string)
    return signature

def send_data():
    sensor_reading, timestamp = generate_sensor_data()
    # Prepare data payload
    # data_payload = json.dumps({"sensor_reading": sensor_reading, "timestamp": timestamp})
    data_payload = {
        "sensor_reading": sensor_reading,
        "timestamp": timestamp
    }
    data_payload_str = json.dumps(data_payload)

    signature = sign_data(private_key, data_payload_str)
    device_id = public_key_hex[:20]  # First 20 characters of public key PEM

    # Full payload with public key and signature
    # payload = {
    #     "data": data_payload,
    #     "public_key": public_key_hex,
    #     "deviceId": device_id,
    #     "signature": signature.hex()  # Convert bytes to hex string for transport
    # }

    # Hardcoded payload for testing purposes
    payload = {
        "data": data_payload,
        "public_key": "d06503012a2027f17f936eeb8c90b58f0b1f079ea12b215386c5f4e3836e95fa56d55a3cfdfcae63e4f8204d006bd135c867397b8366565bd3d5edd69840403aee",
        "deviceId": "0xd06503012a2027f17f936eeb8c90b58f0b1f079ea12b215386c5f4e3836e95fa",
        "signature": "3046022100e5f6fde12cef41320f29814b42e6977d800ea6485b604a839496c86c169f6a31022100940585ad283c6342fa84bcace645ab9531180af8e0dcb97de873e8746c259ab0"
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
    sensor_reading = round(random.uniform(0, 100), 2)  # Generate a random float between 0 and 100
    timestamp = str(int(time.time() * 1000))  # Current Unix timestamp in milliseconds, converted to string
    return sensor_reading, timestamp

send_data()
