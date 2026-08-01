import asyncio
import logging
from typing import Dict, List, Any
from dispatchers.desktop_push import DesktopPushDispatcher
from dispatchers.telegram import TelegramDispatcher
from dispatchers.webhooks import WebhookDispatcher

logger = logging.getLogger("AlertService")

class AlertEvaluator:
    """
    Evaluates price boundaries, crosses, and dynamic script conditions.
    """
    def __init__(self):
        self.alerts: List[Dict[str, Any]] = []
        self.desktop_dispatcher = DesktopPushDispatcher()
        self.telegram_dispatcher = TelegramDispatcher()
        self.webhook_dispatcher = WebhookDispatcher()
        self.history: Dict[str, float] = {}  # Tracks previous prices for crossing checks

    def add_alert(self, alert: Dict[str, Any]):
        self.alerts.append(alert)
        logger.info(f"Registered alert: {alert.get('alert_id')} for {alert.get('symbol')}")

    async def evaluate_tick(self, tick: Dict[str, Any]) -> List[Dict[str, Any]]:
        symbol = tick.get("symbol")
        current_price = tick.get("price", 0.0)
        previous_price = self.history.get(symbol)
        triggered_alerts = []

        if previous_price is None:
            self.history[symbol] = current_price
            return triggered_alerts

        for alert in self.alerts:
            if not alert.get("active", True) or alert.get("symbol") != symbol:
                continue

            triggered = False
            cond = alert.get("condition_type")
            threshold = alert.get("threshold", 0.0)

            if cond == "ABOVE":
                if current_price > threshold:
                    triggered = True
            elif cond == "BELOW":
                if current_price < threshold:
                    triggered = True
            elif cond == "CROSS":
                # Check if current price crossed the threshold from below or above
                if (previous_price <= threshold < current_price) or (previous_price >= threshold > current_price):
                    triggered = True

            if triggered:
                alert["active"] = False  # Deactivate alert once triggered
                triggered_alerts.append(alert)
                msg = f"Alert {alert.get('alert_id')} triggered! {symbol} price {current_price} crossed threshold {threshold}."
                await self._dispatch_notifications(alert, msg)

        self.history[symbol] = current_price
        return triggered_alerts

    async def _dispatch_notifications(self, alert: Dict[str, Any], message: str):
        alert_id = alert.get("alert_id")

        # Desktop
        await self.desktop_dispatcher.dispatch(alert_id, message)

        # Telegram
        if "telegram_config" in alert:
            tc = alert["telegram_config"]
            await self.telegram_dispatcher.dispatch(alert_id, message, tc.get("token"), tc.get("chat_id"))

        # Webhook
        if "webhook_endpoint" in alert:
            await self.webhook_dispatcher.dispatch(alert_id, {"alert_id": alert_id, "message": message}, alert["webhook_endpoint"])
