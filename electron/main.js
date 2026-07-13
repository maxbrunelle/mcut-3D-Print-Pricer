import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;

function createWindow(port) {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL(`http://localhost:${port}`);
}

app.whenReady().then(() => {
  // Start local server for Firebase Auth compatibility
  const expressApp = express();
  expressApp.use(express.static(path.join(__dirname, '../dist')));
  
  // SPA fallback
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  server = expressApp.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    createWindow(port);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(server.address().port);
    }
  });
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
