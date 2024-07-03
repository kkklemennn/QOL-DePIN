# All arduino code
In the `atomic` directory are the files that were used to develop and test various functionalities.

In `tools` directory there are the files that we used as tools when uploaded to the arduino board. Such as generating the public keys and scanning wifi networks.

# w3bstreamclient.ino
Is the "production" code of the device. Basically all the components that we tested individually in atomic are combined in this to work as a sensor which:
- Reads the temperature and humidity data from DHT11 sensor
- Scans for available Wi-Fi networks to gather data for location approximation
- After scanning it ensures a stable WiFi connection and handles reconnection if needed
- Gets the approximate location from Google geolocation API based on nearby access points
- Constructs a JSON message with: temperature reading, humidity reading, unix timestamp, public key, latitude, longitude, accuracy
- Computes the SHA-256 hash of the JSON message, signs it using ECCX08 module and appends the signature to the message
- This signed message is sent to the W3bstream server every 2 hours
- Hosts a local server to respond to requests for device information (/id, /sensor-data), which is used for polling from HomeAssistent
- Sends the message (including public key and signature) to W3bstream provider

## Workflow
- Local server is constantly running so that HomeAssistant is able to poll sensor data from the device
    -   Since this is all running locally, it is not encrypted or signed.
- Every 2 hours a signed message is sent to W3bstream
    -   On W3bstream a wasm applet is running, which is handling everything else (see documentation here).

## Example message JSON
```
{
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
```