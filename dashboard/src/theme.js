// Design tokens and theme configuration
export const colors = {
  light: {
    background: '#F4F7F6',
    surface: '#FFFFFF',
    surface_secondary: '#EAF0EE',
    primary: '#163A3A',
    primary_light: '#2D6660',
    accent_mint: '#55B89A',
    accent_amber: '#E6A23C',
    success: '#2E8B68',
    warning: '#D89532',
    danger: '#C95C54',
    info: '#4C7FA3',
    text_primary: '#172222',
    text_secondary: '#667574',
    border: '#D9E2DF'
  },
  dark: {
    background: '#101918',
    surface: '#172322',
    surface_secondary: '#20302E',
    primary: '#8DD5C0',
    accent_mint: '#55B89A',
    accent_amber: '#E6A23C',
    success: '#59B88D',
    warning: '#E2A94B',
    danger: '#D96D65',
    info: '#73A7C8',
    text_primary: '#EDF5F2',
    text_secondary: '#9CAFAA',
    border: '#30413E'
  }
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
};

export const typography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  },
  weights: {
    heading: 650,
    body: 400,
    metric: 650
  }
};

export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440
};
