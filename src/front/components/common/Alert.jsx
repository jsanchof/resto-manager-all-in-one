import React from 'react';
import PropTypes from 'prop-types';
import { colors, typography, spacing, borderRadius, transitions } from '../../theme';

const alertVariants = {
    success: {
        backgroundColor: `${colors.status.success}20`,
        borderColor: colors.status.success,
        color: colors.status.success,
        icon: '✓',
    },
    warning: {
        backgroundColor: `${colors.status.warning}20`,
        borderColor: colors.status.warning,
        color: colors.status.warning,
        icon: '⚠',
    },
    error: {
        backgroundColor: `${colors.status.error}20`,
        borderColor: colors.status.error,
        color: colors.status.error,
        icon: '✕',
    },
    info: {
        backgroundColor: `${colors.status.info}20`,
        borderColor: colors.status.info,
        color: colors.status.info,
        icon: 'ℹ',
    },
};

const Alert = ({
    variant = 'info',
    title,
    message,
    onClose,
    showIcon = true,
    className = '',
}) => {
    const variantStyles = alertVariants[variant];

    const containerStyles = {
        display: 'flex',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        border: `1px solid ${variantStyles.borderColor}`,
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.color,
        marginBottom: spacing.md,
        transition: transitions.normal,
    };

    const iconStyles = {
        marginRight: spacing.sm,
        fontSize: typography.fontSize.xl,
        lineHeight: 1,
    };

    const contentStyles = {
        flex: 1,
    };

    const titleStyles = {
        margin: 0,
        marginBottom: title && message ? spacing.xs : 0,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
    };

    const messageStyles = {
        margin: 0,
        fontSize: typography.fontSize.base,
        opacity: 0.9,
    };

    const closeButtonStyles = {
        background: 'none',
        border: 'none',
        padding: spacing.xs,
        marginLeft: spacing.sm,
        cursor: 'pointer',
        color: variantStyles.color,
        fontSize: typography.fontSize.xl,
        lineHeight: 1,
        opacity: 0.6,
        transition: transitions.normal,
        '&:hover': {
            opacity: 1,
        },
    };

    return (
        <div style={containerStyles} className={className} role="alert">
            {showIcon && (
                <span style={iconStyles} aria-hidden="true">
                    {variantStyles.icon}
                </span>
            )}
            <div style={contentStyles}>
                {title && <h4 style={titleStyles}>{title}</h4>}
                {message && <p style={messageStyles}>{message}</p>}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    style={closeButtonStyles}
                    aria-label="Close alert"
                >
                    ×
                </button>
            )}
        </div>
    );
};

Alert.propTypes = {
    variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
    title: PropTypes.string,
    message: PropTypes.string,
    onClose: PropTypes.func,
    showIcon: PropTypes.bool,
    className: PropTypes.string,
};

export default Alert; 