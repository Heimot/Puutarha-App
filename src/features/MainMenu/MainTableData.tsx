import React, { useEffect, useState } from 'react'
import { Products, Status } from '../../Model'
import { Tr, Td } from 'react-super-responsive-table'
import { Button, TextField } from '@mui/material';
import FetchData from '../Components/Fetch';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';

interface Props {
    product: Products;
    defaultStatus: Status | null;
    rfidCards: string[];
    updateOrder: (nextState: string, pickedAmount: number | string) => void;
    updateStatus: (nextStatus: string) => void;
}

const MainTableData: React.FC<Props> = ({ product, defaultStatus, rfidCards, updateOrder, updateStatus }) => {
    const [pickedAmount, setPickedAmount] = useState<number | string>('');
    const { chosenStatus } = useSelector((state: State) => state.data);

    const theme = useTheme();

    useEffect(() => {
        setPickedAmount(product.amountToDeliver);
    }, [product])


    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    const nextState = async () => {
        // Add rfid cards here when you're adding them
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            _id: product._id,
            amountToDeliver: pickedAmount,
            cards: rfidCards
        }
        await FetchData({ urlHost: url, urlPath: '/products/change_products_state', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        updateOrder(product.state.nextState, pickedAmount);
    }

    const nextStatus = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            _id: product._id,

        }
        await FetchData({ urlHost: url, urlPath: '/products/change_products_status', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        updateStatus(product.status.nextStatus);
    }

    const isEmpty = () => {
        if (pickedAmount === '') {
            setPickedAmount(product.amountToDeliver);
        }
    }

    return (
        <Tr
            onDoubleClick={() => { if (chosenStatus !== defaultStatus) { nextStatus(); } }}
            style={!product.status.default && chosenStatus !== defaultStatus ? { backgroundColor: product.status.color, color: product.status.fontcolor } : null}
        >
            <Td style={borderStyle}>{product.flower.name}</Td>
            <Td style={borderStyle}>{product.amount}</Td>
            <Td style={borderStyle}>{product.location.location}</Td>
            <Td style={borderStyle}>{product.information}</Td>
            <Td style={{ padding: '5px', ...borderStyle }}>
                <Button
                    variant="contained"
                    size='small'
                    sx={{ fontSize: 15, whiteSpace: 'wrap', textTransform: 'none' }}
                    style={{ maxWidth: '150px', minWidth: '150px', backgroundColor: product.state.color, color: product.state.fontcolor }}
                    onClick={() => nextState()}
                >
                    {product.state.state}
                </Button>
            </Td>
            <Td style={borderStyle}>
                <TextField
                    sx={{ padding: '5px' }}
                    inputProps={!product.status.default && chosenStatus !== defaultStatus ? { style: { textAlign: 'center', color: product.status.fontcolor, borderRadius: '4px' } } : { style: { textAlign: 'center' } }}
                    type="number"
                    value={pickedAmount}
                    onBlur={isEmpty}
                    onChange={(e: any) => setPickedAmount(e.target.value)}
                />
            </Td>
        </Tr>
    )
}

export default MainTableData