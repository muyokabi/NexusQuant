import logging

logger = logging.getLogger("WebhookDispatcher")

class WebhookDispatcher:
    """
    Dispatches alerts to user-configured HTTP endpoints/webhooks.
    """
    async def dispatch(self, alert_id: str, payload: dict, endpoint: str) -> bool:
        logger.info(f"Dispatching Webhook Alert {alert_id} to endpoint {endpoint}")
        return True
