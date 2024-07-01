# All arduino code
In the `atomic` directory are the files that were used to develop and test various functionalities.

In `tools` directory there are the files that we used as tools when uploaded to the arduino board. Such as generating the public keys and scanning wifi networks.

## atomic

### data2hass.ino
Arduino code for testing sending data to homeassistant.
It basically sets up a http server on port 80 that listens for incoming HTTP GET requests.
When a HTTP GET request is received on the endpoint `/sensor-data`, the arduino reads the sensor value and responds with the sensor data as plaintext
Polling is done ine `sensor.py` via homeassistant integration

### dhtsensor.ino
Arduino code for testing getting the actual readings of temperature and humidity from DHT11/DHT22 sensors.

### setupwifiserisal.ino
Arduino code for testing setting up the wifi credentials via serial port.
Needed when the new device is shipped so that the end user can plug it in the computer and input own wifi ssid and password in order for the device to connect to it.
It is implemented so that it listens for `resetwifi` string on serial monitor, if it gets it, it prompts you to input the new ssid and password
It then saves those values in FLASH memory so a user does not need to do this step each time the device reboots.

### signingmessage.ino
Arduino code for testing creating a sample json object that would be sent to homeassistant/w3bstream, signing the data object and validating the signature.

### wifilocation.ino
Arduino code for testing getting the location information from Google's geolocation API.
It works so that the arduino scans all the nearby wifi access points, creates a json object which contains the mac address and rssi of each scanned access point.
This is then sent to Google geolocation API, where we get a response of coordinates (lat,lon) and accuracy in meters. 
Works surprisingly well - after testing the best result we got was about 5m off with 18m accuracy, and the worst was 7km off with 11km accuracy.

## tools

### ECCX08 signatures
Here are the files for creating the public key or self signed certificate on the ecc secure chip with 4 designates slots for storing private keys that is on nano33iot.
It also includes the sketch for generating a sample message, signing it and verifying the signature.

### wifiscanner.ino
Arduino code that scans all the available wifi networks and connects to the set one with "YOUR_SSID".

# w3bstreamclient.ino
Is the "production" code of the device. Basically all the components that we tested individually in atomic are combined in this to work as a sensor which:
- reads the sensor data (simulating with random for now)
- prepares the message JSON
- signs the message
- sends the message (including public key and signature) to w3bstream provider

TODO:
- actual readings from DHT
- attaching location data
- sending the data also to homeassistant
- implementing setting up and changing wifi credentials via serial monitor

# Example message JSON

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