from .security_policy import SecurityPolicy
from .execution_context import SandboxedExecutionContext

class SandboxedIsolateRunner:
    """
    Executes raw dynamic indicator strings inside a restricted scope,
    returning validated graphical primitives and calculated Series.
    """
    @staticmethod
    def run_indicator(code_str: str, df_candles) -> dict:
        # Validate security policy first
        SecurityPolicy.validate_code(code_str)

        # Create safe restricted builtins dict
        safe_builtins = {}
        for b in dir(__builtins__):
            if b not in SecurityPolicy.BLOCKED_BUILTINS:
                safe_builtins[b] = getattr(__builtins__, b)

        context = SandboxedExecutionContext(df_candles)

        # Restricted execution frame
        execution_globals = {
            "__builtins__": safe_builtins,
            "ctx": context,
            "math": __import__("math"),
        }

        # Add support for standard mathematical libraries that are safe
        try:
            import numpy as np
            execution_globals["np"] = np
        except ImportError:
            pass

        # Compile and execute code
        compiled = compile(code_str, "<string>", "exec")
        exec(compiled, execution_globals)

        # Look for a main runner entry point like 'calculate' or run arbitrary block
        if "calculate" in execution_globals and callable(execution_globals["calculate"]):
            execution_globals["calculate"](context)

        return context.drawings
