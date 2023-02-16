import React, { useEffect, useState, useRef } from 'react';
import { Box, Backdrop, Button, Typography, LinearProgress } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import FetchData from '../Components/Fetch';
import { Card } from '../../Model';

interface Props {
    setIsBlocked: () => void;
    rfidCards: (cards: string[]) => void;
}

let touchId = '';

// SCANNING USERS USING IDENTIV KBD WEDGE AND UTRUST 4701F
const MainRFID: React.FC<Props> = ({ setIsBlocked, rfidCards }) => {
    const [id, setId] = useState<string>('');
    const [ids, setIds] = useState<string[]>([]);
    const [users, setUsers] = useState<Card[]>([]);

    useEffect(() => {
        document.documentElement.addEventListener('keyup', touchHandler);
        return () => {
            window.removeEventListener('keyup', touchHandler);
            setIds([]);
            setUsers([]);
            setId('');
        }
    }, [])

    useEffect(() => {
        const getUser = async () => {
            const isAdded = users.filter((user) => { return user.cardNumber === id })[0];
            if (!isAdded && id) {
                let userId = localStorage.getItem('userId');
                let url = process.env.REACT_APP_API_URL;
                const getUser = await FetchData({ urlHost: url, urlPath: '/card/get_card_by_card_number', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&card=${id}` });
                if (!getUser?.result) return alert('Error: Try again or ask administrator to add your tag.');
                setUsers(prevState => [...prevState, getUser.result]);
                setIds(prevState => [...prevState, id]);
            }
        }
        getUser();
        return () => {
            setId('');
        }
    }, [id])

    const touchHandler = (e: any) => {
        let key = e.keyCode || e.which;
        if (e.key.length === 1) {
            touchId = touchId + e.key;
        } else if (key === 13) {
            if (touchId.length > 3) {
                setId(touchId);
            }
            touchId = "";
        }
        setTimeout(() => {
            touchId = "";
        }, 500)
    }

    const readyNext = () => {
        document.documentElement.removeEventListener('keyup', touchHandler);
        rfidCards(ids);
        setIsBlocked();
    }

    return (
        <Backdrop open={true}>
            <Grid container flexDirection={'column'}>
                <Box>
                    <Typography variant='h3' sx={{ textAlign: 'center' }}>SCANNING</Typography>
                </Box>
                <LinearProgress />
                <Box sx={{ bgcolor: 'white', color: 'black', padding: '5px' }}>
                    {users?.map((user) => (
                        <Typography key={user?._id}>{user?.cardOwner}</Typography>
                    ))}
                </Box>
                <LinearProgress />
                <Button variant='contained' onClick={() => readyNext()} disabled={users.length !== 0 ? false : true} style={{ marginTop: "10px", borderRadius: "5px", height: "30px" }}>USERS HAVE BEEN SCANNED</Button>
            </Grid >
        </ Backdrop >
    )
}

export default MainRFID;