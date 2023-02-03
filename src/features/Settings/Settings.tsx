import React, { useState } from 'react';
import { Box } from '@mui/material';
import SettingsNav from './SettingsNav';
import SettingsUsers from './SettingsUsers';
import SettingsRoles from './SettingsRoles';

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

        break;
      case 'state':

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

  return (
    <Box sx={{ display: 'flex', paddingTop: 8, height: '100%', minHeight: '100vh' }}>
      <SettingsNav page={page} setPage={(value: string) => setPage(value)} />
      {returnRender()}
    </Box>
  );
}

export default Settings;