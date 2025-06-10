import React from 'react';
import PropTypes from 'prop-types';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const Card = ({
    children,
    variant = 'default',
    padding = 'medium',
    elevation = 'medium',
    className = '',
    ...props
}) => {
    const getPadding = () => {
        switch (padding) {
            case 'small':
                return spacing.sm;
            case 'large':
                return spacing.lg;
            default:
                return spacing.md;
        }
    };

    const getElevation = () => {
        switch (elevation) {
            case 'low':
                return shadows.sm;
            case 'high':
                return shadows.lg;
            default:
                return shadows.md;
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'outlined':
                return {
                    border: `1px solid ${colors.neutral.lightGray}`,
                    boxShadow: 'none',
                };
            case 'filled':
                return {
                    backgroundColor: colors.neutral.lightGray,
                    boxShadow: 'none',
                };
            default:
                return {
                    backgroundColor: colors.neutral.white,
                    boxShadow: getElevation(),
                };
        }
    };

    const baseStyles = {
        borderRadius: borderRadius.md,
        padding: getPadding(),
        ...getVariantStyles(),
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

Card.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
    padding: PropTypes.oneOf(['small', 'medium', 'large']),
    elevation: PropTypes.oneOf(['low', 'medium', 'high']),
    className: PropTypes.string,
};

export default Card; 