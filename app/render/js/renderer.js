// local dependencies
import { displayFiles } from './dom.js'

// get list of files from the `main` process
// we are invoking the app:get-files event to receive a list of files contained in the appDir directory from the main process. 
// There are no restrictions to get the list from the filesystem in the renderer process itself since
//  we have enabled the nodeIntegration but it’s a good idea to divide responsibilities between main and the renderer process
window.electron.getFiles().then((files) => {
    displayFiles(files);
});

// handle file delete event
// Then we are listening to the app:delete-file event sent by the main process when a file is deleted from the appDir directory. 
// In the handler function of this event, we are removing the HTML element that displays the entry of that file. Again, the filename is used as an id
window.electron.onFileDelete(function(filename) {
    document.getElementById(filename).remove();
});

// add files drop listener
// Using the drag-drop module, we are creating a dropzone on the #uploader element. 
// When some files are dropped on this element (area), we will get the list of files and
//  we invoke app:on-file-add event so that the main process can add those files in the appDir directory.
// This operation is not copying the bytes of the file but simply performing the copy operation.
document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    const fileNamesAndPaths = [];

    console.log(files);
    for (const f of files) {
        console.log('File(s) you dragged here: ', f.path);

        fileNamesAndPaths.push({
            name: f.name,
            path: f.path,
        });
    }

    console.log(fileNamesAndPaths);

    // send file(s) add event to the `main` process
    window.electron.dragDrop(fileNamesAndPaths).then((allFiles) => {
        displayFiles(allFiles);
    });
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

// open filesystem dialog
// When we use require() to import a script, all global variables defined in the imported file are not automatically added to the window object.
// To manually add a variable to the window object, we need to use window.<varname> expression.
// The window.openDialog() function opens the system dialog to choose files manually by invoking the app:on-fs-dialog-open event of the main process. 
// When a file is added in the main process, we invoke app:get-files event to refresh the list of the files displayed in the #filelist element.
window.openDialog = function () {
    window.electron.openDialog().then((files) => {
        displayFiles(files);
    });
}