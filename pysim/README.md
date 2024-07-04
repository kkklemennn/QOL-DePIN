# Python simulator for sending data to W3bstream

This directory contains a Python script that simulates sending sensor data to the W3bstream endpoint.
This is useful especially for testing and validating the W3bstream integration without the need of actual physical devices. This script generates random sensor data and sends it to the configured endpoint.

## Running the simulator
Currently the simulator has a hardcoded message with valid signature.

You can run this simulator simply with command:
```
python3 sim.py
```

Note: *You still need to input the details about you W3bstream node into `.env` file (see `.env.example`). You will also need to register the device with the public key that is hardcoded in the payload that the simulator is sending, and bind this device to the owner (probably your metamask wallet).*