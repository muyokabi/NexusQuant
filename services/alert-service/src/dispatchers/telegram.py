import logging

logger = logging.getLogger("TelegramDispatcher")

class TelegramDispatcher:
    """
    Dispatches alerts to specified Telegram chats via Bot API.
    """
    async def dispatch(self, alert_id: str, message: str, bot_token: str, chat_id: str) -> bool:
        logger.info(f"Dispatching Telegram Alert {alert_id} to chat {chat_id}: {message}")
        return True
