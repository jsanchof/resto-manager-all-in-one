// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    main: '#FF6B6B',  // Restaurant theme red
    light: '#FF8E8E',
    dark: '#E65252',
  },
  // Secondary Colors
  secondary: {
    main: '#4ECDC4',  // Complementary teal
    light: '#6ED7D0',
    dark: '#3BB3AB',
  },
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    background: '#F8F9FA',
    lightGray: '#E9ECEF',
    gray: '#6C757D',
    darkGray: '#343A40',
    black: '#212529',
  },
  // Status Colors
  status: {
    success: '#2ECC71',
    warning: '#F1C40F',
    error: '#E74C3C',
    info: '#3498DB',
  }
};

// Typography
export const typography = {
  fontFamily: {
    primary: "'Poppins', sans-serif",
    secondary: "'Playfair Display', serif",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
};

// Spacing
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
};

// Border Radius
export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '1rem',      // 16px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
};

// Z-index
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
};

// Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}; 