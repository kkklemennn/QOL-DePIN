# HomeAssistant plugin our IoTeX based secure air monitoring sensor
Custom HomeAssistant integration which interacts with our sensor.

## Development process
For development of this integration we used the Studio Code Server plugin inside our HomeAssistant, which is running in a virtualized environment on a hypervisor.

After making changes to the code, the core needs to be restarted in order for changes to take place. This can be done in many different ways either in UI or with the command `ha core restart`. 

## Adding the integration to HomeAssistant
Add the Integration: Go to Configuration -> Integrations -> Add Integration and search for "MagBTC".

Configure the Integration: Enter the IP address of the sensor when prompted.

## How it works:
### Device side:

In the setup() function, the Arduino connects to the Wi-Fi network and starts the HTTP server.

In the loop() function, the Arduino continuously checks for incoming client connections.

Client Handling: When a client connects, the Arduino reads the HTTP request. If it's a request for /sensor-data, it reads the sensor value and sends it back as the HTTP response.

### Home Assistant side:

During the initial setup, the user inputs the IP address of the Arduino device.
The MagBTCSensor entity in Home Assistant is created with the provided IP address and an update interval. Home Assistant schedules periodic updates (defined in `sensor.py`) to fetch new data from the Arduino.

### Interaction between the sensor and HomeAssistant

User configures the integration in Home Assistant with the Arduino's IP address.
Home Assistant starts periodically sending HTTP GET requests to the Arduino.
Every 60 seconds (or the configured interval), Home Assistant sends an HTTP GET request to `http://<arduino_ip>/sensor-data`.
Arduino receives the request, reads the sensor value from DHT11 sensor, and sends it back in the HTTP response.
Home Assistant receives the HTTP response containing the sensor value.
The state of the MagBTCSensor entity in Home Assistant is updated with the new sensor value.

## Standard HomeAssistant plugin directory and file structure
- `__init__.py`: Sets up the component.
- `config_flow.py`: Manages the configuration flow for the component, allowing users to set it up via the Home Assistant UI.
- `const.py`: Contains constants used in the component.
- `manifest.json` Defines the component metadata.
- `sensor.py`: Defines a sensor entity that fetches data from your API.
- `translations/en.json`: Provides translations for the configuration flow.