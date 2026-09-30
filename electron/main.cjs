const { app, BrowserWindow, screen } = require('electron');

const URL = 'http://localhost:5173/';

function createPetWindow() {
  const { height } = screen.getPrimaryDisplay().workAreaSize;

  const pet = new BrowserWindow({
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

  pet.loadURL(`${URL}?mode=pet`);
  return pet;
}

function createChatWindow() {
  const chat = new BrowserWindow({
    width: 1000,
    height: 750,
    title: 'EXO ASSISTANCE',
    autoHideMenuBar: true,
    backgroundColor: '#0f0f1a',
  });

  chat.loadURL(URL);

  // Closing the chat window closes Haru too
  chat.on('closed', () => app.quit());
  return chat;
}

app.whenReady().then(() => {
  createPetWindow();
  createChatWindow();
});

app.on('window-all-closed', () => app.quit());
