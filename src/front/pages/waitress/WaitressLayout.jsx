import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container } from '../../components/common';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { LogOut } from 'lucide-react';
import useGlobalReducer from '../../hooks/useGlobalReducer';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const handleLogout = () => {
        dispatch({ type: "logout" });
    };

    const navbarStyles = {
        backgroundColor: colors.primary.main,
        padding: `${spacing.sm} 0`,
    };

    const containerStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: `0 ${spacing.md}`,
    };

    const leftSectionStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
    };

    const brandStyles = {
        color: colors.neutral.white,
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        marginRight: spacing.xl,
    };

    const navLinkStyles = {
        color: colors.neutral.white,
        textDecoration: 'none',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: borderRadius.sm,
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: colors.primary.dark,
        },
    };

    const activeLinkStyles = {
        ...navLinkStyles,
        backgroundColor: colors.primary.dark,
    };

    const userSectionStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
    };

    const logoutButtonStyles = {
        backgroundColor: 'transparent',
        color: colors.neutral.white,
        border: `1px solid ${colors.neutral.white}`,
        padding: `${spacing.xs} ${spacing.md}`,
        borderRadius: borderRadius.md,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: colors.neutral.white,
            color: colors.primary.main,
        },
    };

    return (
        <div>
            <nav style={navbarStyles}>
                <div style={containerStyles}>
                    <div style={leftSectionStyles}>
                        <Link style={brandStyles} to="/waitress/orders">
                            <i className="fa-solid fa-bell-concierge"></i>
                            <span className="d-none d-sm-inline">Waitress Panel</span>
                        </Link>

                        <div className="d-none d-md-flex" style={{ gap: spacing.md }}>
                            <Link
                                to="/waitress/orders"
                                style={location.pathname === '/waitress/orders' ? activeLinkStyles : navLinkStyles}
                            >
                                <i className="fa-solid fa-receipt"></i> Órdenes
                            </Link>
                            <Link
                                to="/waitress/tables"
                                style={location.pathname === '/waitress/tables' ? activeLinkStyles : navLinkStyles}
                            >
                                <i className="fa-solid fa-table"></i> Tables
                            </Link>
                        </div>
                    </div>

                    <div style={userSectionStyles}>
                        <button
                            style={logoutButtonStyles}
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                            <span className="d-none d-sm-inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </nav>
            <Container>
                <Outlet />
            </Container>
        </div>
    );
};

export default WaitressLayout; 