"""The MagBTC integration."""
import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the MagBTC component using YAML."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up MagBTC from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Set up sensor entry
    hass.async_create_task(
        hass.config_entries.async_forward_entry_setup(entry, "sensor")
    )

    # Remove existing panel if it exists
    hass.components.frontend.async_remove_panel(DOMAIN)

    # Set up panel iframe for device manager dashboard
    hass.components.frontend.async_register_built_in_panel(
        "iframe",
        "MagBTC Device Manager",
        "mdi:monitor-dashboard",
        DOMAIN,
        {"url": "http://localhost:3001/"}
    )

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    await hass.config_entries.async_forward_entry_unload(entry, "sensor")

    # Remove the panel when the entry is unloaded
    hass.components.frontend.async_remove_panel(DOMAIN)

    return True
