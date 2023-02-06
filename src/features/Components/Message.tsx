import React, { useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface Props {
    setIsOpen: (value: boolean) => void;
    isOpen: boolean;
    dialogTitle: string;
    children: React.ReactNode;
}

const fadeOut = keyframes`
    0%,100% { opacity: 0; }
    40% { opacity: 1; }
`;

const StyledDialog = styled(Dialog)(({ theme }) => ({
    animation: `${fadeOut} ease 6s`
}));

const Message: React.FC<Props> = ({ setIsOpen, isOpen, dialogTitle, children }) => {
    useEffect(() => {
        const time = setTimeout(() => {
            setIsOpen(false);
        }, 6000)
        return () => {
            clearTimeout(time);
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false);
    }

    return (
        <StyledDialog
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
        </StyledDialog >
    )
}

export default Message;