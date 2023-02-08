import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

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
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsOpen(!isOpen)}>Ei</Button>
                <Button onClick={handleClick}>Kyllä</Button>
            </DialogActions>
        </Dialog >
    )
}

export default MenuDialog;