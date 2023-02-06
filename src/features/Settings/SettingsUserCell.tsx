import React, { useState, useEffect } from 'react';
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Select, MenuItem, Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Role, User } from '../../Model';
import MenuDialog from '../Components/MenuDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    user: User;
    roles: Role[];
    saveUser: (userId: string, roleId: string) => void;
    deleteUser: (userId: string) => void;
}

const SettingsUserCell: React.FC<Props> = ({ user, roles, saveUser, deleteUser }) => {
    const [role, setRole] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        if (typeof user.role === 'string') {
            setRole(user.role)
        } else {
            if (role === '') {
                setRole(user?.role._id)
            }
        }
    }, [user])

    return (
        <Tr>
            <Td style={borderStyle}>
                <Typography>{user.email}</Typography>

            </Td>
            <Td style={borderStyle}>
                <Typography>{user.username}</Typography>
            </Td>
            <Td style={borderStyle}>
                {
                    role !== ''
                        ?
                        <Select value={role} onChange={(e: any) => setRole(e.target.value)} fullWidth>
                            {
                                roles.map((role) => (
                                    <MenuItem key={role._id} value={role._id}>{role.role}</MenuItem>
                                ))
                            }
                        </Select>
                        :
                        null
                }
            </Td>
            <Td style={borderStyle}>

                <Box style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>

                    <TextField fullWidth value={'WIP PASSWORD CHANGE SYSTEM'}></TextField>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => saveUser(user._id, role)}>
                        <SaveIcon fontSize='large' />
                    </Button>
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}>
                        <DeleteIcon fontSize='large' />
                    </Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => deleteUser(user._id)} dialogTitle={'Haluatko poistaa tämän käyttäjän?'}>
                {`Haluatko varmasti poistaa Käyttäjän ${user.email} (${user.username})? Mikäli poistat käyttäjän sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr>
    )
}

export default SettingsUserCell