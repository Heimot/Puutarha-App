import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, createFilterOptions, FilterOptionsState } from '@mui/material';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';
import { useTheme } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

import { Order, Products, PropData, Acc } from './Model';
import FetchData from '../Components/Fetch';
import EditTable from '../Components/EditTable';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    editData: Order | any;
    setEditData: (value: Order) => void;
    dataSaved: (id: string, isEditor: boolean, method: 'DELETE' | 'POST' | 'PATCH', date: Date) => void;
}

const EditingMenu: React.FC<Props> = ({ isOpen, setIsOpen, editData, setEditData, dataSaved }) => {
    const { locationSettings, stateSettings, statusSettings } = useSelector((state: State) => state.data);

    const handleClick = () => {
        if (!editData) return;
        let defaultCheck = editData.products.filter((product: any) => {
            return product.flower._id === ''
        })
        if (editData.store._id === '') return alert('You cannot have empty store names. Please change it before you save!');
        if (defaultCheck.length > 0) return alert('You cannot have empty flower names. Please change them or delete them before you save!');

        setIsOpen(!isOpen);
        sendUpdate();
    }

    const handleClose = (event: any, reason: string) => {
        if (reason && reason === "backdropClick")
            return;
        setIsOpen(!isOpen);
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
                            if (curr !== 'createdAt' && curr !== 'updatedAt' && curr !== '_id' && curr !== 'state' && curr !== 'status' && curr !== 'amountToDeliver') {
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
        dataSaved(editData._id, true, 'PATCH', editData.pickingdate);
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

    return (
        <Dialog
            onClose={handleClose}
            fullWidth={true}
            maxWidth={"md"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Muokkaa tilausta
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
                <EditTable setOrderData={(value, name) => setEditData({ ...editData, [name]: value })} orderData={editData} updateData={(value) => setEditData(value)} />
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