export const TerminalStorage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`nq_pro_sys_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error loading state key ${key}`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`nq_pro_sys_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving state key ${key}`, e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`nq_pro_sys_${key}`);
    } catch (e) {
      console.error(`Error clearing state key ${key}`, e);
    }
  },

  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k.startsWith("nq_pro_sys_")) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.error("Error purging all terminal layouts", e);
    }
  }
};
