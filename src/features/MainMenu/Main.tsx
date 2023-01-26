import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from "@mui/material/styles";
import FetchData from '../Components/Fetch';
import dayjs from 'dayjs';
import { Order } from './Model';

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../app/redux/store';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as actionCreators from '../../app/redux/actions';

import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import './Main.css';
import MainTableData from './MainTableData';
import { Button, Typography } from '@mui/material';
import EditingMenu from './EditingMenu';
import MenuDialog from '../Components/MenuDialog';
import { SocketProvider } from '../../app/contexts/SocketProvider';
import { useSocket } from '../../app/contexts/SocketProvider';


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
    const [deleteOrderData, setDeleteOrderData] = useState<Order>();
    const [editData, setEditData] = useState<Order | null>(null);
    const { chosenStatus, chosenLocation, chosenDate, stateSettings, updatePacket } = useSelector((state: State) => state.data);


    const dispatch = useDispatch();
    const { setUpdatePacket } = bindActionCreators(actionCreators, dispatch);
    const theme = useTheme();
    const socket = useSocket()

    useEffect(() => {
        const appendMessage = (value: any) => {
            console.log(value)
        }
        if (!socket) return;
        socket.on('order-updates-sent', appendMessage)
        socket.on('order-updates', appendMessage)

        return () => {
            socket.off('order-updates-sent', appendMessage)
            socket.off('order-updates', appendMessage)
        };
    }, [])

    useEffect(() => {
        if (updatePacket === '') return;
        updateOrder(updatePacket, false);
        setUpdatePacket('');
    }, [updatePacket])

    useEffect(() => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        const getOrderData = async () => {
            if (!chosenDate) return;
            let date = dayjs(chosenDate).format('YYYY-MM-DD');
            let orderData = await FetchData({ urlHost: url, urlPath: '/orders/get_orders_with_date', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&date=${date}` });
            setOrders(orderData.result);
        }
        getOrderData();
        return () => { setOrders([]); userId = null; url = ''; }
    }, [chosenStatus, chosenLocation, chosenDate])

    const updatedData = (nextState: string, pickedAmount: number | string, orderId: string, productId: string) => {
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
    }

    const deleteOrder = async () => {
        let orderId = deleteOrderData?._id;
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let bodyData = {
            currentUserId: userId,
            _id: orderId
        };
        await FetchData({ urlHost: url, urlPath: '/orders/delete_order', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: bodyData });
        updateOrder(orderId, false);
    }

    /**
     * When someone or you edits/adds/removes orders this will make sure your orders are up to date.
     * 
     * @param {string} id This is the id of the edited order
     * @param {boolean} isCreator This is false if you created a order or if someone else created or edited a order when using socket, when you edit it has a value of true
     * @returns Returns new edited/added/removed order data
     */

    const updateOrder = async (id: string | undefined, isCreator: boolean) => {
        if (!id) return;
        let userId = localStorage.getItem('userId');
        if (!socket) return;
        socket.emit('get-order-updates', {
            sender: userId,
            orderId: id,
            msg: 'hello'
        })
        let url = process.env.REACT_APP_API_URL;
        let newData = await FetchData({ urlHost: url, urlPath: '/orders/get_order_with_id', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&_id=${id}&date=${chosenDate}` });
        let data;
        if (newData.result.length <= 0) {
            data = orders.filter((order) => {
                return order._id !== id;
            })
        } else if (!isCreator) {
            data = [...orders, newData.result[0]];
        } else {
            data = orders.map((order) => {
                return order._id === id
                    ? newData.result[0]
                    : order;
            })
        }
        if (!data) return;
        setOrders(data);
        if (isCreator) {
            setEditData(null);
        }
    }

    return (
        <SocketProvider>
            <Box sx={{ flexGrow: 1, padding: 3, paddingTop: 9, height: '100%', minHeight: '100vh' }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                    {orders.map((order) => (
                        <Grid xs={12} sm={12} md={6} lg={4} xl={3} key={order._id}>
                            <Item>
                                <Grid container xs={12}>
                                    <Grid xs={6}>
                                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Keräyspäivämäärä: {dayjs(order.pickingdate).format('DD-MM-YYYY')}</Typography>
                                        <Typography sx={{ fontSize: 20 }} align="left" variant='h1'>Toimituspäivämäärä: {dayjs(order.deliverydate).format('DD-MM-YYYY')}</Typography>
                                        <Typography sx={{ fontSize: 20, paddingTop: 1, paddingBottom: 1 }} align="left" variant='h1'>{order.store.name}</Typography>
                                        <Typography sx={{ fontSize: 15 }} align="left" variant='h1'>{order._id}</Typography>
                                    </Grid>
                                    <Grid xs={6} sx={{ padding: 0 }}>
                                        <Grid xs={12} >
                                            <Typography align='right'>{order.information}</Typography>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Typography align='right'>{order.ordercode}</Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid xs={6}>
                                        <Typography align='left'>Location order status here with .map</Typography>
                                    </Grid>
                                    <Grid xs={6}>
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
                                                    updateOrder={(nextState, pickedAmount) => updatedData(nextState, pickedAmount, order._id, product._id)}
                                                />
                                            ))
                                        }
                                    </Tbody>
                                </Table>
                                <Grid container xs={12}>
                                    <Button variant="contained" size='small' color='success' sx={{ fontSize: 15, textTransform: 'none' }}>Valmis</Button>
                                    <Button onClick={() => { setEditData(order); setIsOpen(prevState => !prevState); }} variant="contained" size='small' sx={{ fontSize: 15, textTransform: 'none' }}>Muokkaa</Button>
                                    <Button onClick={() => { setMenuOpen(true); setDeleteOrderData(order); }} variant="contained" size='small' color='error' sx={{ fontSize: 15, textTransform: 'none' }}>Poista</Button>
                                    <Button variant="contained" size='small' color='info' sx={{ fontSize: 15, textTransform: 'none' }}>Vie Exceliin</Button>
                                    <Button variant="contained" size='small' color='warning' sx={{ fontSize: 15, textTransform: 'none' }}>Tulosta taulukko</Button>
                                </Grid>
                            </Item>
                        </Grid>
                    ))}
                </Grid>
                <MenuDialog isOpen={menuOpen} setIsOpen={(value: boolean) => setMenuOpen(value)} result={() => deleteOrder()} dialogTitle={'Haluatko poistaa tämän tilauksen?'}>
                    {`Haluatko varmasti poistaa tilauksen ${deleteOrderData?.store.name} (${deleteOrderData?._id})? Mikäli poistat tilauksen sitä ei voida palauttaa.`}
                </MenuDialog>
                <EditingMenu isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} editData={editData} setEditData={(value) => setEditData(value)} dataSaved={(id: string, isCreator: boolean) => updateOrder(id, isCreator)} />
            </Box>
        </SocketProvider>
    )
}

export default Main;