import React, { useState, useEffect } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Select, MenuItem, Typography, Box, Button, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { Role, User, Settings } from '../../../Model';
import MenuDialog from '../../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FetchData from '../../Components/Fetch';
import Message from '../../Components/Message';

interface Props {
    user: User;
    roles: Role[];
    saveUser: (userId: string, roleId: string) => void;
    deleteUser: (userId: string) => void;
    updateSettings: (userId: string, showEmpty: boolean, useRfid: boolean) => void;
}

const SettingsUserCell: React.FC<Props> = ({ user, roles, saveUser, deleteUser, updateSettings }) => {
    const [role, setRole] = useState<string>('');
    const [settings, setSettings] = useState<Settings | null>(null);
    const [empty, setEmpty] = useState<boolean>(false);
    const [rfid, setRfid] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        if (typeof user?.role === 'string') {
            setRole(user?.role)
        } else {
            if (role === '') {
                if (!user?.role) return;
                setRole(user?.role._id)
            }
        }
    }, [user])

    useEffect(() => {
        if (!isSettingsOpen) return;
        const getSettings = async () => {
            if (!user?.personalSettings) return;
            setSettings(user?.personalSettings);
            setEmpty(user?.personalSettings?.showEmptyOrders);
            setRfid(user?.personalSettings?.disableRFIDScanning);
        }

        getSettings();
    }, [isSettingsOpen])

    const updateUserSettings = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                propName: "showEmptyOrders",
                value: empty
            },
            {
                propName: "disableRFIDScanning",
                value: rfid
            }
        ]
        await FetchData({ urlHost: url, urlPath: '/settings/edit_users_settings', urlMethod: 'PATCH', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentSettingsId=${settings?._id}`, urlBody: body });
        updateSettings(user?._id, empty, rfid);
        setMessageOpen(true);
    }

    return (
        <Tr>
            <Td style={borderStyle}>
                <Typography>{user?.email}</Typography>

            </Td>
            <Td style={borderStyle}>
                <Typography>{user?.username}</Typography>
            </Td>
            <Td style={borderStyle}>
                <Select value={role} onChange={(e: any) => setRole(e.target.value)} fullWidth>
                    {
                        roles.map((role) => (
                            <MenuItem key={role?._id} value={role?._id}>{role?.role}</MenuItem>
                        ))
                    }
                </Select>
            </Td>
            <Td style={borderStyle}>
                <Box style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                    <Button fullWidth onClick={() => setIsSettingsOpen(true)}>Muuta</Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveUser(user._id, role)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isSettingsOpen} setIsOpen={(value: boolean) => setIsSettingsOpen(value)} result={() => updateUserSettings()} dialogTitle={`${user?.username} k??ytt??j??n asetukset`} actions={true}>
                <Grid sx={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 0', maxWidth: '500px' }}>
                    <FormControlLabel
                        sx={{ display: 'flex', textAlign: 'left' }}
                        control={
                            <Switch
                                value={empty}
                                checked={empty}
                                onChange={(e) => setEmpty(e.target.checked)}
                            />
                        }
                        label='Piilota tyhj??t tilaukset'
                    />
                    <FormControlLabel
                        sx={{ display: 'flex', textAlign: 'left' }}
                        control={
                            <Switch
                                value={rfid}
                                checked={rfid}
                                onChange={(e) => setRfid(e.target.checked)}
                            />
                        }
                        label='RFID Scannaus pois p????lt?? (vain t??lt?? k??ytt??j??lt??)'
                    />
                </Grid>
            </MenuDialog>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteUser(user._id)} dialogTitle={'Haluatko poistaa t??m??n k??ytt??j??n?'} actions={true}>
                {`Haluatko varmasti poistaa K??ytt??j??n ${user?.email} (${user?.username})? Mik??li poistat k??ytt??j??n sit?? ei voida en???? palauttaa.`}
            </MenuDialog>
            {
                messageOpen
                &&
                <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='K??ytt??j??n asetukset'>
                    {user.username} k??ytt??j??n asetukset on tallennettu.
                </Message>
            }
        </Tr>
    )
}

export default SettingsUserCell