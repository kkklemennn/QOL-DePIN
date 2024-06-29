"""MagBTC Sensor."""
import logging
import aiohttp
from datetime import timedelta, datetime

from homeassistant.helpers.entity import Entity
from homeassistant.helpers.event import async_track_time_interval

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

    # Check if the entity is already added
    if client_ip in hass.data[DOMAIN]['sensors']:
        _LOGGER.debug("Sensor with client IP %s already exists, skipping creation.", client_ip)
        return

    sensor = MagBTCSensor(hass, client_ip, update_interval)
    async_add_entities([sensor], update_before_add=True)

    # Store the entity to prevent duplicates
    hass.data[DOMAIN]['sensors'][client_ip] = sensor

class MagBTCSensor(Entity):
    """Representation of a Sensor."""

    def __init__(self, hass, client_ip, update_interval):
        """Initialize the sensor."""
        self._hass = hass
        self._client_ip = client_ip
        self._state = None
        self._name = "MagBTC Sensor"
        self._update_interval = update_interval
        self._remove_listener = None

        _LOGGER.debug("Initializing sensor with update interval: %s", self._update_interval)

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
            _LOGGER.debug("Removed existing listener for sensor: %s", self._name)
            self._remove_listener = None

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def should_poll(self):
        """No polling needed for this sensor."""
        return False

    async def async_update(self, now=None):
        """Fetch new state data for the sensor."""
        _LOGGER.debug("Starting update at: %s", datetime.now())
        try:
            _LOGGER.debug("Fetching data from client: %s", self._client_ip)
            async with aiohttp.ClientSession() as session:
                async with session.get(f"http://{self._client_ip}/sensor-data") as response:
                    response.raise_for_status()
                    self._state = await response.text()

            _LOGGER.debug("Received data: %s at %s", self._state, datetime.now())

        except aiohttp.ClientError as e:
            self._state = "Error"
            _LOGGER.error("Error fetching data from client: %s", e)

        _LOGGER.debug("Finished update at: %s", datetime.now())

    async def async_will_remove_from_hass(self):
        """Handle removal of the sensor from Home Assistant."""
        self._remove_existing_listener()
        _LOGGER.debug("Removed listener for sensor: %s", self._name)
