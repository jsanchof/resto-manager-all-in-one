import { Link, useNavigate } from "react-router-dom"
import useGlobalReducer from "../../hooks/useGlobalReducer"
import { LogOut } from "lucide-react"
import { colors, typography, spacing, borderRadius } from '../../theme'

function Navbar({ toggleSidebar, toggleUserType }) {
  const navigate = useNavigate()
  const { store, dispatch } = useGlobalReducer()

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
    <nav style={navbarStyles}>
      <div style={containerStyles}>
        <div style={leftSectionStyles}>
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={toggleSidebar}
            style={{
              padding: spacing.xs,
              color: colors.neutral.white,
            }}
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          <Link style={brandStyles} to="/client/create-order">
            <i className="fa-solid fa-house-user"></i>
            <span className="d-none d-sm-inline">Client Dashboard</span>
          </Link>

          <div className="d-none d-md-flex" style={{ gap: spacing.md }}>
            <Link style={navLinkStyles} to="/client/create-order">
              <i className="fa-solid fa-basket-shopping"></i> Create Order
            </Link>
            <Link style={navLinkStyles} to="/client/my-orders">
              <i className="fa-solid fa-cart-plus"></i> My Orders
            </Link>
          </div>
        </div>

        <div style={userSectionStyles}>
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
  )
}

export default Navbar