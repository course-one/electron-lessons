import React, { useState } from 'react';

// import styles (for compilation)
import './styles.scss';

// export a react component
export default ( props ) => {
    const [ count, incrementCount ] = useState( 0 );

    return (
        <div className='hello'>
            <h1>Hello { props.name } World!</h1>
            <h3>Counter: { count }</h3>
            <button
                onClick={ () => incrementCount( count + 1 ) }
                className={ count % 2 === 1 ? 'hello__btn--odd' : undefined }
            >Increment Counter</button>
        </div>
    );
};
