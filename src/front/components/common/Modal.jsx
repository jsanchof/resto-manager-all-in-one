import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { colors, typography, spacing, borderRadius, shadows, zIndex } from '../../theme';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    showCloseButton = true,
    className = '',
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getModalSize = () => {
        switch (size) {
            case 'small':
                return '400px';
            case 'large':
                return '800px';
            default:
                return '600px';
        }
    };

    const overlayStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex.modal,
    };

    const modalStyles = {
        backgroundColor: colors.neutral.white,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.lg,
        width: '90%',
        maxWidth: getModalSize(),
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
    };

    const headerStyles = {
        padding: spacing.lg,
        borderBottom: `1px solid ${colors.neutral.lightGray}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const titleStyles = {
        margin: 0,
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.black,
    };

    const closeButtonStyles = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: typography.fontSize.xl,
        color: colors.neutral.gray,
        padding: spacing.xs,
        borderRadius: borderRadius.full,
        '&:hover': {
            backgroundColor: colors.neutral.lightGray,
        },
    };

    const contentStyles = {
        padding: spacing.lg,
    };

    return (
        <div style={overlayStyles} onClick={onClose}>
            <div
                style={modalStyles}
                className={className}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={headerStyles}>
                    <h2 style={titleStyles}>{title}</h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            style={closeButtonStyles}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div style={contentStyles}>
                    {children}
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showCloseButton: PropTypes.bool,
    className: PropTypes.string,
};

export default Modal; 