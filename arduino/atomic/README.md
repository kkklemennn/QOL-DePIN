# atomic

Contains individual files which were used for testing various functionalities during the development of w3bstreamclient.ino.

## data2hass.ino
Arduino code for testing sending data to homeassistant.
It basically sets up a HTTP server on port 80 that listens for incoming HTTP GET requests.
When a HTTP GET request is received on the endpoint `/sensor-data`, the arduino reads the sensor value and responds with the sensor data as plaintext
Polling is done ine `sensor.py` via homeassistant integration

## dhtsensor.ino
Arduino code for testing getting the actual readings of temperature and humidity from DHT11/DHT22 sensors.

## setupwifiserisal.ino
Arduino code for testing setting up the wifi credentials via serial port.
Needed when the new device is shipped so that the end user can plug it in the computer and input own wifi ssid and password in order for the device to connect to it.
It is implemented so that it listens for `resetwifi` string on serial monitor, if it gets it, it prompts you to input the new ssid and password
It then saves those values in FLASH memory so a user does not need to do this step each time the device reboots.
Note: since this is an open-source project, users can simply download the production arduino code `w3bstreamclient.ino` and input their own wifi info in `secrets.h`.

## signingmessage.ino
Arduino code for testing creating a sample json object that would be sent to homeassistant/w3bstream, signing the data object and validating the signature.

## wifilocation.ino
Arduino code for testing getting the location information from Google's geolocation API.
It works so that the arduino scans all the nearby wifi access points, creates a json object which contains the mac address and rssi of each scanned access point.
This is then sent to Google geolocation API, where we get a response of coordinates (lat,lon) and accuracy in meters. 

Works surprisingly well - after testing the best result we got was about 5m off with 18m accuracy, and the worst was 7km off with 11km accuracy.