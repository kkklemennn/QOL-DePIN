"""Config flow for MagBTC integration."""
import voluptuous as vol
from homeassistant import config_entries
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
