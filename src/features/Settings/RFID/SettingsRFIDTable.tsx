import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsRFIDCell from './SettingsRFIDCell';
import { User, Card } from '../../../Model';
import Message from '../../Components/Message';


interface Props {
    newCard: Card | undefined;
}

const SettingsRFIDTable: React.FC<Props> = ({ newCard }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (cards.length > 0) return;
        const getCards = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchCards = await FetchData({ urlHost: url, urlPath: '/card/get_cards', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            const fetchUsers = await FetchData({ urlHost: url, urlPath: '/auth/get_all_users', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setCards(fetchCards.result);
            setUsers(fetchUsers.result);
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

    const saveCard = async (cardId: string, userId: string, name: string, cNumber: string) => {
        let usrId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let acc: string | null = userId;
        if (acc === '') {
            acc = null;
        }
        let body = [
            {
                propName: "cardNumber",
                value: cNumber
            },
            {
                propName: "cardOwner",
                value: name
            },
            {
                propName: "cardAccount",
                value: acc
            }
        ]

        const updateCard = await FetchData({ urlHost: url, urlPath: '/card/update_card', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${usrId}&currentCardId=${cardId}` });

        const newCards = cards?.map((card) => {
            return card._id === cardId
                ?
                { ...card, cardNumber: cNumber, cardOwner: name, cardAccount: acc }
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

        await FetchData({ urlHost: url, urlPath: '/card/delete_card', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

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
                    <Th>Nimi</Th>
                    <Th>Kortti</Th>
                    <Th>Käyttäjä (EI PAKOLLINEN)</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    cards.map((card) => (
                        <SettingsRFIDCell key={card._id} card={card} users={users} saveCard={(cardId, userId, name, cNumber) => saveCard(cardId, userId, name, cNumber)} deleteCard={(cardId) => deleteCard(cardId)} />
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

export default SettingsRFIDTable;