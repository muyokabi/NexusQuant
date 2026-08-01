from typing import Dict, Any, List
from .loader import PluginLoader
from sandbox.isolate_runner import SandboxedIsolateRunner

class PluginsRuntimeManager:
    """
    Orchestrates execution of loaded indicator plugins across various series dataframes.
    """
    def __init__(self, plugins_dir: str = "plugins"):
        self.loader = PluginLoader(plugins_dir)
        self.plugins: Dict[str, Dict[str, Any]] = {}

    def register_plugin(self, relative_path: str):
        plugin_info = self.loader.load_plugin(relative_path)
        p_id = plugin_info["manifest"].get("id")
        self.plugins[p_id] = plugin_info

    def execute_plugin(self, plugin_id: str, df_candles) -> dict:
        if plugin_id not in self.plugins:
            raise KeyError(f"Plugin with ID '{plugin_id}' is not registered.")

        plugin = self.plugins[plugin_id]
        code_str = plugin["code"]
        return SandboxedIsolateRunner.run_indicator(code_str, df_candles)

    def list_plugins(self) -> List[dict]:
        return [p["manifest"] for p in self.plugins.values()]
