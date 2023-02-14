import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from "@mui/material/styles";
import FetchData from '../Components/Fetch';
import dayjs from 'dayjs';
import { Order, Products, Status, Stickers } from '../../Model';

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../app/redux/store';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';

import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import MainTableData from './MainTableData';
import { Button, Typography, Fab, Select, MenuItem, Chip } from '@mui/material';
import EditingMenu from './EditingMenu';
import MenuDialog from '../Components/MenuDialog';
import { useSocket } from '../../app/contexts/SocketProvider';

import PrintIcon from '@mui/icons-material/Print';

import './Main.css';
import Printer from '../Printing/Printer';

interface OrderUpdate {
    orderId: string;
    pickingDate: Date;
    method: 'DELETE' | 'POST' | 'PATCH';
}

interface ProductUpdate {
    orderId: string;
    productId: string;
    nextState: string;
    pickedAmount: string | number;
    date: Date;
    statusOrState: 'status' | 'state';
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const Main = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [statusOpen, setStatusOpen] = useState<boolean>(false);
    const [deleteOrderData, setDeleteOrderData] = useState<Order>();
    const [editData, setEditData] = useState<Order | null>(null);
    const [stickers, setStickers] = useState<Stickers[]>([]);
    const [printerOpen, setPrinterOpen] = useState<boolean>(false);
    const [statusOrder, setStatusOrder] = useState<Status[] | null>(null);
    const [statusMove, setStatusMove] = useState<string>('');
    const [statusMoveOrder, setStatusMoveOrder] = useState<string>('');
    const [defaultStatus, setDefaultStatus] = useState<Status | null>(null);
    const { chosenStatus, chosenLocation, chosenDate, stateSettings, updatePacket, searchWord, statusSettings, personalSettings } = useSelector((state: State) => state.data);


    const dispatch = useDispatch();
    const { setUpdatePacket, setSearchWord } = bindActionCreators(actionCreators, dispatch);
    const theme = useTheme();
    const socket = useSocket()

    /**
     * This useEffect opens a socket.io connection when socket has been updated.
     */
    useEffect(() => {
        const orderUpdate = (value: OrderUpdate) => {
            updateOrder(value.orderId, false, value.method, value.pickingDate);
        }

        const productUpdate = (value: ProductUpdate) => {
            updatedData(value.nextState, value.pickedAmount, value.orderId, value.productId, value.date, value.statusOrState);
        }

        if (!socket) return;
        socket.on('send-order-update', orderUpdate);
        socket.on('send-product-update', productUpdate);
        return () => {
            socket.off('send-order-update', orderUpdate);
            socket.off('send-product-update', productUpdate);
        };
    }, [socket, orders])

    /**
     *  This will emit the updated order id, method and date.
     *  Only when updatePacket is updated.
     */
    useEffect(() => {
        if (updatePacket.date === null && updatePacket._id === null) return;
        updateSocket(updatePacket._id, false, 'POST', updatePacket.date);
        setUpdatePacket('');
    }, [updatePacket])

