"""Config flow for MagBTC integration."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from .const import DOMAIN

class MagBTCConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for MagBTC."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if user_input is None:
            return self.async_show_form(
                step_id="user",
                data_schema=vol.Schema({
                    vol.Required("client_ip"): str,
                })
            )

        return self.async_create_entry(title="MagBTC", data=user_input)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return MagBTCOptionsFlowHandler(config_entry)

class MagBTCOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for MagBTC."""

    def __init__(self, config_entry):
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options for the custom component."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(step_id="init")

    @staticmethod
    @callback
    def async_get_panel_config():
        """Return the panel config."""
        return {
            "title": "MagBTC Device Manager",
            "icon": "mdi:monitor-dashboard",
            "url": "http://localhost:3001/",
        }
