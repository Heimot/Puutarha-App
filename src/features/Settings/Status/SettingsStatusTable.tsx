import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsStatusCell from './SettingsStatusCell';
import { Status } from '../../../Model';
import Message from '../../Components/Message';


interface Props {
    newCard: Status | undefined;
}

const SettingsStatusTable: React.FC<Props> = ({ newCard }) => {
    const [cells, setCells] = useState<Status[]>([]);
    const [select, setSelect] = useState<Status[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (cells.length > 0) return;
        const getCards = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchCards = await FetchData({ urlHost: url, urlPath: '/status/get_status', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setCells(fetchCards.result);
            setSelect(fetchCards.result);
        }
        getCards();
        return () => {
            setCells([]);
            setSelect([]);
        }
    }, [])

    useEffect(() => {
        if (newCard !== undefined) {
            setCells(prevState => [...prevState, newCard]);
        }
    }, [newCard])

    const saveCard = async (cellId: string, state: string, nextState: string, bgcolor: string, color: string, isDefault: boolean) => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                _id: cellId,
                data: [
                    {
                        propName: "status",
                        value: state
                    },
                    {
                        propName: "nextStatus",
                        value: nextState
                    },
                    {
                        propName: "color",
                        value: bgcolor
                    },
                    {
                        propName: "fontcolor",
                        value: color
                    },
                    {
                        propName: "default",
                        value: isDefault
                    }
                ]
            }
        ]

        await FetchData({ urlHost: url, urlPath: '/status/edit_status', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${userId}` });

        if (isDefault) {
            setCells(prevState => prevState?.map((prev) => {
                return prev.default && prev._id !== cellId
                    ?
                    { ...prev, default: false }
                    :
                    prev
            }));
        }

        setCells(prevState => prevState?.map((cell) => {
            return cell._id === cellId
                ?
                { ...cell, status: state, nextStatus: nextState, color: bgcolor, fontcolor: color, default: isDefault }
                :
                cell
        }));
        setMessageOpen(true);
    }

    const deleteCard = async (cardId: string) => {
        let usrid = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: usrid,
            _id: cardId,
        }

        await FetchData({ urlHost: url, urlPath: '/status/delete_status', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

        const newUsers = cells.filter((card) => {
            return card._id !== cardId;
        });
        setCells(newUsers);
    }

    return (
        <Table style={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
        }}>
            <Thead>
                <Tr>
                    <Th>Tila</Th>
                    <Th>Seuraava tila</Th>
                    <Th>Taustaväri</Th>
                    <Th>Tekstinväri</Th>
                    <Th>Alkuperäinen</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    cells.map((cell) => (
                        <SettingsStatusCell key={cell._id} cell={cell} select={select} saveCard={(cellId, state, nextState, bgcolor, color, isDefault) => saveCard(cellId, state, nextState, bgcolor, color, isDefault)} deleteCard={(cellId) => deleteCard(cellId)} />
                    ))
                }
            </Tbody>
            {
                messageOpen
                    ?
                    <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='Tilauksen tila'>
                        Tilauksen tila on päivitetty.
                    </Message>
                    :
                    null
            }
        </Table>
    )
}

export default SettingsStatusTable;