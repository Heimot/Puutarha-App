import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../app/redux/store';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FetchData from './Fetch';
import { Flower, Store } from '../../Model';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    usedGroup: 'Flowers' | 'Stores';
    updateText: (value: Flower | Store) => void;
}

const GridStyles = {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 30px 10px 30px',
}

const AddAutofill: React.FC<Props> = ({ isOpen, setIsOpen, usedGroup, updateText }) => {
    const [name, setName] = useState<string>('');
    const [group, setGroup] = useState<'Flowers' | 'Stores'>(usedGroup);
    const { flowerSettings, storeSettings } = useSelector((state: State) => state.data);

    const dispatch = useDispatch();
    const { setFlowers, setStores } = bindActionCreators(actionCreators, dispatch);

    const AddAutofill = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            name: name,
            group: group
        }

        const data = await FetchData({ urlHost: url, urlPath: '/names/create_name', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        if (!data?.result) return;
        if (group === 'Flowers') {
            setFlowers([...flowerSettings, data.result]);
            updateText(data.result);
        } else {
            setStores([...storeSettings, data.result]);
            updateText(data.result);
        }
        setName('');
        setIsOpen(!isOpen);
    }

    return (
        <Dialog
            onClose={() => setIsOpen(false)}
            fullWidth={true}
            maxWidth={"xs"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Lisää
                <IconButton
                    aria-label="close"
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid xs={12} sx={GridStyles}>
                        <TextField label="Nimi" sx={{ width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} />
                    </Grid>
                    <Grid xs={12} sx={GridStyles}>
                        <FormControl fullWidth>
                            <InputLabel id='group-label'>Ryhmä</InputLabel>
                            <Select labelId='group-label' label='Ryhmä' sx={{ width: '100%' }} value={group} onChange={(e) => setGroup(e.target.value as 'Flowers' | 'Stores')}>
                                <MenuItem value="Flowers">Kukat</MenuItem>
                                <MenuItem value="Stores">Kaupat</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' autoFocus startIcon={<SaveIcon />} onClick={() => AddAutofill()} >
                    Tallenna
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default AddAutofill