import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsRollerCell from './SettingsRollerCell';
import { Roller } from '../../../Model';
import Message from '../../Components/Message';


interface Props {
    newCard: Roller | undefined;
}

const SettingsRollerTable: React.FC<Props> = ({ newCard }) => {
    const [cards, setCards] = useState<Roller[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (cards.length > 0) return;
        const getCards = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchCards = await FetchData({ urlHost: url, urlPath: '/rollers/get_rollers', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
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

    const saveCard = async (cardId: string, roller: string, lockColor: string, isDefault: boolean) => {
        let usrId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = [
            {
                propName: "roller",
                value: roller
            },
            {
                propName: "lockColor",
                value: lockColor
            },
            {
                propName: "default",
                value: isDefault
            }
        ]

        await FetchData({ urlHost: url, urlPath: '/rollers/edit_roller', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${usrId}&currentRollerId=${cardId}` });
        const newCards = cards?.map((card) => {
            return card._id === cardId
                ?
                { ...card, roller: roller, lockColor: lockColor, default: isDefault }
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

        await FetchData({ urlHost: url, urlPath: '/rollers/delete_roller', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

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
                    <Th>Rullakko</Th>
                    <Th>Rullakon väri</Th>
                    <Th>Alkuperäinen</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    cards.map((card) => (
                        <SettingsRollerCell key={card._id} card={card} saveCard={(cardId, roller, lockColor, isDefault) => saveCard(cardId, roller, lockColor, isDefault)} deleteCard={(cardId) => deleteCard(cardId)} />
                    ))
                }
            </Tbody>
            {
                messageOpen
                &&
                <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='Rullakko'>
                    Rullakko on päivitetty.
                </Message>
            }
        </Table>
    )
}

export default SettingsRollerTable;