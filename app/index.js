// The ipcMain module is a gateway to send and receive events from the renderer processes.
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// local dependencies
const io = require( './main/io' );
``
// open a window
const openWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js')
    },
  });

  // load `index.html` file
  win.loadFile(path.resolve(__dirname, './render/html/index.html'));

  return win;
};

// when app is ready, open a window
app.on('ready', () => {
  const win = openWindow();

  //  When an application window is opened, we call the io.watchFiles(win) method to watch the 
  // filesystem events of the appDir directory using the chokidar package. 
  // Here, the win object is the reference to the opened window which we need to send IPC events.
  io.watchFiles(win);
});

// when all windows are closed, quit the app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// when app activates, open a window
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openWindow();
  }
});

/*
  Handlers for an `invoke`able IPC. Handlers are called whenever a renderer calls `ipcRenderer.invoke(channel, ...args)`.
   handle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any))

  The ipcRenderer.invoke() method works just like the send() method but it returns a Promise. 
  We handle this event by registering a handler function with the ipcMain.handle() method. 
  
  The handler function of this event must be synchronous which means once this handler function returns, 
  the Promise returned by invoke() method will be resolved.
*/

// returns a list of files from the application’s file storage directory
ipcMain.handle('app:get-files', () => {
  return io.getFiles();
});

// listen to file(s) add event. Adds files to the appDir directory when the user drops some files on the Drag-and-Drop area of the application window.
ipcMain.handle('app:on-file-add', (_event, files = []) => {
  io.addFiles(files);
});

// open filesystem dialog to choose files
ipcMain.handle('app:on-fs-dialog-open', (_event) => {
  // dialog.showOpenDialogSync() is a synchronous operation, it will block the handler function of this event unless the files are selected or the dialog is closed. 
  // It will return the list of files selected by the user else undefined is returned. 
  // This list is an array of absolute paths of the files on the filesystem selected by the user. 
  // If you don’t want to block the main thread, then use the showOpenDialog method instead which returns a Promise.
  const files = dialog.showOpenDialogSync({
    properties: ['openFile', 'multiSelections'],
  });

  io.addFiles(files.map(filepath => {
    return {
      name: path.parse(filepath).base,
      path: filepath,
    };
  }));
});

/*
  Listens to `channel`, when a new message arrives `listener` would be called with `listener(event, args...)`.
   on(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void)

  When a renderer process sends an event to the main process using ipcRenderer.send() method, 
  the main process listens to that event by attaching an event listener using ipcMain.on() method.

  This mechanism of sending an event from the renderer process to the main process is asynchronous. 
  Once the event is sent, the handler of this event in the main process might perform some asynchronous task 
  and the sender which is the renderer process will have no idea of whether that task is finished.

  The event.sender property contains the reference of the renderer process which has sent this event.
*/

// listen to file delete event
ipcMain.on('app:on-file-delete', (_event, file) => {
  io.deleteFile(file.filepath);
});

// listen to file open event
ipcMain.on('app:on-file-open', (_event, file) => {
  io.openFile(file.filepath);
});

// listen to file copy event
ipcMain.on('app:on-file-copy', (event, file) => {
  // file is an absolute path of the file to copy (on the filesystem) 
  // and icon is the ghost image to display while performing the drag operation
  // This is an Electron method
  event.sender.startDrag({
    file: file.filepath,
    icon: path.resolve(__dirname, './resources/paper.png'),
  });
});