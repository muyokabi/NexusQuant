import os
import json
from typing import Dict, Any

class PluginLoader:
    """
    Scans, validates, and loads local Python indicators and external community plugins.
    """
    def __init__(self, plugins_dir: str = "plugins"):
        self.plugins_dir = plugins_dir

    def load_plugin(self, relative_path: str) -> Dict[str, Any]:
        """
        Loads a single plugin directory. Reads plugin.json configuration
        and returns the source code of the main script.
        """
        full_path = os.path.join(self.plugins_dir, relative_path)
        manifest_path = os.path.join(full_path, "plugin.json")

        if not os.path.exists(manifest_path):
            raise FileNotFoundError(f"Plugin manifest not found at {manifest_path}")

        with open(manifest_path, "r") as f:
            manifest = json.load(f)

        main_file = manifest.get("entry_point", "src/main.py")
        main_script_path = os.path.join(full_path, main_file)

        code = ""
        if os.path.exists(main_script_path):
            with open(main_script_path, "r") as f:
                code = f.read()

        return {
            "manifest": manifest,
            "code": code
        }
