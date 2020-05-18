import * as classNames from 'classnames';
import React from 'react';
import { useTransition } from 'react-spring';

export default props => {
    const {
        items, // [{ key, onClick, ...otherProps }]
        from, // item => { ...otherProps }
        update, // item => { ...otherProps }
        clickable, // boolean
        animated, // (item, props) => <animated className='positioned item' />
    } = props;

    const transitions = useTransition(items, item => item.key, {
        from,
        enter: update,
        update,
        leave: from,
        unique: true,
    });

    return transitions.map(({ item, props }) => {
        let child = animated(item, props);
        if (clickable) {
            child = <div
                key={item.key}
                className={classNames('positioned', { 'selectable': item.onClick !== undefined })}
                onClick={item.onClick}
            >
                {child}
            </div>;
        }
        return child;
    });
}
