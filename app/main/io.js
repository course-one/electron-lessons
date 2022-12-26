const path = require( 'path' );
const fs = require( 'fs-extra' );
const os = require( 'os' );
const open = require( 'open' );
const chokidar = require( 'chokidar' );

// local dependencies
const notification = require( './notification' );

// get application directory
// This is the directory path on the filesystem where the files uploaded on this application will be stored
// The os.homedir() method returns the absolute path of the user’s home directory.
// This means the directory of the file storage for our application would be $HOME/electron-app-files.
const appDir = path.resolve( os.homedir(), 'electron-app-files' );

// get the list of files
// The getFiles() function returns the list of files in the form of {name, path, size} object from the appDir directory.
exports.getFiles = () => {
    const files = fs.readdirSync( appDir );

    return files.map( filename => {
        const filePath = path.resolve( appDir, filename );
        const fileStats = fs.statSync( filePath );

        return {
            name: filename,
            path: filePath,
            size: Number( fileStats.size / 1000 ).toFixed( 1 ), // kb
        };
    } );
};

// add files
// The addFiles() function creates the appDir directory if doesn’t exist and copies the files from the files array to the appDir directory
exports.addFiles = ( files = [] ) => {
    
    // ensure `appDir` exists
    fs.ensureDirSync( appDir );
    
    // copy `files` recursively (ignore duplicate file names)
    files.forEach( file => {
        const filePath = path.resolve( appDir, file.name );

        if( ! fs.existsSync( filePath ) ) {
            fs.copyFileSync( file.path, filePath );
        }
    } );

    // display notification
    notification.filesAdded( files.length );
};

// delete a file
exports.deleteFile = ( filename ) => {
    const filePath = path.resolve( appDir, filename );

    // remove file from the file system
    if( fs.existsSync( filePath ) ) {
        fs.removeSync( filePath );
    }
};

// open a file
// The openFile() method opens a file using the open package.
exports.openFile = ( filename ) => {
    const filePath = path.resolve( appDir, filename );

    // open a file using default application
    if( fs.existsSync( filePath ) ) {
        open( filePath );
    }
};

// watch files from the application's storage directory
// The watchFiles() function watches for the unlink operation performed inside the appDir directory using the chokidar package. 
// Once a file is deleted (unlinked), we send the app:delete-file event back to the opened window 
// and the renderer process of that window removes the entry (HTML div element) of that file from the UI.
exports.watchFiles = ( win ) => {
    chokidar.watch( appDir ).on( 'unlink', ( filepath ) => {
        // The win.webContents.send() operation sends event from the main process to a renderer process identified by the webContents.
        // The reason we don’t have ipcMain.send() method is that an application could be multiple renderer processes.
        // So we need to pick a renderer process to which we need to send an IPC event which is retrieved here from the win reference.
        win.webContents.send( 'app:delete-file', path.parse( filepath ).base );
    } );
}