import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'

import FetchData from './Fetch';
import { Card, Products, State } from '../../Model';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import Typography from '@mui/material/Typography';

interface Props {
    setIsOpen: (value: boolean) => void;
    isOpen: boolean;
    product: Products;
}

interface Log {
    _id: string;
    method: string;
    route: string;
    user: string;
    cards: Card[];
    productId: string;
    state: State;
    createdAt: Date;
    updatedAt: Date;
}

const ProductLogs: React.FC<Props> = ({ setIsOpen, isOpen, product }) => {
    const [logs, setLogs] = useState<Log[]>([]);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        const getLogs = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;


            const data = await FetchData({ urlHost: url, urlPath: '/editlog/get_logs_for_product', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentProductId=${product._id}` });
            if (!data?.result) return;
            setLogs(data?.result);
        }
        getLogs();

        return () => {
            setLogs([]);
        }
    }, [])

    const handleClose = () => {
        setIsOpen(!isOpen);
    }

    const handleClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <Dialog
            onClose={handleClose}
            open={isOpen}
        >
            <DialogTitle>
                Tuotteen logit
            </DialogTitle>
            <DialogContent dividers>
                <Table style={{
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
                }}>
                    <Thead>
                        <Tr>
                            <Th>Nimi</Th>
                            <Th>Tila</Th>
                            <Th>Milloin</Th>
                        </Tr>

                    </Thead>
                    <Tbody>
                        {logs?.map((log) => (
                            <Tr key={log._id}>
                                <Td
                                    style={borderStyle}
                                >
                                    {log?.cards?.map((card) => (
                                        <Box key={card._id}>
                                            <Typography>
                                                {card?.cardOwner}
                                            </Typography>
                                        </ Box>
                                    ))}
                                </Td>
                                <Td
                                    style={borderStyle}
                                >
                                    <Typography>
                                        {log?.state?.state}
                                    </Typography>
                                </Td>
                                <Td
                                    style={{ ...borderStyle }}
                                >
                                    <Box>
                                        <Typography>
                                            {dayjs(log?.createdAt).format('DD-MM-YYYY')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography>
                                            {dayjs(log?.createdAt).format('HH:mm:ss')}
                                        </Typography>
                                    </Box>
                                </Td>
                            </Tr>
                        ))
                        }
                    </Tbody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClick}>Sulje</Button>
            </DialogActions>
        </Dialog >
    )
}

export default ProductLogs;