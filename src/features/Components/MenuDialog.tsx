import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface Props {
    setIsOpen: (value: boolean) => void;
    isOpen: boolean;
    result: () => void;
    dialogTitle: string;
    actions: boolean;
    children: React.ReactNode;
}

const MenuDialog: React.FC<Props> = ({ setIsOpen, isOpen, result, dialogTitle, actions, children }) => {
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
            {
                actions
                    ?
                    <DialogActions>
                        <Button onClick={() => setIsOpen(!isOpen)}>Ei</Button>
                        <Button onClick={handleClick}>Kyllä</Button>
                    </DialogActions>
                    :
                    <DialogActions>
                        <Button onClick={() => setIsOpen(!isOpen)}>Sulje</Button>
                    </DialogActions>
            }
        </Dialog >
    )
}

export default MenuDialog;