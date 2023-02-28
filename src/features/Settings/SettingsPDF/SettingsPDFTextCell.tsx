import React, { useState, useEffect } from 'react'
import { Tr, Td } from 'react-super-responsive-table';
import { TextField, Button, Select, MenuItem, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PDFText, Fonts, GetFonts } from '../../../Model';

import DeleteIcon from '@mui/icons-material/Delete';
import MenuDialog from '../../Components/MenuDialog';

interface Props {
    text: PDFText;
    fonts: Fonts[];
    getFonts: GetFonts;
    removeTextData: (_id: string) => void;
    updateTextData: (_id: string, text: string, font: string, fontType: string, fontSize: number, xPosition: number, yPosition: number) => void;
}

interface TextArr {
    _id: string;
    text: string;
    Font: string;
    FontType: string;
    FontSize: number;
    XPosition: number;
    YPosition: number;
}

const SettingsPDFTextCell: React.FC<Props> = ({ text, fonts, getFonts, removeTextData, updateTextData }) => {
    const [textData, setTextData] = useState<TextArr>({ _id: text._id, text: text.text, Font: text.font, FontType: text.fontType, FontSize: text.fontSize, XPosition: text.xPosition, YPosition: text.yPosition })
    const [fontTypes, setFontTypes] = useState<string[]>()
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const theme = useTheme();

    const borderStyle = {
        borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
        borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
    }

    useEffect(() => {
        if (textData._id === null) return;
        updateTextData(textData._id, textData.text, textData.Font, textData.FontType, textData.FontSize, textData.XPosition, textData.YPosition)
        setFontTypes(getFonts[textData.Font])
    }, [textData])

    const handleChange = (value: string | number, name: string) => {
        setTextData((prevState) => {
            return {
                ...prevState,
                [name]: value
            }
        })
    }

    return (
        <Tr>
            <Td style={borderStyle}>
                <TextField name='text' fullWidth value={textData.text} onChange={(e) => handleChange(e.target.value, e.target.name)} />
            </Td>
            <Td style={borderStyle}>
                <Select fullWidth value={textData.Font.toString()} name='Font' onChange={(e) => { handleChange(e.target.value, e.target.name); setFontTypes(getFonts[e.target.value]); }}>
                    {
                        fonts?.map((font) => (
                            <MenuItem key={font.name} value={font.name}>{font.name}</MenuItem>
                        ))
                    }
                </Select>
            </Td>
            <Td style={borderStyle}>
                <TextField name='FontSize' fullWidth value={textData.FontSize} onChange={(e) => handleChange(e.target.value, e.target.name)} />
            </Td>
            <Td style={borderStyle}>
                <Select fullWidth name='FontType' value={textData.FontType.toString()} onChange={(e) => handleChange(e.target.value, e.target.name)}>
                    {
                        fontTypes?.map((font, index) => (
                            <MenuItem key={index} value={font}>{font}</MenuItem>
                        ))
                    }
                </Select>
            </Td>
            <Td style={borderStyle}>
                <TextField name='XPosition' fullWidth value={textData.XPosition} onChange={(e) => handleChange(e.target.value, e.target.name)} />
            </Td>
            <Td style={borderStyle}>
                <Box sx={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                    <TextField fullWidth name='YPosition' value={textData.YPosition} onChange={(e) => handleChange(e.target.value, e.target.name)} />
                    <Button style={{ minHeight: "auto", minWidth: "auto", padding: 0 }} onClick={() => setIsOpen(true)}><DeleteIcon fontSize='large' /></Button>
                </Box>
            </Td>
            <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => removeTextData(textData._id)} dialogTitle={'Haluatko poistaa tämän tekstin?'} actions={true}>
                {`Haluatko varmasti tämän tekstin? Mikäli poistat sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Tr>
    )
}

export default SettingsPDFTextCell;