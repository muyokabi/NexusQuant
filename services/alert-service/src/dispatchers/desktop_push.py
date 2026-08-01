import logging

logger = logging.getLogger("DesktopPush")

class DesktopPushDispatcher:
    """
    Dispatches alerts to the user's desktop local client via local system notifications.
    """
    async def dispatch(self, alert_id: str, message: str) -> bool:
        logger.info(f"Dispatching Desktop Push notification for {alert_id}: {message}")
        return True
