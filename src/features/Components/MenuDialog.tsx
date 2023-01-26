import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Button } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    setIsOpen: (value: boolean) => void;
    isOpen: boolean;
    result: () => void;
    dialogTitle: string;
    children: React.ReactNode;
}

const MenuDialog: React.FC<Props> = ({ setIsOpen, isOpen, result, dialogTitle, children }) => {
    const handleClose = () => {
        setIsOpen(!isOpen);
    }

    const handleClick = () => {
        setIsOpen(!isOpen);
        result();
    }

    return (
        <Dialog
            onClose={handleClose}
            open={isOpen}
        >
            <DialogTitle>
                {dialogTitle}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {children}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsOpen(!isOpen)}>Ei</Button>
                <Button onClick={handleClick}>Kyllä</Button>
            </DialogActions>
        </Dialog >
    )
}

export default MenuDialog;