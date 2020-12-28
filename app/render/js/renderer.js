const dragDrop = require( 'drag-drop' );
const { ipcRenderer } = require( 'electron' );

// local dependencies
const dom = require( './dom' );

// get list of files from the `main` process
ipcRenderer.invoke( 'app:get-files' ).then( ( files = [] ) => {
    dom.displayFiles( files );
} );

// handle file delete event
ipcRenderer.on( 'app:delete-file', ( event, filename ) => {
    document.getElementById( filename ).remove();
} );

// add files drop listener
dragDrop( '#uploader', ( files ) => {
    const _files = files.map( file => {
        return {
            name: file.name,
            path: file.path,
        };
    } );

    // send file(s) add event to the `main` process
    ipcRenderer.invoke( 'app:on-file-add', _files ).then( () => {
        ipcRenderer.invoke( 'app:get-files' ).then( ( files = [] ) => {
            dom.displayFiles( files );
        } );
    } );
} );


// add click listener on the `#filelist` element
document.getElementById( 'filelist' ).addEventListener( 'click', ( event ) => {

    // ignore other element clicks
    if( ! [ 'delete', 'open' ].includes( event.target.id ) ) {
        return;
    }

    // get filename and filepath
    const itemId = event.target.parentNode.getAttribute( 'id' );
    const filepath = event.target.parentNode.getAttribute( 'data-filepath' );

    if( event.target.id === 'delete' ) {
        ipcRenderer.send( 'app:on-file-delete', { id: itemId, filepath } );
        document.getElementById( itemId ).remove();

    } else if( event.target.id === 'open' ) {
        ipcRenderer.send( 'app:on-file-open', { id: itemId, filepath } );
    }
} );