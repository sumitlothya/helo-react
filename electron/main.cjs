const { app, BrowserWindow, screen } = require('electron');

function createWindow() {
  const { height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: 400,
    height: 650,
    x: 20,
    y: height - 650,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
  });

  win.loadURL('http://localhost:5173/?mode=pet');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());