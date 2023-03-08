import React, { useState, useEffect, useRef } from 'react';
import { Box, Autocomplete, Button, TextField, CircularProgress } from '@mui/material';
import { Flower } from '../../../Model';

import AddIcon from '@mui/icons-material/Add';
import AddAutofill from '../../Components/AddAutofill';

interface Props {
    item: string;
    type: 'Flowers' | 'Stores'
    onValueChange: (e: any) => void;
}

const ExcelAuto: React.FC<Props> = ({ item, type, onValueChange }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
    const [options, setOptions] = useState<Flower[]>([]);

    const prevController = useRef<any>();

    const getData = (search: string) => {
        if (prevController.current) {
            prevController.current.abort();
        }
        let userId = localStorage.getItem('userId');
        const controller = new AbortController();
        const signal = controller.signal;
        prevController.current = controller;
        fetch(`${process.env.REACT_APP_API_URL}/names/get_group_search?currentUserId=${userId}&group=${type}&name=${search}`, {
            signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then((response) => response.json())
            .then((res) => {
                setOptions(res.result);
                setLoading(false);
            })
    }

    const onInputChange = (e: any, value: string, reason: any) => {
        if (value && value.length >= 3) {
            if (reason === 'input') {
                setOptionsOpen(true);
            }
            setLoading(true);
            getData(value);
        } else {
            setOptionsOpen(false);
            setOptions([]);
        }
    }

    useEffect(() => {
        if (!optionsOpen) {
            setOptions([]);
        }
    }, [optionsOpen])

    return (
        <Box>
            <Autocomplete
                sx={{ width: '250px' }}
                id="flower-auto"
                open={optionsOpen}
                onClose={() => setOptionsOpen(false)}
                loading={loading}
                loadingText='Etsitään...'
                onChange={(e, value) => onValueChange(value._id)}
                onInputChange={(e, value, reason) => onInputChange(e, value, reason)}
                options={options}
                getOptionLabel={(option: Flower) => option.name}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                noOptionsText={<Button startIcon={<AddIcon />} style={{ width: '100%' }} onClick={() => setIsOpen(true)}>Luo uusi?</Button>}
                includeInputInList
                disableClearable
                renderInput={(params) => {
                    const inputPropsValue = params?.inputProps?.value as string;
                    return (
                        <TextField
                            label={item}
                            {...params}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading && params?.inputProps?.value && inputPropsValue.length >= 3 ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                )
                            }}
                        />
                    )
                }}
            />
            <AddAutofill isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} usedGroup={type} />
        </Box>
    )
}

export default ExcelAuto;