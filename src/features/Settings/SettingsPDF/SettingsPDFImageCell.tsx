import React, { useState, useEffect } from 'react'
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PDFImage } from '../../../Model';

import DeleteIcon from '@mui/icons-material/Delete';
import SettingsPDFImageTable from './SettingsPDFImageTable';

interface Props {
    image: PDFImage;
    removeImageData: (_id: string) => void;
    updateImageData: (_id: string, imageURL: string, height: number, width: number, xPosition: number, yPosition: number) => void;
}

interface ImageArr {
    _id: string;
    imageURL: string;
    height: number;
    width: number;
    xPosition: number;
    yPosition: number;
}

const SettingsPDFImageCell: React.FC<Props> = ({ image, removeImageData, updateImageData }) => {
    const [imageData, setImageData] = useState<ImageArr>({ _id: image._id, imageURL: image.imageURL, height: image.height, width: image.width, xPosition: image.xPosition, yPosition: image.yPosition })
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        if (imageData._id === null) return;
        updateImageData(imageData._id, imageData.imageURL, imageData.height, imageData.width, imageData.xPosition, imageData.yPosition)
    }, [imageData])

    const handleChange = (value: string | number, name: string) => {
        setImageData((prevState) => {
            return {
                ...prevState,
                [name]: value
            }
        })
    }

    return (
        <Tr>
            <Td style={borderStyle}>
                <Box>
                    <Button fullWidth onClick={() => setIsOpen((prevState) => !prevState)}>Valitse kuva</Button>
                    <Typography sx={{ fontSize: "12px" }}>{imageData._id}</Typography>
                </Box>
            </Td>
            <Td style={borderStyle}>
                <TextField fullWidth name='height' value={imageData.height} onChange={(e) => handleChange(e.target.value, e.target.name)} />
            </Td>
            <Td style={borderStyle}>
                <TextField fullWidth name='width' value={imageData.width} onChange={(e) => handleChange(e.target.value, e.target.name)} />
            </Td>
            <Td style={borderStyle}>
                <TextField fullWidth name='xPosition' value={imageData.xPosition} onChange={(e) => handleChange(e.target.value, e.target.name)} />
            </Td>
            <Td style={borderStyle}>
                <Box sx={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                    <TextField fullWidth name='yPosition' value={imageData.yPosition} onChange={(e) => handleChange(e.target.value, e.target.name)} />
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => removeImageData(imageData._id)}><DeleteIcon fontSize='large' /></Button>
                </Box>
            </Td>
            {
                isOpen
                &&
                <SettingsPDFImageTable isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} chooseImage={(value: string) => setImageData((prevState) => { return { ...prevState, imageURL: value } })} />
            }
        </Tr>
    )
}

export default SettingsPDFImageCell;