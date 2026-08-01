class SecurityPolicy:
    """
    Restricts access to dangerous Python builtins (file IO, process forks)
    within the custom user indicator sandboxed runner.
    """
    BLOCKED_BUILTINS = [
        "open", "eval", "exec", "compile", "globals", "locals", "__import__"
    ]

    BLOCKED_MODULES = [
        "os", "sys", "subprocess", "shutil", "socket", "urllib", "requests",
        "importlib", "builtins", "pty", "platform"
    ]

    @classmethod
    def validate_code(cls, code_str: str) -> bool:
        """
        Scans code string for disallowed module imports or keywords.
        """
        for blocked in cls.BLOCKED_MODULES:
            if f"import {blocked}" in code_str or f"from {blocked}" in code_str:
                raise PermissionError(f"Module '{blocked}' is restricted by NexusQuant Security Policy.")

        for kw in ["getattr", "setattr", "delattr", "eval(", "exec("]:
            if kw in code_str:
                raise PermissionError(f"Function call or keyword '{kw}' is restricted by security policy.")

        return True
