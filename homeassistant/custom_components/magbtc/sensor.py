"""MagBTC Sensor."""
import logging
import aiohttp
from datetime import timedelta, datetime

from homeassistant.helpers.entity import Entity
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.entity_registry import async_get
from homeassistant.components.sensor import SensorEntity
from homeassistant.const import PERCENTAGE
from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import UnitOfTemperature

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up MagBTC sensor platform."""
    client_ip = config_entry.data["client_ip"]
    update_interval = timedelta(minutes=2)  # Set the update interval to 2 minutes

    _LOGGER.debug("Setting up sensor with update interval: %s", update_interval)

    # Ensure the domain data structure exists
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    if 'sensors' not in hass.data[DOMAIN]:
        hass.data[DOMAIN]['sensors'] = {}

    # Check if the entities are already added
    if client_ip in hass.data[DOMAIN]['sensors']:
        _LOGGER.debug("Sensors with client IP %s already exist, skipping creation.", client_ip)
        return

    # Create the sensor manager
    sensor_manager = MagBTCSensorManager(hass, client_ip, update_interval)
    async_add_entities(sensor_manager.sensors, update_before_add=True)

    # Store the entities to prevent duplicates
    hass.data[DOMAIN]['sensors'][client_ip] = sensor_manager

    # Register the device
    device_registry = dr.async_get(hass)
    device_registry.async_get_or_create(
        config_entry_id=config_entry.entry_id,
        identifiers={(DOMAIN, client_ip)},
        name="MagBTC Sensor",
        manufacturer="MagBTC",
        model="Temperature and Humidity Sensor"
    )

    # Register entities
    entity_registry = await async_get(hass)
    for sensor in sensor_manager.sensors:
        entity_registry.async_get_or_create(
            domain="sensor",
            platform=DOMAIN,
            unique_id=sensor.unique_id,
            config_entry=config_entry,
            device_id=device_registry.async_get_device({(DOMAIN, client_ip)}).id
        )

class MagBTCSensorManager:
    """Manager to handle updating multiple sensors from one API call."""

    def __init__(self, hass, client_ip, update_interval):
        """Initialize the sensor manager."""
        self._hass = hass
        self._client_ip = client_ip
        self._update_interval = update_interval
        self._remove_listener = None

        self.temperature_sensor = MagBTCTemperatureSensor(client_ip)
        self.humidity_sensor = MagBTCHumiditySensor(client_ip)

        self.sensors = [self.temperature_sensor, self.humidity_sensor]

        _LOGGER.debug("Initializing sensor manager with update interval: %s", self._update_interval)

        # Schedule the first update
        self._hass.async_create_task(self.async_update())
        
        # Schedule subsequent updates
        self._remove_existing_listener()
        self._remove_listener = async_track_time_interval(
            self._hass, self.async_update, self._update_interval
        )

    def _remove_existing_listener(self):
        """Remove any existing listener."""
        if self._remove_listener:
            self._remove_listener()
            _LOGGER.debug("Removed existing listener for sensor manager")
            self._remove_listener = None

    async def async_update(self, now=None):
        """Fetch new state data for the sensors."""
        _LOGGER.debug("Starting update at: %s", datetime.now())
        try:
            _LOGGER.debug("Fetching data from client: %s", self._client_ip)
            async with aiohttp.ClientSession() as session:
                async with session.get(f"http://{self._client_ip}/sensor-data") as response:
                    response.raise_for_status()
                    data = await response.json()

            temperature = data.get("temperature")
            humidity = data.get("humidity")

            self.temperature_sensor.set_state(temperature)
            self.humidity_sensor.set_state(humidity)

            _LOGGER.debug("Received data: %s at %s", data, datetime.now())

        except aiohttp.ClientError as e:
            self.temperature_sensor.set_state("Error")
            self.humidity_sensor.set_state("Error")
            _LOGGER.error("Error fetching data from client: %s", e)

        _LOGGER.debug("Finished update at: %s", datetime.now())

    async def async_will_remove_from_hass(self):
        """Handle removal of the sensor manager from Home Assistant."""
        self._remove_existing_listener()
        _LOGGER.debug("Removed listener for sensor manager")

class MagBTCTemperatureSensor(SensorEntity):
    """Representation of a Temperature Sensor."""

    def __init__(self, client_ip):
        """Initialize the temperature sensor."""
        self._state = None
        self._client_ip = client_ip
        self._name = "MagBTC Temperature Sensor"
        self._unique_id = f"{client_ip}_temperature"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unique_id(self):
        """Return a unique ID for the sensor."""
        return self._unique_id

    @property
    def should_poll(self):
        """No polling needed for this sensor."""
        return False

    @property
    def device_info(self):
        """Return device information about this sensor."""
        return {
            "identifiers": {(DOMAIN, self._client_ip)},
            "name": "MagBTC Sensor",
            "manufacturer": "MagBTC",
            "model": "Temperature and Humidity Sensor",
        }

    @property
    def device_class(self):
        """Return the device class of this sensor."""
        return SensorDeviceClass.TEMPERATURE

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement of this sensor."""
        return UnitOfTemperature.CELSIUS

    def set_state(self, state):
        """Set the state of the sensor."""
        self._state = state
        self.async_write_ha_state()

class MagBTCHumiditySensor(SensorEntity):
    """Representation of a Humidity Sensor."""

    def __init__(self, client_ip):
        """Initialize the humidity sensor."""
        self._state = None
        self._client_ip = client_ip
        self._name = "MagBTC Humidity Sensor"
        self._unique_id = f"{client_ip}_humidity"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unique_id(self):
        """Return a unique ID for the sensor."""
        return self._unique_id

    @property
    def should_poll(self):
        """No polling needed for this sensor."""
        return False

    @property
    def device_info(self):
        """Return device information about this sensor."""
        return {
            "identifiers": {(DOMAIN, self._client_ip)},
            "name": "MagBTC Sensor",
            "manufacturer": "MagBTC",
            "model": "Temperature and Humidity Sensor",
        }

    @property
    def device_class(self):
        """Return the device class of this sensor."""
        return SensorDeviceClass.HUMIDITY

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement of this sensor."""
        return PERCENTAGE

    def set_state(self, state):
        """Set the state of the sensor."""
        self._state = state
        self.async_write_ha_state()
