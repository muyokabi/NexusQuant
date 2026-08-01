use std::sync::{Arc, Mutex};

pub struct SharedMemoryBridge {
    buffer: Arc<Mutex<Vec<u8>>>,
}

impl SharedMemoryBridge {
    pub fn new() -> Self {
        Self {
            buffer: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn write_data(&self, data: &[u8]) {
        let mut buf = self.buffer.lock().unwrap();
        *buf = data.to_vec();
    }

    pub fn read_data(&self) -> Vec<u8> {
        let buf = self.buffer.lock().unwrap();
        buf.clone()
    }
}
