import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { LogOut, Bell } from "lucide-react"
import { colors, typography, spacing, borderRadius } from '../../theme'
import useGlobalReducer from "../../hooks/useGlobalReducer"

function KitchenNavbar() {
    const { store, dispatch } = useGlobalReducer()
    const [pendingCount, setPendingCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)

    // Fetch pending orders count
    const fetchPendingCount = async () => {
        try {
            const token = sessionStorage.getItem("access_token")
            if (!token) return

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cocina/ordenes/pendientes/count`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const data = await response.json()
            setPendingCount(data.count)
        } catch (error) {
            console.error("Error getting pending orders:", error)
        }
    }

    // Fetch count on mount and set up interval
    useEffect(() => {
        fetchPendingCount()
        const interval = setInterval(fetchPendingCount, 30000) // Update every 30 seconds
        return () => clearInterval(interval)
    }, [])

    function handleLogout() {
        dispatch({ type: "logout" })
    }

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

    const userSectionStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
    };

    const notificationButtonStyles = {
        backgroundColor: 'transparent',
        color: colors.neutral.white,
        border: `1px solid ${colors.neutral.white}`,
        padding: spacing.sm,
        borderRadius: borderRadius.full,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: colors.neutral.white,
            color: colors.primary.main,
        },
    };

    const badgeStyles = {
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        backgroundColor: colors.status.error,
        color: colors.neutral.white,
        fontSize: '0.75rem',
        fontWeight: typography.fontWeight.medium,
        padding: '2px 6px',
        borderRadius: borderRadius.full,
        border: `2px solid ${colors.primary.main}`,
    };

    const userInfoStyles = {
        color: colors.neutral.white,
        textAlign: 'right',
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

    const notificationMenuStyles = {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: spacing.sm,
        backgroundColor: colors.neutral.white,
        borderRadius: borderRadius.md,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '300px',
        zIndex: 1000,
        display: showNotifications ? 'block' : 'none',
    };

    return (
        <nav style={navbarStyles}>
            <div style={containerStyles}>
                <div style={leftSectionStyles}>
                    <Link style={brandStyles} to="/kitchen">
                        <i className="fa-solid fa-kitchen-set"></i>
                        <span className="d-none d-sm-inline">Panel de Cocina</span>
                    </Link>

                    <div className="d-none d-md-flex" style={{ gap: spacing.md }}>
                        <Link style={navLinkStyles} to="/kitchen">
                            <i className="fa-solid fa-utensils"></i> Órdenes
                        </Link>
                    </div>
                </div>

                <div style={userSectionStyles}>
                    <div style={{ position: 'relative' }}>
                        <button
                            style={notificationButtonStyles}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={18} />
                            {pendingCount > 0 && (
                                <span style={badgeStyles}>{pendingCount}</span>
                            )}
                        </button>

                        {/* Notification Menu */}
                        {showNotifications && (
                            <div style={notificationMenuStyles}>
                                <div style={{ padding: spacing.md }}>
                                    <h6 style={{ margin: 0, marginBottom: spacing.sm }}>Notifications</h6>
                                    {pendingCount > 0 ? (
                                        <p style={{ margin: 0, color: colors.neutral.gray }}>
                                            You have {pendingCount} pending {pendingCount === 1 ? 'order' : 'orders'} to attend
                                        </p>
                                    ) : (
                                        <p style={{ margin: 0, color: colors.neutral.gray }}>
                                            No pending orders
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="d-none d-md-block" style={userInfoStyles}>
                        <div style={{ fontSize: typography.fontSize.sm }}>Chef: John Smith</div>
                        <div style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.neutral.lightGray,
                        }}>
                            Shift: 8:00 - 16:00
                        </div>
                    </div>

                    <button
                        style={logoutButtonStyles}
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span className="d-none d-sm-inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default KitchenNavbar;
