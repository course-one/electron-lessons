import React from 'react';
import ReactDOM from 'react-dom';

// import entry component
import Entry from './entry';

// render `Entry` component
ReactDOM.render(
    <Entry name='React'/>,
    document.getElementById( 'app' ),
);