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

# Example message JSON
TODO: Signed example message which does not doxx

```
{
    "data": {
        "temperature": 62,
        "humidity": 29,
        "timestamp": "1719522487",
        "lat": 46.610244,
        "lng": 16.2424239,
        "accuracy": 8744.983998540114
        "public_key": "cb29cf6593c4cf2d1249d2c8cce1456076948830c55c8a29b3925e305bca8237cb013ccb972b9017909a459a3fe65455fa95ee3cea7c6f62a5b77bb1626bacf2"
    },
    "signature": "454619efbd4145f110e72f5b4291676c08d5ef3bc54503f6680dba7ec6f6e40d2f7b2c16b9cc42ac510cf94d4b8c1c38f2321f732ca05991e79203439cd429c0"
}
```