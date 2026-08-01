use std::process::{Child, Command};
use std::sync::{Arc, Mutex};

pub struct PythonRuntimeManager {
    child_process: Arc<Mutex<Option<Child>>>,
}

impl PythonRuntimeManager {
    pub fn new() -> Self {
        Self {
            child_process: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start_engine(&self) -> Result<(), String> {
        let mut child_lock = self.child_process.lock().unwrap();
        if child_lock.is_some() {
            return Err("Engine already running".to_string());
        }

        // Spawn local embedded Python server
        let child = Command::new("python3")
            .arg("../engine/embedded_server.py")
            .spawn()
            .map_err(|e| format!("Failed to spawn Python engine: {}", e))?;

        *child_lock = Some(child);
        Ok(())
    }

    pub fn stop_engine(&self) {
        let mut child_lock = self.child_process.lock().unwrap();
        if let Some(mut child) = child_lock.take() {
            let _ = child.kill();
        }
    }
}
