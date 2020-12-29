const { ipcRenderer } = require( 'electron' );

// copy file
window.copyFile = function ( event, itemId ) {
    event.preventDefault();

    // get path of the file
    const itemNode = document.getElementById( itemId );
    const filepath = itemNode.getAttribute( 'data-filepath' );

    // send event to the main thread
    ipcRenderer.send( 'app:on-file-copy', { id: itemId, filepath } );
};

// delete file
window.deleteFile = function ( itemId ) {

    // get path of the file
    const itemNode = document.getElementById( itemId );
    const filepath = itemNode.getAttribute( 'data-filepath' );

    // send event to the main thread
    ipcRenderer.send( 'app:on-file-delete', { id: itemId, filepath } );
};

// open file
window.openFile = function ( itemId ) {

    // get path of the file
    const itemNode = document.getElementById( itemId );
    const filepath = itemNode.getAttribute( 'data-filepath' );

    // send event to the main thread
    ipcRenderer.send( 'app:on-file-open', { id: itemId, filepath } );
};

exports.displayFiles = ( files = [] ) => {
    const fileListElem = document.getElementById( 'filelist' );
    fileListElem.innerHTML = '';

    files.forEach( file => {
        const itemDomElem = document.createElement( 'div' );
        itemDomElem.setAttribute( 'id', file.name ); // set `id` attribute
        itemDomElem.setAttribute( 'class', 'app__files__item' ); // set `class` attribute
        itemDomElem.setAttribute( 'data-filepath', file.path ); // set `data-filepath` attribute

        itemDomElem.innerHTML = `
            <img ondragstart='copyFile(event, "${ file.name }")' src='../assets/document.svg' class='app__files__item__file'/>
            <div class='app__files__item__info'>
                <p class='app__files__item__info__name'>${ file.name }</p>
                <p class='app__files__item__info__size'>${ file.size }KB</p>
            </div>
            <img onclick='deleteFile("${ file.name }")' src='../assets/delete.svg' class='app__files__item__delete'/>
            <img onclick='openFile("${ file.name }")' src='../assets/open.svg' class='app__files__item__open'/>
        `;

        fileListElem.appendChild( itemDomElem );
    } );
};
