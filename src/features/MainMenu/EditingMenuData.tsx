import React from 'react'
import { Products } from './Model'
import { Tr, Td } from 'react-super-responsive-table'
import { Button, TextField, Select, MenuItem, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';
import Grid from '@mui/material/Unstable_Grid2';

import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
    product: Products;
}


const EditingMenuData: React.FC<Props> = ({ product }) => {
    const { locationSettings } = useSelector((state: State) => state.data);

    return (
        <Tr>
            <Td>
                <TextField sx={{ width: "100%" }} value={product.flower.name} />
            </Td>
            <Td>
                <TextField type="number" sx={{ width: "100%" }} value={product.amount} />
            </Td>
            <Td>
                <Select sx={{ width: "100%" }} value={product.location._id}>
                    {locationSettings.map((location: any) =>
                        <MenuItem key={location._id} value={location._id}>{location.location}</MenuItem>
                    )}
                </Select>
            </Td>
            <Td>
                <Box>
                    <Grid xs={12} container>
                        <Grid xs={10.5}>
                            <TextField fullWidth value={product.information} />
                        </Grid>
                        <Grid xs={1.5}>
                            <Button style={{ width: "10%", maxHeight: "200px", minHeight: "56px", minWidth: "56px", padding: 0 }}>
                                <DeleteIcon fontSize='large' />
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Td>
        </Tr>
    )
}

export default EditingMenuData