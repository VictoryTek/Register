import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define color palette that works well with typical logo colors
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      ...(mode === 'light'
        ? {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          }
        : {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
          }),
    },
    secondary: {
      ...(mode === 'light'
        ? {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
          }
        : {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
          }),
    },
    background: {
      ...(mode === 'light'
        ? {
            default: '#f5f5f5',
            paper: '#ffffff',
          }
        : {
            default: '#0a0a0a',
            paper: '#1a1a1a',
          }),
    },
    text: {
      ...(mode === 'light'
        ? {
            primary: '#000000',
            secondary: '#666666',
          }
        : {
            primary: '#ffffff',
            secondary: '#b3b3b3',
          }),
    },
    divider: mode === 'light' ? '#e0e0e0' : '#333333',
    action: {
      ...(mode === 'light'
        ? {}
        : {
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.12)',
          }),
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
    },
    h2: {
      fontWeight: 300,
    },
    h3: {
      fontWeight: 400,
    },
    h4: {
      fontWeight: 400,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export const createAppTheme = (mode: PaletteMode) => {
  const tokens = getDesignTokens(mode);
  
  return createTheme({
    ...tokens,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 2px 4px rgba(0,0,0,0.1)' 
              : '0 2px 4px rgba(0,0,0,0.3)',
            borderRadius: 12,
            border: mode === 'dark' ? '1px solid #333333' : 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            ...(mode === 'dark' && {
              backgroundImage: 'none',
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              backgroundColor: '#1a1a1a',
              borderBottom: '1px solid #333333',
            }),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(mode === 'dark' && {
              backgroundColor: '#1a1a1a',
              borderRight: '1px solid #333333',
            }),
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(144, 202, 249, 0.12)',
                '&:hover': {
                  backgroundColor: 'rgba(144, 202, 249, 0.16)',
                },
              },
            }),
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#333333',
                },
                '&:hover fieldset': {
                  borderColor: '#555555',
                },
              },
            }),
          },
        },
      },
    },
  });
};

// Default theme (light mode)
const theme = createAppTheme('light');

export default theme;
