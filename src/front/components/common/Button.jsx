import React from 'react';
import PropTypes from 'prop-types';
import { colors, typography, spacing, borderRadius, transitions } from '../../theme';

const buttonVariants = {
    primary: {
        backgroundColor: colors.primary.main,
        color: colors.neutral.white,
        hoverBg: colors.primary.dark,
        activeBg: colors.primary.light,
    },
    secondary: {
        backgroundColor: colors.secondary.main,
        color: colors.neutral.white,
        hoverBg: colors.secondary.dark,
        activeBg: colors.secondary.light,
    },
    outline: {
        backgroundColor: 'transparent',
        color: colors.primary.main,
        border: `1px solid ${colors.primary.main}`,
        hoverBg: colors.primary.light,
        hoverColor: colors.neutral.white,
    },
    text: {
        backgroundColor: 'transparent',
        color: colors.primary.main,
        hoverBg: colors.neutral.lightGray,
    },
};

const buttonSizes = {
    small: {
        padding: `${spacing.xs} ${spacing.sm}`,
        fontSize: typography.fontSize.sm,
    },
    medium: {
        padding: `${spacing.sm} ${spacing.md}`,
        fontSize: typography.fontSize.base,
    },
    large: {
        padding: `${spacing.md} ${spacing.lg}`,
        fontSize: typography.fontSize.lg,
    },
};

const Button = ({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    children,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];

    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        fontFamily: typography.fontFamily.primary,
        fontWeight: typography.fontWeight.medium,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: transitions.normal,
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...variantStyles,
        ...sizeStyles,
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={baseStyles}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    fullWidth: PropTypes.bool,
    disabled: PropTypes.bool,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
};

export default Button; 