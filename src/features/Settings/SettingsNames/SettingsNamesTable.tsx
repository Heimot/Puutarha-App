import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsNamesCell from './SettingsNamesCell';
import { Store, Flower } from '../../../Model';
import Message from '../../Components/Message';


interface Props {
    newCard: Store | Flower | undefined;
    group: 'Stores' | 'Flowers';
    passValue: (value: Store | Flower) => void;
    resetValue: () => void;
}

const SettingsRFIDTable: React.FC<Props> = ({ newCard, group, passValue, resetValue }) => {
    const [cards, setCards] = useState<Store[] | Flower[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (cards.length > 0) return;
        const getCards = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchCards = await FetchData({ urlHost: url, urlPath: '/names/get_names_with_group', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&group=${group}` });
            setCards(fetchCards.result);
        }
        getCards();
        return () => {
            setCards([]);
        }
    }, [])

    useEffect(() => {
        if (newCard !== undefined) {
            if (newCard.group !== group) return;
            setCards(prevState => [...prevState, newCard]);
            resetValue();
        }
    }, [newCard])

    const saveCard = async (cardId: string, name: string, groupData: string) => {
        if (groupData === '') return alert('You need to choose a group!');
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                _id: cardId,
                data: [
                    {
                        propName: "name",
                        value: name
                    },
                    {
                        propName: "group",
                        value: groupData
                    }
                ]
            }
        ]

        await FetchData({ urlHost: url, urlPath: '/names/edit_name', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${userId}` });
        let newCards = null;
        if (group === groupData) {
            newCards = await cards?.map((card) => {
                return card._id === cardId
                    ?
                    { ...card, name: name, group: groupData }
                    :
                    card
            });
        } else {
            newCards = await cards?.filter((card) => {
                return card._id !== cardId;
            });
            let value = await cards?.filter((card) => {
                return card._id === cardId;
            })[0];
            value.name = name;
            value.group = groupData;
            console.log(value)
            passValue(value);
        }
        if (newCards === null) return;
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

        await FetchData({ urlHost: url, urlPath: '/names/delete_name', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

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
                    <Th>Kukka vai kauppa</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    cards.map((card) => (
                        <SettingsNamesCell key={card._id} card={card} saveCard={(cardId, name, group) => saveCard(cardId, name, group)} deleteCard={(cardId) => deleteCard(cardId)} />
                    ))
                }
            </Tbody>
            {
                messageOpen
                    ?
                    <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='Nimi'>
                        Nimi on päivitetty.
                    </Message>
                    :
                    null
            }
        </Table>
    )
}

export default SettingsRFIDTable;