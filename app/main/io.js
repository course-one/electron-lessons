const { ipcMain } = require( 'electron' );
const path = require( 'path' );
const fs = require( 'fs-extra' );
const os = require( 'os' );
const open = require( 'open' );
const chokidar = require( 'chokidar' );

// local dependencies
const notification = require( './notification' );

// get application directory
const appDir = path.resolve( os.homedir(), 'electron-app-files' );

/****************************/

// get the list of files
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

/****************************/

// add files
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
exports.openFile = ( filename ) => {
    const filePath = path.resolve( appDir, filename );

    // open a file using default application
    if( fs.existsSync( filePath ) ) {
        open( filePath );
    }
};

/*-----*/

// watch files from the application's storage directory
exports.watchFiles = ( win ) => {
    chokidar.watch( appDir ).on( 'unlink', ( filepath ) => {
        win.webContents.send( 'app:delete-file', path.parse( filepath ).base );
    } );
}
