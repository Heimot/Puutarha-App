import React, { useEffect, useState } from 'react'
import { Flower, Products } from './Model'
import { Tr, Td } from 'react-super-responsive-table'
import { Button, TextField, Select, MenuItem, Box, Autocomplete, createFilterOptions, FilterOptionsState } from '@mui/material';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';
import Grid from '@mui/material/Unstable_Grid2';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
    product: Products;
    updateProducts: (value: any, name: string, productId: string) => void;
    deleteProduct: (productId: string) => void;
}

const EditingMenuData: React.FC<Props> = ({ product, updateProducts, deleteProduct }) => {
    const [amount, setAmount] = useState<number | string>(0);
    const [information, setInformation] = useState<string>('');
    const { locationSettings, flowerSettings } = useSelector((state: State) => state.data);
    const defaultFilterOptions = createFilterOptions<Flower>();
    const filterOptions = (options: Flower[], state: FilterOptionsState<Flower>) => {
        return defaultFilterOptions(options, state).slice(0, 15);
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

    return (
        <Tr>
            <Td>
                <Autocomplete
                    id="flower-auto"
                    value={product?.flower}
                    filterOptions={filterOptions}
                    onChange={valueChosen}
                    options={flowerSettings}
                    getOptionLabel={(option: Flower) => option.name}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    noOptionsText={<Button startIcon={<AddIcon />} style={{ width: '100%' }} onClick={() => console.log("AAAAAAAAAA")}>Create new?</Button>}
                    includeInputInList
                    disableClearable
                    renderInput={(params) => (
                        <TextField {...params} />
                    )}
                />
            </Td>
            <Td>
                <TextField name='amount' type="number" sx={{ width: "100%" }} value={amount} onBlur={isEmpty} onChange={(e) => setAmount(e.target.value)} />
            </Td>
            <Td>
                <Select name='location' sx={{ width: "100%" }} value={product.location._id} onChange={(e) => updateProducts(e.target.value, e.target.name, product._id)}>
                    {locationSettings.map((location: any) =>
                        <MenuItem key={location._id} value={location._id}>{location.location}</MenuItem>
                    )}
                </Select>
            </Td>
            <Td>
                <Box>
                    <Grid container xs={12}>
                        <Box style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                            <TextField name='information' fullWidth value={information} onChange={(e) => setInformation(e.target.value)} />
                            <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => deleteProduct(product._id)}>
                                <DeleteIcon fontSize='large' />
                            </Button>
                        </Box>
                    </Grid>
                </Box>
            </Td>
        </Tr>
    )
}

export default EditingMenuData