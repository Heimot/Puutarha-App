import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, TextField, Box, Autocomplete } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { Flower, Location, Order, Products, Store } from './Model';
import EditingMenuData from './EditingMenuData';
import FetchData from '../Components/Fetch';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    editData: Order | null;
    setEditData: (value: Order) => void;
    dataSaved: () => void;
}

interface Acc {
    propName: string;
    value: any;
}

interface PropData {
    _id: string;
    data: Acc[];
}

const EditingMenu: React.FC<Props> = ({ isOpen, setIsOpen, editData, setEditData, dataSaved }) => {
    const { locationSettings, stateSettings, statusSettings, flowerSettings, storeSettings } = useSelector((state: State) => state.data);

    const storeProps = {
        options: storeSettings,
        getOptionLabel: (option: Store) => option.name,
    };

    const handleClick = () => {
        if (!editData) return;
        let defaultCheck = editData.products.filter((product) => {
            console.log(product)
            return product.flower._id === ''
        })

        if (defaultCheck.length > 0) return alert('You cannot have empty flower names. Please change them before you save!');

        setIsOpen(!isOpen);
        sendUpdate();
    }

    const handleClose = (event: any, reason: string) => {
        if (reason && reason == "backdropClick")
            return;
        setIsOpen(!isOpen);
    }

    const updateProducts = (value: any, name: string, productId: string) => {
        let data = value;
        switch (name) {
            case 'amount':
                data = Number(value);
                break;
            case 'location':
                data = locationSettings.filter((location: Location) => {
                    return location._id === value;
                })[0]
                break;
            default:
                data = value;
                break;
        }

        if (editData) {
            let newData = {
                ...editData, products: editData.products.map((product) => {
                    return product._id === productId
                        ?
                        { ...product, [name]: data }
                        :
                        product
                })
            }
            setEditData(newData);
        }
    }

    const handleOrderChange = (e: any) => {
        if (editData) {
            let newData = {
                ...editData, [e.target.name]: e.target.value
            }
            setEditData(newData);
        }
    }

    const sendUpdate = async () => {
        // This object.keys turns the data into a type which can be used to patch in the server.
        // To see how it works the best way is to first console.log editData and the log the updateBody.
        // It just creates a object with {propName: "name", value: "New name"} arrays.
        if (!editData) return;
        let updateBody = await Object.keys(editData).reduce((acc: Acc[], curr) => {
            if (curr !== 'createdAt' && curr !== 'updatedAt' && curr !== '__v') {
                const keyValue: keyof Order = curr;
                if (curr === 'products') {
                    let productData: PropData[] = [];
                    editData[keyValue].map(async (product: Products) => {
                        let data = await Object.keys(product).reduce((accT: Acc[], curr) => {
                            if (curr !== 'createdAt' && curr !== 'updatedAt' && curr !== '_id') {
                                const keyValue: keyof Products = curr;
                                if (curr === 'flower' || curr === 'state' || curr === 'location' || curr === 'status') {
                                    accT.push({ 'propName': keyValue, 'value': product[keyValue]._id });
                                } else {
                                    accT.push({ 'propName': keyValue, 'value': product[keyValue] });
                                }
                            }
                            return accT;
                        }, [])
                        productData.push({ "_id": product._id, "data": data });
                    })
                    acc.push({ 'propName': 'products', 'value': productData });
                } else if (curr === 'status' || curr === 'store') {
                    acc.push({ 'propName': keyValue, 'value': editData[keyValue]._id });
                } else {
                    acc.push({ 'propName': keyValue, 'value': editData[keyValue] });
                }
            }
            return acc;
        }, [])

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        await FetchData({ urlHost: url, urlPath: '/orders/edit_order', urlQuery: `?currentUserId=${userId}&currentOrderId=${editData._id}`, urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: updateBody });
        dataSaved();
    }

    const addProduct = () => {
        let defaultState = stateSettings.filter((state: any) => {
            return state.default === true;
        })[0];
        let defaultStatus = statusSettings.filter((status: any) => {
            return status.default === true;
        })[0];
        let defaultLocation = locationSettings.filter((location: any) => {
            return location.default === true;
        })[0];
        let newProduct = {
            _id: Date.now().toString(), flower: { _id: '', name: 'default', group: '' }, location: defaultLocation, amount: 0, amountToDeliver: 0, information: '', state: defaultState, status: defaultStatus
        };
        if (!editData?.products) return;
        let newData = { ...editData, products: [...editData?.products, newProduct] }
        if (!newData) return;
        setEditData(newData);
    }

    const deleteProduct = async (productId: string) => {
        if (!editData) return;
        let newData = {
            ...editData, products: editData.products.filter((product) => {
                return product._id !== productId
            })
        }
        setEditData(newData);

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            _id: productId,
            orderId: editData._id
        }
        await FetchData({ urlHost: url, urlPath: '/products/delete_product', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
    }

    return (
        <Dialog
            onClose={handleClose}
            fullWidth={true}
            maxWidth={"md"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Order
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
            <DialogContent dividers>
                <Grid container xs={12}>
                    <Grid container direction="column" xs={12} sm={6}>
                        <Box>
                            date pickers keräyspvm toimituspvm + name
                        </Box>
                        <Box sx={{ margin: '10px 0 10px 0' }}>
                            {
                                storeSettings !== null
                                    ?
                                    <Autocomplete

                                        id="store-auto"
                                        options={storeSettings}
                                        defaultValue={editData?.store}
                                        getOptionLabel={(option: Store) => option.name}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                        sx={{ width: 300 }}
                                        includeInputInList
                                        renderInput={(params) => (
                                            <TextField {...params} label="Kauppa" />
                                        )}
                                    />
                                    :
                                    null
                            }
                        </Box>
                    </Grid>
                    <Grid container direction="column" xs={12} sm={6} sx={{ padding: 0 }}>
                        <Grid style={{ display: "flex", justifyContent: "flex-end" }} xs={12} >
                            <TextField name='information' label="Lisätietoa" value={editData?.information} multiline onChange={handleOrderChange}></TextField>
                        </Grid>
                        <Grid style={{ display: "flex", justifyContent: "flex-end", margin: '10px 0 10px 0' }} xs={12}>
                            <TextField name='ordercode' label="Order code" value={editData?.ordercode} multiline onChange={handleOrderChange}></TextField>
                        </Grid>
                    </Grid>
                </Grid>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Tuote</Th>
                            <Th>Kerätään</Th>
                            <Th>Keräyspiste</Th>
                            <Th>Lisätietoa</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            editData?.products.map((product) =>
                                <EditingMenuData key={product._id} product={product} updateProducts={(value, name, productId) => updateProducts(value, name, productId)} deleteProduct={(productId) => deleteProduct(productId)} />
                            )
                        }
                    </Tbody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button startIcon={<AddIcon />} onClick={() => addProduct()}>Add product</Button>
                <Button variant='contained' autoFocus startIcon={<SaveIcon />} onClick={handleClick}>
                    Save changes
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default EditingMenu