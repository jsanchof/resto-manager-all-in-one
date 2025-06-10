import { Link, useLocation } from "react-router-dom"
import { LogOut, BarChart2, ShoppingBag, Users, FileText, Calendar, Utensils } from "lucide-react"
import { colors, typography, spacing, borderRadius } from '../../theme'
import useGlobalReducer from "../../hooks/useGlobalReducer"

function AdminNavbar({ toggleSidebar }) {
  const { store, dispatch } = useGlobalReducer()
  const location = useLocation()

  function handleLogout() {
    dispatch({ type: "logout" })
  }

  const navbarStyles = {
    backgroundColor: colors.secondary.main, // Using secondary color for admin
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
      backgroundColor: colors.secondary.dark,
    },
  };

  const activeLinkStyles = {
    ...navLinkStyles,
    backgroundColor: colors.secondary.dark,
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
      color: colors.secondary.main,
    },
  };

  const isActive = (path) => location.pathname === path;

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

          <Link style={brandStyles} to="/admin">
            <i className="fa-solid fa-shield-halved"></i>
            <span className="d-none d-sm-inline">Panel de Administración</span>
          </Link>

          <div className="d-none d-md-flex" style={{ gap: spacing.md }}>
            <Link
              style={isActive('/admin') ? activeLinkStyles : navLinkStyles}
              to="/admin"
            >
              <FileText size={20} /> Orders
            </Link>
            <Link
              style={isActive('/admin/productos') ? activeLinkStyles : navLinkStyles}
              to="/admin/productos"
            >
              <ShoppingBag size={20} /> Products
            </Link>
            <Link
              style={isActive('/admin/ingredients') ? activeLinkStyles : navLinkStyles}
              to="/admin/ingredients"
            >
              <Utensils size={20} /> Ingredients
            </Link>
            <Link
              style={isActive('/admin/usuarios') ? activeLinkStyles : navLinkStyles}
              to="/admin/usuarios"
            >
              <Users size={20} /> Users
            </Link>
            <Link
              style={isActive('/admin/reservas') ? activeLinkStyles : navLinkStyles}
              to="/admin/reservas"
            >
              <Calendar size={20} /> Reservations
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
  );
}

export default AdminNavbar;
