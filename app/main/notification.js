const { Notification } = require( 'electron' );

// display files added notification
// We are importing /app/main/notification.js file inside io.js file to show 
// a system notification when files are added to the appDir directory.
//
// For the renderer process, displaying notification is easy with the HTML notification API. 
// However, for the main process, we need to use the Notification module.
exports.filesAdded = ( size ) => {
    const notif = new Notification( {
        title: 'Files added',
        body: `${ size } file(s) has been successfully added.`
    } );

    notif.show();
};