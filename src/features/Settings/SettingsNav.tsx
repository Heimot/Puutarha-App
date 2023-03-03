import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TuneIcon from '@mui/icons-material/Tune';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LabelIcon from '@mui/icons-material/Label';
import ExploreIcon from '@mui/icons-material/Explore';
import SearchIcon from '@mui/icons-material/Search';
import RememberMeIcon from '@mui/icons-material/RememberMe';
import InventoryIcon from '@mui/icons-material/Inventory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsIcon from '@mui/icons-material/Settings';
import { State } from '../../app/redux/store';
import { useSelector } from 'react-redux';

const data = [
    { icon: <SettingsIcon />, label: 'Omat asetukset', id: 'personalsettings' },
    { icon: <LanguageIcon />, label: 'Kieli', id: 'language' }
];

const adminData = [
    { icon: <AccountCircleIcon />, label: 'Muokkaa käyttäjiä', id: 'users', hidden: '/auth/sign_up' },
    { icon: <RememberMeIcon />, label: 'Muokkaa rooleja', id: 'roles', hidden: '/roles/create_role' },
    { icon: <TuneIcon />, label: 'RFID', id: 'rfid', hidden: '/card/add_card' },
    { icon: <InventoryIcon />, label: 'Muokkaa tuotteen tiloja', id: 'state', hidden: '/state/create_state' },
    { icon: <PrecisionManufacturingIcon />, label: 'Muokkaa tilauksen tiloja', id: 'status', hidden: '/status/create_status' },
    { icon: <ExploreIcon />, label: 'Muokkaa keräyspaikkoja', id: 'location', hidden: '/location/create_location' },
    { icon: <SearchIcon />, label: 'Muokkaa kauppoja ja kukkia', id: 'autofill', hidden: '/names/create_name' },
    { icon: <LabelIcon />, label: 'Muokkaa tarroja', id: 'stickers', hidden: '/pdf/create_pdf' },
    { icon: <ListAltIcon />, label: 'Logit', id: 'logs', hidden: '/log/get_logs' },
];

const SettingsNavBar = styled(List)<{ component?: React.ElementType }>({
    '& .MuiListItemButton-root': {
        paddingLeft: 24,
        paddingRight: 24,
    },
    '& .MuiListItemIcon-root': {
        minWidth: 0,
        marginRight: 16,
    },
    '& .MuiSvgIcon-root': {
        fontSize: 20,
    },
});

interface Props {
    page: string;
    setPage: (value: string) => void;
}

const SettingsNav: React.FC<Props> = ({ page, setPage }) => {
    const [open, setOpen] = useState(true);
    const [adminOpen, setAdminOpen] = useState(true);

    const { userData } = useSelector((state: State) => state.data);

    return (
        <Paper elevation={0} sx={{ maxWidth: '100%', bgcolor: 'rgba(71, 98, 130, 0.2)' }}>
            <SettingsNavBar component="nav" disablePadding>
                <Box
                    sx={{
                        bgcolor: 'rgba(71, 98, 130, 0.2)',
                        pb: open ? 2 : 0,
                    }}
                >
                    <ListItemButton
                        alignItems="flex-start"
                        onClick={() => setOpen(!open)}
                        sx={{
                            px: 3,
                            pt: 2.5,
                            pb: open ? 0 : 2.5,
                            '&:hover, &:focus': { '& svg': { opacity: open ? 1 : 0 } },
                        }}
                    >
                        <ListItemText
                            primary="Asetukset"
                            primaryTypographyProps={{
                                fontSize: 15,
                                fontWeight: 'medium',
                                lineHeight: '20px',
                                mb: '2px',
                            }}
                            secondary="Kieli, Omat asetukset"
                            secondaryTypographyProps={{
                                noWrap: true,
                                fontSize: 12,
                                lineHeight: '16px',
                                color: open ? 'rgba(0,0,0,0)' : 'rgba(255,255,255)',
                            }}
                            sx={{ my: 0 }}
                        />
                        <KeyboardArrowDown
                            sx={{
                                mr: -1,
                                opacity: 0,
                                transform: open ? 'rotate(-180deg)' : 'rotate(0)',
                                transition: '0.2s',
                            }}
                        />
                    </ListItemButton>
                    {open &&
                        data.map((item) => (
                            <ListItemButton
                                key={item.label}
                                sx={{ py: 0, minHeight: 32 }}
                                onClick={() => setPage(item.id)}
                                selected={page === item.id}
                            >
                                <ListItemIcon sx={{ color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                                />
                            </ListItemButton>
                        ))}
                </Box>

                <Box
                    sx={{
                        bgcolor: 'rgba(71, 98, 130, 0.2)',
                        pb: adminOpen ? 2 : 0,
                    }}
                >
                    <ListItemButton
                        alignItems="flex-start"
                        onClick={() => setAdminOpen(!adminOpen)}
                        sx={{
                            px: 3,
                            pt: 2.5,
                            pb: adminOpen ? 0 : 2.5,
                            '&:hover, &:focus': { '& svg': { opacity: adminOpen ? 1 : 0 } },
                        }}
                    >
                        <ListItemText
                            primary="Admin asetukset"
                            primaryTypographyProps={{
                                fontSize: 15,
                                fontWeight: 'medium',
                                lineHeight: '20px',
                                mb: '2px',
                            }}
                            secondary="Muokkaa käyttäjiä, Muokkaa rooleja, RFID, Muokkaa tuotteen tiloja, Muokkaa tilauksen tiloja, Muokkaa keräyspaikkoja, Muokkaa kauppoja ja kukkia, Muokkaa tarroja, Logit"
                            secondaryTypographyProps={{
                                noWrap: true,
                                fontSize: 12,
                                lineHeight: '16px',
                                color: adminOpen ? 'rgba(0,0,0,0)' : 'rgb(255, 255, 255)',
                            }}
                            sx={{ my: 0 }}
                        />
                        <KeyboardArrowDown
                            sx={{
                                mr: -1,
                                opacity: 0,
                                transform: adminOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                transition: '0.2s',
                            }}
                        />
                    </ListItemButton>
                    {adminOpen &&
                        adminData.map((item) => (
                            <ListItemButton
                                key={item.label}
                                sx={{ py: 0, minHeight: 32, display: userData?.role?.rights.includes('*') || userData?.role?.rights.includes(item?.hidden) ? 'flex' : 'none' }}
                                onClick={() => setPage(item.id)}
                                selected={page === item.id}
                            >
                                <ListItemIcon sx={{ color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                                />
                            </ListItemButton>
                        ))}
                </Box>
            </SettingsNavBar>
        </Paper>
    )
}

export default SettingsNav