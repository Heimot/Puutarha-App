import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsTrucksCell from './SettingsTrucksCell';
import { Truck } from '../../../Model';
import Message from '../../Components/Message';


interface Props {
    newCard: Truck | undefined;
}

const SettingsTrucksTable: React.FC<Props> = ({ newCard }) => {
    const [cards, setCards] = useState<Truck[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (cards.length > 0) return;
        const getCards = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchCards = await FetchData({ urlHost: url, urlPath: '/trucks/get_trucks', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setCards(fetchCards.result);
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

    const saveCard = async (cardId: string, truck: string, isDefault: boolean) => {
        let usrId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                _id: cardId,
                data: [
                    {
                        propName: "truckLicensePlate",
                        value: truck
                    },
                    {
                        propName: "default",
                        value: isDefault
                    }
                ]
            }
        ]

        await FetchData({ urlHost: url, urlPath: '/trucks/edit_truck', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${usrId}` });

        const newCards = cards?.map((card) => {
            return card._id === cardId
                ?
                { ...card, truckLicensePlate: truck, default: isDefault }
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

        await FetchData({ urlHost: url, urlPath: '/trucks/delete_truck', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

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
                    <Th>Rekka</Th>
                    <Th>Alkuperäinen</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    cards.map((card) => (
                        <SettingsTrucksCell key={card._id} card={card} saveCard={(cardId, truck, isDefault) => saveCard(cardId, truck, isDefault)} deleteCard={(cardId) => deleteCard(cardId)} />
                    ))
                }
            </Tbody>
            {
                messageOpen
                &&
                <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='Rekka'>
                    Rekka on päivitetty.
                </Message>
            }
        </Table>
    )
}

export default SettingsTrucksTable;