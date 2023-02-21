import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsStateCell from './SettingsStateCell';
import { State } from '../../../Model';
import Message from '../../Components/Message';


interface Props {
    newCard: State | undefined;
}

const SettingsStateTable: React.FC<Props> = ({ newCard }) => {
    const [cells, setCells] = useState<State[]>([]);
    const [select, setSelect] = useState<State[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (cells.length > 0) return;
        const getCards = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchCards = await FetchData({ urlHost: url, urlPath: '/state/get_states', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
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

    const saveCard = async (cellId: string, state: string, nextState: string, bgcolor: string, color: string, isDefault: boolean, sticker: boolean) => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                _id: cellId,
                data: [
                    {
                        propName: "state",
                        value: state
                    },
                    {
                        propName: "nextState",
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
                    },
                    {
                        propName: "stickerPoint",
                        value: sticker
                    }
                ]
            }
        ]

        await FetchData({ urlHost: url, urlPath: '/state/edit_state', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${userId}` });

        if (isDefault) {
            setCells(prevState => prevState?.map((prev) => {
                return prev.default && prev._id !== cellId
                    ?
                    { ...prev, default: false }
                    :
                    prev
            }));
        }

        if (sticker) {
            setCells(prevState => prevState?.map((prev) => {
                return prev.stickerPoint && prev._id !== cellId
                    ?
                    { ...prev, stickerPoint: false }
                    :
                    prev
            }));
        }

        setCells(prevState => prevState?.map((cell) => {
            return cell._id === cellId
                ?
                { ...cell, state: state, nextState: nextState, color: bgcolor, fontcolor: color, default: isDefault, stickerPoint: sticker }
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

        await FetchData({ urlHost: url, urlPath: '/state/delete_state', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

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
                    <Th>Tarratulostus</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    cells.map((cell) => (
                        <SettingsStateCell key={cell._id} cell={cell} select={select} saveCard={(cellId, state, nextState, bgcolor, color, isDefault, sticker) => saveCard(cellId, state, nextState, bgcolor, color, isDefault, sticker)} deleteCard={(cellId) => deleteCard(cellId)} />
                    ))
                }
            </Tbody>
            {
                messageOpen
                    ?
                    <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='RFID kortti'>
                        Kortti on päivitetty.
                    </Message>
                    :
                    null
            }
        </Table>
    )
}

export default SettingsStateTable;