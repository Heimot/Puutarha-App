import React, { useState } from 'react'
import { Order, Products } from './Model'
import { Tr, Td } from 'react-super-responsive-table'
import { Button, TextField } from '@mui/material';
import FetchData from '../Components/Fetch';

interface Props {
    product: Products;
    updateOrder: (nextState: string, pickedAmount: number | string) => void;
}

const MainTableData: React.FC<Props> = ({ product, updateOrder }) => {
    const [pickedAmount, setPickedAmount] = useState<number | string>(product.amountToDeliver);

    const nextState = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            _id: product._id,
            amountToDeliver: pickedAmount,
            cards: ["777000"]
        }
        await FetchData({ urlHost: url, urlPath: '/products/change_products_state', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        updateOrder(product.state.nextState, pickedAmount);
    }

    const isEmpty = () => {
        if (pickedAmount === '') {
            setPickedAmount(product.amountToDeliver);
        }
    }

    return (
        <Tr>
            <Td>{product.flower.name}</Td>
            <Td>{product.amount}</Td>
            <Td>{product.location.location}</Td>
            <Td>{product.information}</Td>
            <Td style={{ padding: '5px' }}>
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
            <Td>
                <TextField
                    sx={{ padding: '5px' }}
                    inputProps={{ style: { textAlign: 'center' } }}
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