const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function init() {
    // create browser window
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 775,
        // webPreferences: {
        //     nodeIntegration: true, // enable nodejs integration, "trezor-connect" will use nodejs implementation
        // },
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    // TODO: doesn't work with electron@7
    // mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    //     console.log('NEW WINDOW!', frameName);
    //     if (frameName === 'modal') {
    //         // open window as modal
    //         event.preventDefault()
    //         options.webPreferences.affinity = 'main-window';
    //         Object.assign(options, {
    //             modal: true,
    //             parent: mainWindow,
    //             width: 780,
    //             height: 620,
    //             center: true,
    //             closable: true, // doesn't work?, im not sure how to close this modal yet, should i render "close" button inside popup.html?
    //         });
    //         event.newGuest = new BrowserWindow(options);
    //     }
    // });

    // emitted when the window is closed.
    mainWindow.on('closed', () => {
        app.quit();

        mainWindow = null;
    });
}

app.on('ready', init);

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
        init();
    }
});

app.on('browser-window-focus', (event, win) => {
    if (!win.isDevToolsOpened()) {
        win.openDevTools();
    }
});
