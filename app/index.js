const { app, BrowserWindow, ipcMain, webContents } = require( 'electron' );
const path = require( 'path' );

// local dependencies
const io = require( './main/io' );

// open a window
const openWindow = () => {
    const window = new BrowserWindow( {
        width: 800,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
        },
    } );

    // load `index.html` file
    window.loadFile( path.resolve( __dirname, 'render/html/index.html' ) );

    /*-----*/
    
    // watch files
    io.watchFiles( window );
};

// when app is ready, open a window
app.on( 'ready', () => {
    openWindow();
} );

// when all windows are closed, quit the app
app.on( 'window-all-closed', () => {
    if( process.platform !== 'darwin' ) {
        app.quit();
    }
} );

// when app activates, open a window
app.on( 'activate', () => {
    if( BrowserWindow.getAllWindows().length === 0 ) {
        openWindow();
    }
} );

/************************/

// return list of files
ipcMain.handle( 'app:get-files', () => {
    return io.getFiles();
} );

/*-----*/

// listen to file(s) add event
ipcMain.handle( 'app:on-file-add', ( event, files = [] ) => {
    io.addFiles( files );
} );

// listen to file delete event
ipcMain.on( 'app:on-file-delete', ( event, file ) => {
    io.deleteFile( file.filepath );
} );

// listen to file open event
ipcMain.on( 'app:on-file-open', ( event, file ) => {
    io.openFile( file.filepath );
} );

// listen to file copy event
ipcMain.on( 'app:on-file-copy', ( event, file ) => {
    event.sender.startDrag( {
        file: file.filepath,
        icon: path.resolve( __dirname, '../resources/paper.png' ),
    } );
} );