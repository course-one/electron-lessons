import path from 'path';
import fs from 'fs';

// get application version from `static/version.txt`
export const getVersion = () => {
    const versionFilePath = path.resolve( __static, 'version.txt' );
    return fs.readFileSync( versionFilePath, {
        encoding: 'utf-8',
    } );
};
