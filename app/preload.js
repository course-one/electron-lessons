// ipcRenderer: The ipcRenderer module is an EventEmitter. It provides a few methods so you can send synchronous 
// and asynchronous messages from the render process (web page) to the main process.
//
// contextBridge: Create a safe, bi-directional, synchronous bridge across isolated contexts
// The "Main World" is the JavaScript context that your main renderer code runs in. By default, the page you load in your renderer executes code in this world.
// When contextIsolation is enabled in your webPreferences (this is the default behavior since Electron 12.0.0), your preload scripts run in an "Isolated World".
const { contextBridge, ipcRenderer } = require('electron');

// This is basically the place to define the functions that let the renderer send messages to the Main process!
//
// exposeInMainWorld(apiKey: string, api: any). Confusingly enough, the main world is in the Renderer!
// apiKey string - The key to inject the API onto window with. The API will be accessible on window[apiKey].
// api any - Your API, more information on what this API can be and how it works is available below.
contextBridge.exposeInMainWorld('electron', {
  // This can be accessed from the renderer as: window.electron.copyFile(file: obj)
  copyFile: (file) => {
    ipcRenderer.send('app:on-file-copy', file);
  },
  // This can be accessed from the renderer as: window.electron.deleteFile(file: obj)
  deleteFile: (file) => {
    ipcRenderer.send('app:on-file-delete', file);
  },
  // This can be accessed from the renderer as: window.electron.openFile(file: obj)
  openFile: (file) => {
    ipcRenderer.send('app:on-file-open', file);
  },
  // This can be accessed from the renderer as:  await window.electron.dragDrop(fileNamesAndPaths)
  dragDrop: async (fileNamesAndPaths) => {
    await ipcRenderer.invoke('app:on-file-add', fileNamesAndPaths);
    return await ipcRenderer.invoke('app:get-files');
  },
  // This can be accessed from the renderer as: const files = await window.electron.openDialog()
  openDialog: async () => {
    await ipcRenderer.invoke('app:on-fs-dialog-open')
    return await ipcRenderer.invoke('app:get-files')    
  },
  // This can be accessed from the renderer as: const files = await window.electron.getFiles()
  getFiles: async () => {
    return await ipcRenderer.invoke('app:get-files');
  },
  // This can be accessed from the renderer as: const files = window.electron.onFileDelete((filename) => { // whatever })
  onFileDelete: (handler) => { 
    ipcRenderer.on('app:delete-file', (_event, filename) => {
      handler(filename)
    });
  }
});