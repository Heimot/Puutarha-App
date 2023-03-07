import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Button, Container, Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

interface Props {
    order: any;
    index: number;
    flowerNames: any[];
    locationNames: any[];
}

const ExcelTable: React.FC<Props> = ({ order, index, flowerNames, locationNames }) => {
    useEffect(() => {
        console.log(flowerNames)
    }, [flowerNames])

    useEffect(() => {
        console.log(locationNames)
    }, [locationNames])

    return (
        <Box>
            <Button onClick={() => console.log(order)}>Get order</Button>
        </Box>
    )
}

export default ExcelTable