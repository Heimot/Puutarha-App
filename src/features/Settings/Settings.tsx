import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import SettingsNav from './SettingsNav';
import SettingsUsers from './Users/SettingsUsers';
import SettingsRoles from './Roles/SettingsRoles';
import { useTheme } from '@emotion/react';
import SettingsRFID from './RFID/SettingsRFID';
import SettingsState from './SettingsState.tsx/SettingsState';

const Settings = () => {
  const [page, setPage] = useState<string>('');

  const returnRender = () => {
    let render = null;
    switch (page) {
      case 'language':

        break;
      case 'users':
        render = <SettingsUsers />;
        break;
      case 'roles':
        render = <SettingsRoles />;
        break;
      case 'rfid':
        render = <SettingsRFID />
        break;
      case 'state':
        render = <SettingsState />
        break;
      case 'status':

        break;
      case 'location':

        break;
      case 'autofill':

        break;
      case 'stickers':

        break;
      case 'logs':

        break;
      default:
        render = null;
        break;
    }
    return render;
  }

  const oldTheme = useTheme();

  const theme = createTheme({
    ...oldTheme,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 1000,
        lg: 1200,
        xl: 1536,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Grid container sx={{ paddingTop: 8, minHeight: '100vh' }}>
        <Grid xs={12} md={2}>
          <SettingsNav page={page} setPage={(value: string) => setPage(value)} />
        </Grid>
        <Grid xs={12} md={10}>
          {returnRender()}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default Settings;