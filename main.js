const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'dist/gym-manager-app/browser/assets/gym-equipment.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Opcional: Eliminar el menú por defecto para un look de app nativa
  Menu.setApplicationMenu(null);

  // Apuntamos al archivo index.html generado por Angular tras el build
  mainWindow.loadFile(path.join(__dirname, 'dist/gym-manager-app/browser/index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
