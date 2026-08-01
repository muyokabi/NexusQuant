use tauri::State;
use crate::bridge::shared_memory::SharedMemoryBridge;
use crate::bridge::python_runtime::PythonRuntimeManager;

#[tauri::command]
pub fn start_python_engine(manager: State<'_, PythonRuntimeManager>) -> Result<String, String> {
    manager.start_engine().map(|_| "Python Engine started successfully".to_string())
}

#[tauri::command]
pub fn stop_python_engine(manager: State<'_, PythonRuntimeManager>) -> Result<String, String> {
    manager.stop_engine();
    Ok("Python Engine stopped successfully".to_string())
}

#[tauri::command]
pub fn write_shared_memory(
    bridge: State<'_, SharedMemoryBridge>,
    payload: Vec<u8>,
) -> Result<String, String> {
    bridge.write_data(&payload);
    Ok("Data written to shared memory".to_string())
}

#[tauri::command]
pub fn read_shared_memory(bridge: State<'_, SharedMemoryBridge>) -> Result<Vec<u8>, String> {
    Ok(bridge.read_data())
}
