import React from 'react';
import PropTypes from 'prop-types';

const Container = ({ children, maxWidth = 'lg', className = '', ...props }) => {
    const getMaxWidthClass = () => {
        switch (maxWidth) {
            case 'sm':
                return 'max-w-sm';
            case 'md':
                return 'max-w-md';
            case 'lg':
                return 'max-w-lg';
            case 'xl':
                return 'max-w-xl';
            case 'full':
                return 'max-w-full';
            default:
                return 'max-w-lg';
        }
    };

    return (
        <div className={`container mx-auto px-4 ${getMaxWidthClass()} ${className}`} {...props}>
            {children}
        </div>
    );
};

Container.propTypes = {
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
    className: PropTypes.string,
};

export default Container; 