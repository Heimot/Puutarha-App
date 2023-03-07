import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsLocationCell from './SettingsLocationCell';
import { Location } from '../../../Model';
import Message from '../../Components/Message';


interface Props {
    newCard: Location | undefined;
}

const SettingsLocationTable: React.FC<Props> = ({ newCard }) => {
    const [cards, setCards] = useState<Location[]>([]);
    const [select, setSelect] = useState<Location[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (cards.length > 0) return;
        const getCards = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchCards = await FetchData({ urlHost: url, urlPath: '/location/get_locations', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setCards(fetchCards.result);
            setSelect(fetchCards.result);
        }
        getCards();
        return () => {
            setCards([]);
        }
    }, [])

    useEffect(() => {
        if (newCard !== undefined) {
            setCards(prevState => [...prevState, newCard]);
        }
    }, [newCard])

    const saveCard = async (cardId: string, location: string, nextLocation: string, isDefault: boolean) => {
        let usrId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                _id: cardId,
                data: [
                    {
                        propName: "location",
                        value: location
                    },
                    {
                        propName: "nextLocation",
                        value: nextLocation
                    },
                    {
                        propName: "default",
                        value: isDefault
                    }
                ]
            }
        ]

        await FetchData({ urlHost: url, urlPath: '/location/edit_location', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${usrId}` });

        const newCards = cards?.map((card) => {
            return card._id === cardId
                ?
                { ...card, location: location, nextLocation: nextLocation, default: isDefault }
                :
                card
        });
        setCards(newCards);
        setMessageOpen(true);
    }

    const deleteCard = async (cardId: string) => {
        let usrid = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: usrid,
            _id: cardId,
        }

        await FetchData({ urlHost: url, urlPath: '/location/delete_location', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

        const newUsers = cards.filter((card) => {
            return card._id !== cardId;
        });
        setCards(newUsers);
    }

    return (
        <Table style={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
        }}>
            <Thead>
                <Tr>
                    <Th>Sijainti</Th>
                    <Th>Seuraava sijainti</Th>
                    <Th>Alkuperäinen</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    cards.map((card) => (
                        <SettingsLocationCell key={card._id} card={card} select={select} saveCard={(cardId, location, nextLocation, isDefault) => saveCard(cardId, location, nextLocation, isDefault)} deleteCard={(cardId) => deleteCard(cardId)} />
                    ))
                }
            </Tbody>
            {
                messageOpen
                    ?
                    <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='Sijainti'>
                        Sijainti on päivitetty.
                    </Message>
                    :
                    null
            }
        </Table>
    )
}

export default SettingsLocationTable;