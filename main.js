const { app, BrowserWindow, ipcMain } = require( 'electron' );

// open a window
const openWindow = ( type ) => {
    const win = new BrowserWindow( {
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
        },
    } );

    if( type === 'image' ) {
        win.loadFile( './image.html' ); // image window
    } else {
        win.loadFile( './hello.html' ); // default window
    }
}

// when app is ready, create a window
app.on( 'ready', () => {
    openWindow(); // open default window
} );

// when all windows are closed, quit the application
app.on( 'window-all-closed', () => {
    if( process.platform !== 'darwin' ) {
        app.quit(); // exit
    }
} );

// when application is activated, open default window
app.on( 'activate', () => {
    if( BrowserWindow.getAllWindows().length === 0 ) {
        openWindow(); // open default window
    }
} );

// listen to application messages
ipcMain.on( 'app:display-image', () => {
    console.log( '[message received]', 'app:display-image' );
    openWindow( 'image' ); // open image window
} )