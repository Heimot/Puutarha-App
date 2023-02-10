import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../app/redux/store';

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditTable from '../Components/EditTable';
import FetchData from '../Components/Fetch';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';

interface Props {
    setIsOpen: (value: boolean) => void;
    isOpen: boolean;
}

const AddDialog: React.FC<Props> = ({ setIsOpen, isOpen }) => {
    const [newOrder, setNewOrder] = useState<any>(null);

    const dispatch = useDispatch();
    const { setUpdatePacket } = bindActionCreators(actionCreators, dispatch);
    const { locationSettings, stateSettings, statusSettings } = useSelector((state: State) => state.data);

    useEffect(() => {
        setNewOrder({
            _id: Date.now().toString(),
            store: {
                _id: '',
                name: 'default',
                group: 'Stores'
            },
            information: '',
            pickingdate: new Date(),
            deliverydate: new Date(),
            ordercode: '',
            products: [],
            status: {
                _id: '',
                status: '',
                color: '',
                fontcolor: '',
                default: false,
                nextStatus: ''
            },
            roller: {
                _id: '',
                roller: '',
                lockColor: '',
                default: false
            }
        });
    }, [])

    const sendUpdate = async () => {
        // This object.keys turns the data into a type which can be used to patch in the server.
        // To see how it works the best way is to first console.log newOrder and the log the updateBody.
        // It just creates a object with {propName: "name", value: "New name"} arrays.
        if (!newOrder) return;
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;

        let updateBody = {
            currentUserId: userId,
            store: newOrder.store,
            information: newOrder.information,
            pickingdate: newOrder.pickingdate,
            deliverydate: newOrder.deliverydate,
            ordercode: newOrder.ordercode,
            products: newOrder.products,
            roller: newOrder.roller
        }

        const orderCreated = await FetchData({ urlHost: url, urlPath: '/orders/create_order_with_products', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: updateBody });
        setUpdatePacket({ _id: orderCreated.result._id, date: orderCreated.result.pickingdate });
        setNewOrder({
            _id: Date.now().toString(),
            store: {
                _id: '',
                name: 'default',
                group: 'Stores'
            },
            information: '',
            pickingdate: new Date(),
            deliverydate: new Date(),
            ordercode: '',
            products: [],
            status: {
                _id: '',
                status: '',
                color: '',
                fontcolor: '',
                default: false,
                nextStatus: ''
            },
            roller: {
                _id: '',
                roller: '',
                lockColor: '',
                default: false
            }
        });
    }

    const handleClose = (event: any, reason: string) => {
        if (reason && reason === "backdropClick")
            return;
        setIsOpen(!isOpen);
    }

    const handleClick = () => {
        if (!newOrder) return;
        let defaultCheck = newOrder.products.filter((product: any) => {
            return product.flower._id === ''
        })
        if (newOrder.store._id === '') return alert('You cannot have empty store names. Please change it before you save!');
        if (defaultCheck.length > 0) return alert('You cannot have empty flower names. Please change them or delete them before you save!');

        setIsOpen(!isOpen);
        sendUpdate();
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
        if (!newOrder?.products) return;
        let newData = { ...newOrder, products: [...newOrder?.products, newProduct] }
        if (!newData) return;
        setNewOrder(newData);
    }

    return (
        <Dialog
            onClose={handleClose}
            fullWidth={true}
            maxWidth={"md"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Uusi tilaus
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
                <EditTable setOrderData={(value, name) => setNewOrder({ ...newOrder, [name]: value })} orderData={newOrder} updateData={(value) => setNewOrder(value)} />
            </DialogContent>
            <DialogActions>
                <Button startIcon={<AddIcon />} onClick={() => addProduct()}>Lisää tuote</Button>
                <Button variant='contained' autoFocus startIcon={<SaveIcon />} onClick={handleClick}>
                    Tallenna muutokset
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default AddDialog