import React from 'react';
import { useTheme } from '@mui/material';
import { Tr, Td } from 'react-super-responsive-table';
import { Products } from '../../Model';

interface Props {
    product: Products;
}

const CalendarOrderData: React.FC<Props> = ({ product }) => {
    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        padding: '20px',
        textAlign: 'center'
    }

    return (
        <Tr>
            <Td style={borderStyle}>{product?.flower?.name}</Td>
            <Td style={borderStyle}>{product?.amount}</Td>
            <Td style={borderStyle}>{product?.location?.location}</Td>
            <Td style={borderStyle}>{product?.information}</Td>
            <Td style={{ ...borderStyle, backgroundColor: product?.state?.color, color: product?.state?.fontcolor }}>{product?.state?.state}</Td>
            <Td style={borderStyle}>{product?.amountToDeliver}</Td>
        </Tr>
    )
}

export default CalendarOrderData