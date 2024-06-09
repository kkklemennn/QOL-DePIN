"""MagBTC Sensor."""
import requests
import logging
from datetime import timedelta

from homeassistant.helpers.entity import Entity
from homeassistant.helpers.event import async_track_time_interval

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up MagBTC sensor platform."""
    api_url = config_entry.data["api_url"]
    update_interval = timedelta(seconds=60)  # Set the desired update interval
    sensor = MagBTCSensor(hass, api_url, update_interval)
    async_add_entities([sensor], update_before_add=True)

class MagBTCSensor(Entity):
    """Representation of a Sensor."""

    def __init__(self, hass, api_url, update_interval):
        """Initialize the sensor."""
        self._hass = hass
        self._api_url = api_url
        self._state = None
        self._name = "MagBTC Sensor"
        self._update_interval = update_interval

        # Schedule the first update
        self._hass.async_create_task(self.async_update())
        
        # Schedule subsequent updates
        async_track_time_interval(self._hass, self.async_update, self._update_interval)

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    async def async_update(self, now=None):
        """Fetch new state data for the sensor."""
        try:
            _LOGGER.debug("Fetching data from API: %s", self._api_url)
            response = await self._hass.async_add_executor_job(
                requests.get, f"{self._api_url}/hello-world"
            )
            response.raise_for_status()

            # Log the raw response
            _LOGGER.debug("Raw response: %s", response.text)

            # Assuming response.text is the plain text response
            self._state = response.text

        except requests.exceptions.RequestException as e:
            self._state = "Error"
            _LOGGER.error("Error fetching data from MagBTC API: %s", e)
