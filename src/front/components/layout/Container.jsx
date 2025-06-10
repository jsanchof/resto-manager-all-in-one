import React from 'react';
import PropTypes from 'prop-types';
import { breakpoints, spacing } from '../../theme';

const Container = ({
    children,
    maxWidth = 'lg',
    padding = true,
    className = '',
    ...props
}) => {
    const getMaxWidth = () => {
        switch (maxWidth) {
            case 'sm':
                return breakpoints.sm;
            case 'md':
                return breakpoints.md;
            case 'lg':
                return breakpoints.lg;
            case 'xl':
                return breakpoints.xl;
            case 'full':
                return '100%';
            default:
                return breakpoints.lg;
        }
    };

    const baseStyles = {
        width: '100%',
        maxWidth: getMaxWidth(),
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: padding ? `0 ${spacing.md}` : '0',
        boxSizing: 'border-box',
    };

    return (
        <div
            style={baseStyles}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
};

Container.propTypes = {
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
    padding: PropTypes.bool,
    className: PropTypes.string,
};

export default Container; 