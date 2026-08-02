const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow = null;
let pythonProcess = null;
let sharedMemoryBuffer = Buffer.alloc(0);

// Window State Management
const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  let state = {
    width: 1280,
    height: 800,
    x: undefined,
    y: undefined,
    isMaximized: false
  };
  try {
    if (fs.existsSync(stateFilePath)) {
      state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load window state:', err);
  }
  return state;
}

function saveWindowState(state) {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save window state:', err);
  }
}

// Spawning Python Engine
function startPythonEngine() {
  if (pythonProcess) {
    console.log('Python Engine is already running.');
    return 'Engine already running';
  }

  const engineScript = path.resolve(__dirname, '../engine/embedded_server.py');
  console.log(`Spawning Python Engine script at: ${engineScript}`);

  // Try python3 first, fallback to python
  let pythonCmd = 'python3';
  if (process.platform === 'win32') {
    pythonCmd = 'python';
  }

  try {
    pythonProcess = spawn(pythonCmd, [engineScript], {
      stdio: 'pipe'
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`[Python Engine]: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[Python Engine Error]: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python Engine exited with code ${code}`);
      pythonProcess = null;
    });

    return 'Python Engine started successfully';
  } catch (err) {
    console.error('Failed to spawn Python process with primary command. Trying fallback...', err);
    try {
      pythonCmd = pythonCmd === 'python3' ? 'python' : 'python3';
      pythonProcess = spawn(pythonCmd, [engineScript], {
        stdio: 'pipe'
      });
      return 'Python Engine started successfully (fallback)';
    } catch (fallbackErr) {
      console.error('Failed to spawn fallback Python process:', fallbackErr);
      return `Failed to start Python Engine: ${fallbackErr.message}`;
    }
  }
}

function stopPythonEngine() {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    return 'Python Engine stopped successfully';
  }
  return 'Python Engine was not running';
}

function createWindow() {
  const windowState = loadWindowState();

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    frame: false, // Frameless window matching dark high-performance trading aesthetic
    backgroundColor: '#1E1E1E',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Determine whether we are in development mode
  const isDev = process.env.ELECTRON_DEV === 'true' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Track window state changes
  const updateState = () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    const isMaximized = mainWindow.isMaximized();

    // Only save dimensions if not maximized
    if (!isMaximized) {
      windowState.x = bounds.x;
      windowState.y = bounds.y;
      windowState.width = bounds.width;
      windowState.height = bounds.height;
    }
    windowState.isMaximized = isMaximized;
    saveWindowState(windowState);
  };

  mainWindow.on('resize', updateState);
  mainWindow.on('move', updateState);
  mainWindow.on('maximize', updateState);
  mainWindow.on('unmaximize', updateState);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopPythonEngine();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  stopPythonEngine();
});

// IPC Handler
ipcMain.handle('invoke', async (event, { method, args }) => {
  console.log(`IPC invoke request: method=${method}`, args);
  switch (method) {
    case 'start_python_engine':
      try {
        const msg = startPythonEngine();
        return msg;
      } catch (err) {
        return `Error: ${err.message}`;
      }

    case 'stop_python_engine':
      return stopPythonEngine();

    case 'write_shared_memory':
      if (args && args.payload) {
        sharedMemoryBuffer = Buffer.from(args.payload);
        return 'Data written to shared memory';
      }
      return 'No payload provided';

    case 'read_shared_memory':
      return Array.from(sharedMemoryBuffer);

    // Native Window Controls
    case 'window-minimize':
      if (mainWindow) {
        mainWindow.minimize();
      }
      return true;

    case 'window-maximize':
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
      }
      return true;

    case 'window-close':
      if (mainWindow) {
        mainWindow.close();
      }
      return true;

    default:
      console.warn(`Unknown IPC method: ${method}`);
      return { success: false, error: `Unknown method: ${method}` };
  }
});
