import React, { useState } from 'react';
import { styled, alpha, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

import { useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';

import NavigationDrawer from './NavigationDrawer';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',

        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

const NavigationBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const theme = useTheme();
    const dispatch = useDispatch();
    const { setSearchWord } = bindActionCreators(actionCreators, dispatch);

    const handleChange = (e: any) => {
        setSearch(e.target.value);
    }

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            setSearchWord(search);
        }
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <div>
                <AppBar position="fixed" color="primary">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            sx={{ mr: 2 }}
                            onClick={() => setIsOpen(prevState => !prevState)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                        >
                            Heimosen Puutarha
                        </Typography>
                        {
                            window.location.pathname === '/dashboard'
                                ?
                                <Search>
                                    <SearchIconWrapper>
                                        <SearchIcon />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        fullWidth
                                        placeholder="Search…"
                                        value={search}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        endAdornment={
                                            <InputAdornment
                                                sx={{ display: search !== '' ? 'flex' : 'none', paddingRight: '10px', }}
                                                position='end'
                                                onClick={() => { setSearch(''); setSearchWord(''); }}
                                            >
                                                <ClearIcon sx={{
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.common.white, 0.25),
                                                    }
                                                }} />
                                            </InputAdornment>}
                                        inputProps={{ 'aria-label': 'search' }}
                                    />
                                </Search>
                                :
                                null
                        }
                    </Toolbar>
                </AppBar>
                <NavigationDrawer drawerOpen={isOpen} drawerClose={() => setIsOpen(prevState => !prevState)} />
            </div>
        </Box>
    );
}

export default NavigationBar