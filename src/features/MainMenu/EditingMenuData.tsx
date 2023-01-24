import React from 'react'
import { Flower, Products } from './Model'
import { Tr, Td } from 'react-super-responsive-table'
import { Button, TextField, Select, MenuItem, Box, Autocomplete } from '@mui/material';
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
    const { locationSettings, flowerSettings } = useSelector((state: State) => state.data);

    const valueChosen = (e: any, value: any) => {
        updateProducts(value, 'flower', product._id);
    }

    return (
        <Tr>
            <Td>
                <Autocomplete
                    value={product?.flower}
                    onChange={valueChosen}
                    id="flower-auto"
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
                <TextField name='amount' type="number" sx={{ width: "100%" }} value={product.amount} onChange={(e) => updateProducts(e.target.value, e.target.name, product._id)} />
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
                            <TextField name='information' fullWidth value={product.information} onChange={(e) => updateProducts(e.target.value, e.target.name, product._id)} />
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