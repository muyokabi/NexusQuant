pub mod bridge {
    pub mod shared_memory;
    pub mod python_runtime;
    pub mod ipc_router;
}

use bridge::shared_memory::SharedMemoryBridge;
use bridge::python_runtime::PythonRuntimeManager;
use bridge::ipc_router::{start_python_engine, stop_python_engine, write_shared_memory, read_shared_memory};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SharedMemoryBridge::new())
        .manage(PythonRuntimeManager::new())
        .invoke_handler(tauri::generate_handler![
            start_python_engine,
            stop_python_engine,
            write_shared_memory,
            read_shared_memory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
