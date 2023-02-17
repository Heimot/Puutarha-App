import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import { useTheme } from '@mui/material/styles';
import FetchData from '../../Components/Fetch';
import SettingsUserCell from './SettingsUserCell';
import { User, Role } from '../../../Model';
import Message from '../../Components/Message';

interface Props {
    newUser: User | undefined;
}

const SettingsUsersTable: React.FC<Props> = ({ newUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        if (users.length > 0) return;
        const getUsers = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;

            const fetchUsers = await FetchData({ urlHost: url, urlPath: '/auth/get_all_users', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            const fetchRoles = await FetchData({ urlHost: url, urlPath: '/roles/get_roles', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setUsers(fetchUsers.result);
            setRoles(fetchRoles.result);
        }
        getUsers();
        return () => {
            setUsers([]);
        }
    }, [])

    useEffect(() => {
        if (newUser !== undefined) {
            setUsers(prevState => [...prevState, newUser]);
        }
    }, [newUser])

    const saveUser = async (userId: string, roleId: string) => {
        let usrid = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: usrid,
            _id: userId,
            role: roleId
        }

        const updateRole = await FetchData({ urlHost: url, urlPath: '/auth/add_role', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: body });

        const useRole = roles.filter((role) => {
            return role._id === roleId
        });

        updateRole.result.role = useRole[0];

        const newUsers = users.map((user) => {
            return user._id === updateRole.result._id
                ?
                updateRole.result
                :
                user
        });
        setUsers(newUsers);
        setMessageOpen(true);
    }

    const deleteUser = async (userId: string) => {
        let usrid = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: usrid,
            _id: userId,
        }

        await FetchData({ urlHost: url, urlPath: '/auth/delete_user', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });

        const newUsers = users.filter((user) => {
            return user._id !== userId;
        });
        setUsers(newUsers);
    }

    return (
        <Table style={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
        }}>
            <Thead>
                <Tr>
                    <Th>Sähköposti</Th>
                    <Th>Käyttäjänimi</Th>
                    <Th>Rooli</Th>
                    <Th>Salasanan vaihto</Th>
                </Tr>
            </Thead>
            <Tbody>
                {
                    users.map((user) => (
                        <SettingsUserCell key={user._id} user={user} roles={roles} saveUser={(userId, roleId) => saveUser(userId, roleId)} deleteUser={(userId) => deleteUser(userId)} />
                    ))
                }
            </Tbody>
            {
                messageOpen
                    ?
                    <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle='Käyttäjä'>
                        Käyttäjä on päivitetty.
                    </Message>
                    :
                    null
            }
        </Table>
    )
}

export default SettingsUsersTable