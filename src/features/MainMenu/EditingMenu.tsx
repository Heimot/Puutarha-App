import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Button } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import { Order } from './Model';
import EditingMenuData from './EditingMenuData';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    editData: Order | null;
}

const EditingMenu: React.FC<Props> = ({ isOpen, setIsOpen, editData }) => {

    const handleClick = () => {
        setIsOpen(!isOpen);
    }

    const handleClose = (event: any, reason: string) => {
        if (reason && reason == "backdropClick")
            return;
        setIsOpen(!isOpen);
    }

    return (
        <Dialog
            onClose={handleClose}
            fullWidth={true}
            maxWidth={"md"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Order
                <IconButton
                    aria-label="close"
                    onClick={handleClick}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Tuote</Th>
                            <Th>Kerätään</Th>
                            <Th>Keräyspiste</Th>
                            <Th>Lisätietoa</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            editData?.products.map((product) => 
                            <EditingMenuData key={product._id} product={product} />
                            )
                        }
                    </Tbody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' autoFocus startIcon={<SaveIcon />} onClick={handleClick}>
                    Save changes
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default EditingMenu