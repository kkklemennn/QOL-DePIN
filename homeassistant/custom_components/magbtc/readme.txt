Explanation
Directory Structure: Create the necessary files and directories as shown.
manifest.json: Defines the component metadata.
init.py: Sets up the component.
const.py: Contains constants used in the component.
config_flow.py: Manages the configuration flow for the component, allowing users to set it up via the Home Assistant UI.
sensor.py: Defines a sensor entity that fetches data from your API.
translations/en.json: Provides translations for the configuration flow.

Testing the Component
Restart Home Assistant: Restart Home Assistant to load the new custom component.
Add the Integration: Go to Configuration -> Integrations -> Add Integration and search for "MagBTC".
Configure the Integration: Enter the API URL when prompted.

Restarting the core after modifying the code:
ha core restart