import React, { useEffect, useState, useRef } from 'react'
import { Flower, Products } from '../../Model'
import { Tr, Td } from 'react-super-responsive-table'
import { Button, TextField, Select, MenuItem, Box, Autocomplete, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';

import { useTheme } from '@mui/material/styles';
import AddAutofill from './AddAutofill';
import ProductLogs from './ProductLogs';

interface Props {
    product: Products;
    updateProducts: (value: any, name: string, productId: string) => void;
    deleteProduct: (productId: string) => void;
    isCreated: boolean;
}

const EditingMenuData: React.FC<Props> = ({ product, updateProducts, deleteProduct, isCreated }) => {
    const [amount, setAmount] = useState<number | string>(0);
    const [information, setInformation] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
    const [options, setOptions] = useState<Flower[]>([]);
    const prevController = useRef<any>();

    const { locationSettings } = useSelector((state: State) => state.data);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        setAmount(product.amount);
        setInformation(product.information);
    }, [])

    // We do this with useEffects since this seems to be alot more performant than just placing them in onChange functions!
    useEffect(() => {
        updateProducts(amount, 'amount', product._id);
    }, [amount])

    useEffect(() => {
        updateProducts(information, 'information', product._id);
    }, [information])

    const valueChosen = (e: any, value: any) => {
        updateProducts(value, 'flower', product._id);
    }

    const isEmpty = () => {
        if (amount === '') {
            setAmount(0);
        }
    }

    const getData = (search: string) => {
        if (prevController.current) {
            prevController.current.abort();
        }
        let userId = localStorage.getItem('userId');
        const controller = new AbortController();
        const signal = controller.signal;
        prevController.current = controller;
        fetch(`${process.env.REACT_APP_API_URL}/names/get_group_search?currentUserId=${userId}&group=Flowers&name=${search}`, {
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
        <Tr>
            <Td style={{ ...borderStyle, minWidth: '200px' }}>
                <Autocomplete
                    id="flower-auto"
                    open={optionsOpen}
                    onClose={() => setOptionsOpen(false)}
                    loading={loading}
                    loadingText='Etsitään...'
                    value={product?.flower}
                    onChange={valueChosen}
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
            </Td>
            <Td style={borderStyle}>
                <TextField name='amount' type="number" fullWidth value={amount} onBlur={isEmpty} onChange={(e) => setAmount(e.target.value)} />
            </Td>
            <Td style={borderStyle}>
                <Select name='location' fullWidth value={product.location._id} onChange={(e) => updateProducts(e.target.value, e.target.name, product._id)}>
                    {locationSettings.map((location: any) =>
                        <MenuItem key={location._id} value={location._id}>{location.location}</MenuItem>
                    )}
                </Select>
            </Td>
            <Td style={borderStyle}>
                <Box style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                    <TextField name='information' fullWidth value={information} onChange={(e) => setInformation(e.target.value)} />
                    {
                        isCreated
                        &&
                        <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <ListAltIcon fontSize='large' />
                        </Button>
                    }
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => deleteProduct(product._id)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <AddAutofill isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} usedGroup='Flowers' updateText={(value) => updateProducts(value, 'flower', product._id)} />
            {
                isMenuOpen
                &&
                <ProductLogs setIsOpen={(value) => setIsMenuOpen(value)} isOpen={isMenuOpen} product={product} />
            }
        </Tr>
    )
}

export default EditingMenuData