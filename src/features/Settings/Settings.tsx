import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import SettingsNav from './SettingsNav';
import SettingsUsers from './Users/SettingsUsers';
import SettingsRoles from './Roles/SettingsRoles';
import { useTheme } from '@emotion/react';
import SettingsRFID from './RFID/SettingsRFID';
import SettingsState from './SettingsState/SettingsState';
import SettingsStatus from './SettingsStatus/SettingsStatus';
import SettingsNames from './SettingsNames/SettingsNames';
import SettingsLocation from './SettingsLocations/SettingsLocation';
import SettingsPDF from './SettingsPDF/SettingsPDF';
import PersonalSettings from './PersonalSettings';
import SettingsTrucks from './SettingsTrucks/SettingsTrucks';
import SettingsRoller from './SettingsRoller/SettingsRoller';

const Settings = () => {
  const [page, setPage] = useState<string>('');

  const returnRender = () => {
    let render = null;
    switch (page) {
      case 'personalsettings':
        render = <PersonalSettings />;
        break;
      case 'language':

        break;
      case 'users':
        render = <SettingsUsers />;
        break;
      case 'roles':
        render = <SettingsRoles />;
        break;
      case 'rfid':
        render = <SettingsRFID />;
        break;
      case 'state':
        render = <SettingsState />;
        break;
      case 'status':
        render = <SettingsStatus />;
        break;
      case 'location':
        render = <SettingsLocation />;
        break;
      case 'autofill':
        render = <SettingsNames />;
        break;
      case 'trucks':
        render = <SettingsTrucks />
        break;
      case 'rollers':
        render = <SettingsRoller />
        break;
      case 'stickers':
        render = <SettingsPDF />;
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