import React from 'react';
import PropTypes from 'prop-types';
import { colors, typography, spacing, borderRadius, transitions } from '../../theme';

const Input = ({
    type = 'text',
    label,
    error,
    helperText,
    fullWidth = false,
    disabled = false,
    required = false,
    className = '',
    children,
    ...props
}) => {
    const baseStyles = {
        display: 'block',
        width: fullWidth ? '100%' : 'auto',
        padding: `${spacing.sm} ${spacing.md}`,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.primary,
        color: colors.neutral.black,
        backgroundColor: disabled ? colors.neutral.lightGray : colors.neutral.white,
        border: `1px solid ${error ? colors.status.error : colors.neutral.gray}`,
        borderRadius: borderRadius.md,
        transition: transitions.normal,
        outline: 'none',
        '&:focus': {
            borderColor: error ? colors.status.error : colors.primary.main,
            boxShadow: `0 0 0 2px ${error ? colors.status.error + '40' : colors.primary.main + '40'}`,
        },
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.7,
        },
    };

    const labelStyles = {
        display: 'block',
        marginBottom: spacing.xs,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: error ? colors.status.error : colors.neutral.darkGray,
    };

    const helperTextStyles = {
        display: 'block',
        marginTop: spacing.xs,
        fontSize: typography.fontSize.xs,
        color: error ? colors.status.error : colors.neutral.gray,
    };

    const renderInput = () => {
        if (type === 'select') {
            return (
                <select
                    disabled={disabled}
                    required={required}
                    style={baseStyles}
                    {...props}
                >
                    {children}
                </select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    disabled={disabled}
                    required={required}
                    style={baseStyles}
                    {...props}
                />
            );
        }

        return (
            <input
                type={type}
                disabled={disabled}
                required={required}
                style={baseStyles}
                {...props}
            />
        );
    };

    return (
        <div className={className} style={{ marginBottom: spacing.md }}>
            {label && (
                <label style={labelStyles}>
                    {label}
                    {required && <span style={{ color: colors.status.error }}> *</span>}
                </label>
            )}
            {renderInput()}
            {helperText && (
                <span style={helperTextStyles}>{helperText}</span>
            )}
        </div>
    );
};

Input.propTypes = {
    type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local', 'select', 'textarea']),
    label: PropTypes.string,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    fullWidth: PropTypes.bool,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default Input; 