import React, { useState, useEffect } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import NavigationItem from './NavigationItem';

interface Props {
    drawerOpen: boolean;
    drawerClose: () => void;
}

const NavigationDrawer: React.FC<Props> = ({ drawerOpen, drawerClose }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        setIsOpen(drawerOpen);
    }, [drawerOpen])


    const toggleDrawer = (event: any) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }

        setIsOpen(prevState => !prevState);
        drawerClose();
    };

    return (
        <div>
            <React.Fragment>
                <SwipeableDrawer
                    anchor={'left'}
                    open={isOpen}
                    onClose={toggleDrawer}
                    onOpen={toggleDrawer}
                >
                    <NavigationItem toggleDrawer={toggleDrawer} />
                </SwipeableDrawer>
            </React.Fragment>
        </div>
    );
}

export default NavigationDrawer