    /**
     *  If status/location/date has changed from the navigation menu please refresh the data we have right now.
     *  Also refreshes the data if you have searched for something.
     */
    useEffect(() => {
        if (chosenStatus === '' || chosenLocation === '' || chosenDate === null) return;
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        const getOrderData = async () => {
            if (!chosenDate) return;
            let locations = localStorage.getItem('location');
            if (locations === null) {
                locations = chosenLocation;
            }
            let status = localStorage.getItem('status');
            if (status === null) {
                status = chosenStatus;
            }
            let searchType = '';
            if (searchWord.type === 'store') {
                searchType = `&storeSearch=${searchWord.search}`;
            } else if (searchWord.type === 'flower') {
                searchType = `&flowerSearch=${searchWord.search}`;
            } else {
                searchType = '';
            }
            let date = dayjs(chosenDate).format('YYYY-MM-DD');
            let orderData = await FetchData({ urlHost: url, urlPath: '/orders/get_orders_with_date', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&date=${date}&locationSearch=${locations}${searchType}&statusSearch=${status}` });
            setOrders(orderData.result);
        }
        getOrderData();
        return () => { setOrders([]); userId = null; url = ''; }
    }, [chosenStatus, chosenLocation, chosenDate, searchWord])

    /**
     * Getting default status and status order for status moving.
     */
    useEffect(() => {
        let statusSettingsOrder = [];
        let defaultStatus;
        if (!statusSettings) return;
        for (let i = 0; i < statusSettings.length; i++) {
            if (statusSettings[i].default) {
                defaultStatus = statusSettings[i];
                setStatusMove(statusSettings[i]._id);
                setDefaultStatus(statusSettings[i]._id);
            }
            statusSettingsOrder.push({});
        }

        let nextId = defaultStatus?.nextStatus;
        for (let i = 0; i < statusSettings.length; i++) {

            if (defaultStatus?.default) {
                statusSettingsOrder[0] = defaultStatus;
                defaultStatus = null;
            } else {
                defaultStatus = statusSettings.filter((status: Status) => {
                    return status._id === nextId;
                })[0];
                statusSettingsOrder[i] = defaultStatus;
                nextId = defaultStatus.nextStatus;
            }
        }
        setStatusOrder(statusSettingsOrder);
        return () => {
            setStatusOrder(null);
        }
    }, [statusSettings])

    /**
     * This function will emit the new updated products state
     * @param nextState NextState is the state which is next on the line in picking.
     * @param pickedAmount PickedAmount is the amount which pickedamount input.
     * @param order Order is used to get the order id of the order which the product belongs to.
     * @param product And product is used for getting product id of the product which state has been updated.
     * @param statusOrState This tells if the socket.io is called by status or state change.
     * @returns The end return is updatedData which will update the orders and products itself.
     */
    const updatedSocketProduct = (nextState: string, pickedAmount: number | string, order: Order, product: Products, statusOrState: 'status' | 'state') => {
        if (!socket) return;
        // Get nextState for checking if stickerPoint is true.
        let next = stateSettings.filter((state: any) => {
            return state._id === nextState;
        })[0];
        socket.emit('update-product', {
            orderId: order._id,
            productId: product._id,
            nextState: nextState,
            pickedAmount: Number(pickedAmount),
            date: chosenDate,
            statusOrState: statusOrState
        })
        // If stickerPoint is true put the sticker in the printing list.
        if (statusOrState === 'state' && next.stickerPoint) {
            let newData = { store: order.store, pickingdate: order.pickingdate, deliverydate: order.deliverydate, ...product };
            let exists = stickers.filter((sticker) => {
                return product._id === sticker._id
            })
            if (exists.length <= 0) {
                setStickers(prevState => [...prevState, newData]);
            }
        }
        updatedData(nextState, pickedAmount, order._id, product._id, chosenDate, statusOrState);
    }

    /**
     * This will update the state of the product in order.
     * @param nextState NextState is the state which is next on the line in picking.
     * @param pickedAmount PickedAmount is the amount which pickedamount input.
     * @param orderId Order id of the order where the product exists.
     * @param productId Product id where the state has changed.
     * @param date And the pickingdate of the order. This is needed to check if other socket.io connections are on the same day.
     * @param statusOrState This tells if the socket.io is called by status or state change.
     * @returns Updated setOrders data with the new product states.
     */
    const updatedData = (nextState: string, pickedAmount: number | string, orderId: string, productId: string, date: Date, statusOrState: 'status' | 'state') => {
        if (dayjs(date).format('YYYY-MM-DD') !== dayjs(chosenDate).format('YYYY-MM-DD')) return;
        if (statusOrState === 'state') {
            let next = stateSettings.filter((state: any) => {
                return state._id === nextState;
            })
            let data = orders.map((order) => {
                return order._id === orderId
                    ?
                    {
                        ...order, products: order.products.map((product) => {
                            return product._id === productId
                                ?
                                { ...product, state: next[0], amountToDeliver: pickedAmount }
                                :
                                product
                        })
                    }
                    : order;
            })
            setOrders(data);
        } else if (statusOrState === 'status') {
            let next = statusSettings.filter((status: any) => {
                return status._id === nextState;
            })
            let data = orders.map((order) => {
                return order._id === orderId
                    ?
                    {
                        ...order, products: order.products.map((product) => {
                            return product._id === productId
                                ?
                                { ...product, status: next[0] }
                                :
                                product
                        })
                    }
                    : order;
            })
            setOrders(data);
        }
    }

    /**
     * This will delete a order and then send a socket.io message about which order should be removed.
     */
    const deleteOrder = async () => {
        let orderId = deleteOrderData?._id;
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let bodyData = {
            currentUserId: userId,
            _id: orderId
        };
        await FetchData({ urlHost: url, urlPath: '/orders/delete_order', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: bodyData });
        updateSocket(orderId, false, 'DELETE', chosenDate);
    }

    /**
     * This sends a socket message about a order deletion.
     * @param id Id of the order which should be removed.
     * @param isCreator This is false if you created a order or if someone else created or edited a order when using socket, when you edit it has a value of true.
     * @param method This tells the updateOrder what you have done. (DELETE, POST, PATCH)
     * @param date This tells the date you've edited the order in.
     * @returns Calls updateOrder function to update the current order.
     */
    const updateSocket = (id: string | undefined, isCreator: boolean, method: 'DELETE' | 'POST' | 'PATCH', date: Date) => {
        if (!socket) return;
        socket.emit('update-order', {
            orderId: id,
            pickingDate: date,
            method: method
        })
        updateOrder(id, isCreator, method, date);
    }

    /**
     * When someone or you edits/adds/removes orders this will make sure your orders are up to date.
     * 
     * @param {string} id This is the id of the edited order
     * @param {boolean} isCreator This is false if you created a order or if someone else created or edited a order when using socket, when you edit it has a value of true
     * @param {string} method This tells the updateOrder what you have done. (DELETE, POST, PATCH)
     * @param {Date} date This tells the date you've edited the order in.
     * @returns Returns new edited/added/removed order data
     */

    const updateOrder = async (id: string | undefined, isCreator: boolean, method: 'DELETE' | 'POST' | 'PATCH', date: Date) => {
        if (!id) return;
        if (dayjs(date).format('YYYY-MM-DD') !== dayjs(chosenDate).format('YYYY-MM-DD')) return;
        let userId = localStorage.getItem('userId');
        let locations = localStorage.getItem('location');
        if (locations === null) {
            locations = chosenLocation;
        }
        let status = localStorage.getItem('status');
        if (status === null) {
            status = chosenStatus;
        }
        let searchType = '';
        if (searchWord.type === 'store') {
            searchType = `&storeSearch=${searchWord.search}`;
        } else if (searchWord.type === 'flower') {
            searchType = `&flowerSearch=${searchWord.search}`;
        } else {
            searchType = '';
        }
        let url = process.env.REACT_APP_API_URL;
        let newData = await FetchData({ urlHost: url, urlPath: '/orders/get_order_with_id', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&_id=${id}&date=${chosenDate}&locationSearch=${locations}${searchType}&statusSearch=${status}` });
        let data;

        // Switch case for all methods.
        switch (method) {
            case 'DELETE':
                data = orders.filter((order) => {
                    return order._id !== id;
                })
                break;
            case 'POST':
                data = [...orders, newData.result[0]];
                break;
            case 'PATCH':
                data = orders.map((order) => {
                    return order._id === id
                        ? newData.result[0]
                        : order;
                })
                break;
            default:
                console.log('No method chosen');
                break;
        }
        if (!data) return;
        setOrders(data);
        if (isCreator) {
            setEditData(null);
        }
    }

    /**
     * Move order function is used to move a order and its flowers to different status mode.
     */
    const moveOrder = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            orderId: statusMoveOrder,
            status: statusMove,
            location: chosenLocation
        }
        await FetchData({ urlHost: url, urlPath: '/statuslocation/create_status_location', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        updateSocket(statusMoveOrder, true, 'PATCH', chosenDate);
        setStatusOpen(false);
        setStatusMoveOrder('');
    }

    return (
        <Box sx={{ flexGrow: 1, padding: 3, paddingTop: 9, height: '100%', minHeight: '100vh' }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
                {orders.map((order) => {
                    if (!personalSettings.showEmptyOrders && order.products.length <= 0) {
                        return (undefined)
                    }
                    return (
                        <Grid xs={12} sm={12} md={6} lg={4} xl={3} key={order._id}>
                            <Item>
                                <Grid container xs={12}>
                                    <Grid xs={12} sm={6}>
                                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Keräyspäivämäärä: {dayjs(order.pickingdate).format('DD-MM-YYYY')}</Typography>
                                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Toimituspäivämäärä: {dayjs(order.deliverydate).format('DD-MM-YYYY')}</Typography>
                                        <Typography sx={{ fontSize: 20, paddingTop: 1, paddingBottom: 1 }} align="left" variant='h1'>{order.store.name}</Typography>
                                        <Typography sx={{ fontSize: 15 }} align="left" variant='h1'>{order._id}</Typography>
                                    </Grid>
                                    <Grid xs={12} sm={6} sx={{ padding: 0 }}>
                                        <Grid xs={12} >
                                            <Typography align='right'>{order.information}</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Typography align='right'>{order.ordercode}</Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        {order.statusLocation.map((sLoc: any) => (
                                            <Grid key={sLoc._id} sx={{ paddingLeft: 0, paddingTop: 0 }} xs={12}>
                                                <Typography align='left'>{sLoc.location.location}: {sLoc.status.status}</Typography>

                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <Typography align='right'>Rullakko: {order?.roller?.roller}</Typography>
                                        <Typography align='right'>Maybe some buttons here</Typography>
                                    </Grid>
                                    <Grid xs={12}>
                                        Amount done meters here mby?
                                    </Grid>
                                </Grid>
                                <Table style={{
                                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                                    border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
                                }}>
                                    <Thead>
                                        <Tr>
                                            <Th style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>Tuote</Th>
                                            <Th style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>Kerätään</Th>
                                            <Th style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>Keräyspiste</Th>
                                            <Th style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>Lisätietoa</Th>
                                            <Th style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>Keräämässä</Th>
                                            <Th style={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>Kerättymäärä</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {
                                            order?.products.map((product) => (
                                                <MainTableData
                                                    key={product._id}
                                                    product={product}
                                                    defaultStatus={defaultStatus}
                                                    updateOrder={(nextState, pickedAmount) => updatedSocketProduct(nextState, pickedAmount, order, product, 'state')}
                                                    updateStatus={(nextStatus) => updatedSocketProduct(nextStatus, 0, order, product, 'status')}
                                                />
                                            ))
                                        }
                                    </Tbody>
                                </Table>
                                <Grid container xs={12}>
                                    <Button variant="contained" size='small' color='success' sx={{ fontSize: 15, textTransform: 'none' }} onClick={() => { if (order.products.length > 0) { setStatusMoveOrder(order._id); setStatusOpen(true); } }}>Valmis</Button>
                                    <Button onClick={() => { setEditData(order); setIsOpen(prevState => !prevState); }} variant="contained" size='small' sx={{ fontSize: 15, textTransform: 'none' }}>Muokkaa</Button>
                                    <Button onClick={() => { setMenuOpen(true); setDeleteOrderData(order); }} variant="contained" size='small' color='error' sx={{ fontSize: 15, textTransform: 'none' }}>Poista</Button>
                                    <Button variant="contained" size='small' color='info' sx={{ fontSize: 15, textTransform: 'none' }}>Vie Exceliin</Button>
                                    <Button variant="contained" size='small' color='warning' sx={{ fontSize: 15, textTransform: 'none' }}>Tulosta taulukko</Button>
                                </Grid>
                            </Item>
                        </Grid>
                    )
                })
                }
            </Grid >
            <Fab onClick={() => setPrinterOpen(prevState => !prevState)} sx={{ position: 'fixed', bottom: 16, right: 16 }} color="secondary" aria-label="print">
                <PrintIcon />
                <Typography sx={{ fontWeight: 'bold' }}>{stickers.length}</Typography>
            </Fab>
            {
                searchWord.type !== ''
                    ?
                    <Chip sx={{ position: 'fixed', bottom: 16, right: 75 }} label={`Etsitään: ${searchWord.search}`} variant="outlined" onDelete={() => setSearchWord({ type: '', search: '' })} />
                    :
                    null
            }
            {
                statusOpen
                    ?
                    <MenuDialog isOpen={statusOpen} setIsOpen={(value: boolean) => setStatusOpen(value)} result={() => moveOrder()} dialogTitle={'Tilauksen siirto'} actions={true}>
                        <>
                            <div>
                                {`Mihin haluat siirtää tämän tilauksen?`}
                            </div>
                            <div>
                                <Select defaultValue={chosenStatus} value={statusMove} onChange={(e: any) => setStatusMove(e.target.value)}>
                                    {
                                        statusOrder?.map((status: Status) => (
                                            <MenuItem key={status._id} value={status._id}>
                                                {status.status}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </div>
                        </>
                    </MenuDialog>
                    :
                    null
            }
            {
                menuOpen
                    ?
                    <MenuDialog isOpen={menuOpen} setIsOpen={(value: boolean) => setMenuOpen(value)} result={() => deleteOrder()} dialogTitle={'Haluatko poistaa tämän tilauksen?'} actions={true}>
                        {`Haluatko varmasti poistaa tilauksen ${deleteOrderData?.store.name} (${deleteOrderData?._id})? Mikäli poistat tilauksen sitä ei voida palauttaa.`}
                    </MenuDialog>
                    :
                    null
            }
            {
                printerOpen
                    ?
                    <Printer isOpen={printerOpen} setIsOpen={(value) => setPrinterOpen(value)} stickers={stickers} setStickers={(value) => setStickers(value)} />
                    :
                    null
            }
            {
                isOpen
                    ?
                    <EditingMenu isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} editData={editData} setEditData={(value) => setEditData(value)} dataSaved={(id: string, isCreator: boolean, method: 'DELETE' | 'POST' | 'PATCH', date: Date) => updateSocket(id, isCreator, method, date)} />
                    :
                    null
            }
        </Box >
    )
}

export default Main;