import { app, BrowserWindow } from 'electron';
import dotenv from 'dotenv';

dotenv.config();

const express = require('express');
const server = express();
const cors = require('cors');
const parser = require('./files');

const devToolsEnabled = parseInt(process.env.ENABLE_DEV_TOOLS, 10) === 1;

// Handle server requests to serve static files
server.use('/', express.static((__dirname)));

// Handle game files
server.get('/files', (req, res) => parser.get(req, res));

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

server.use(cors({ origin: '*' }));

// Enable audio autoplay
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// @todo not working
// app.commandLine.appendSwitch('enable-vulkan');
// app.commandLine.appendSwitch('ignore-gpu-blacklist');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Start listening to port 5737
  server.listen(5737, () => {});

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
  });

  // and load the index.html of the app.
  mainWindow.loadURL('http://127.0.0.1:5737');

  // Disabling the webtools
  if (!devToolsEnabled) {
    mainWindow.webContents.on('devtools-opened', () => { mainWindow.webContents.closeDevTools(); });
  }

  // Disabling the mainmenu
  if (!devToolsEnabled) {
    mainWindow.setMenu(null);
  }

  mainWindow.maximize();

    // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('close', () => {
    app.exit(0);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
