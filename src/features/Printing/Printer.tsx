import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from '@mui/material';
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import jsPDF from 'jspdf';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../app/redux/store';

import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';

import { Stickers } from '../MainMenu/Model';
import { useTheme } from '@mui/material/styles';
import PrinterData from './PrinterData';
import dayjs from 'dayjs';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    stickers: Stickers[],
    setStickers: (value: any) => void;
}

const Printer: React.FC<Props> = ({ isOpen, setIsOpen, stickers, setStickers }) => {
    const [printableStickers, setPrintableStickers] = useState<Stickers[]>([]);
    const { pdfSettings } = useSelector((state: State) => state.data);

    const theme = useTheme();

    useEffect(() => {
        setPrintableStickers(stickers);
    }, [stickers])


    const print = async () => {
        let doc = new jsPDF();
        console.log(printableStickers)
        for (let i = 0; printableStickers.length > i; i++) {
            let pdfData = pdfSettings[0];
            if (pdfData === null) return;
            doc = new jsPDF(pdfData?.pageLayout, 'mm', [pdfData?.height, pdfData?.width]);
            await doc.addPage();

            if (pdfData === null) return;
            await pdfData?.PDFText.map((text: any) => {
                doc.setFont(text.font, text.fontType);
                doc.setFontSize(text.fontSize);
                switch (text.text) {
                    case '[[FLOWER]]':
                        if (printableStickers[i] === undefined) return;
                        doc.text(printableStickers[i]?.flower.name, text.xPosition, text.yPosition);
                        break;
                    case '[[AMOUNT]]':
                        if (printableStickers[i] === undefined) return;
                        doc.text((printableStickers[i]?.amount).toString(), text.xPosition, text.yPosition);
                        break;
                    case '[[INFORMATION]]':
                        if (printableStickers[i] === undefined) return;
                        doc.text(printableStickers[i]?.information, text.xPosition, text.yPosition);
                        break;
                    case '[[STORE]]':
                        if (printableStickers[i] === undefined) return;
                        doc.text(printableStickers[i]?.store.name, text.xPosition, text.yPosition);
                        break;
                    case '[[TODAY]]':
                        if (printableStickers[i] === undefined) return;
                        doc.text(dayjs().format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                        break;
                    case '[[DATE]]':
                        if (printableStickers[i] === undefined) return;
                        doc.text(dayjs(printableStickers[i]?.pickingdate).format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                        break;
                    default:
                        doc.text(text.text, text.xPosition, text.yPosition);
                        break;
                }
            })

            if (pdfData === null) return;
            await pdfData?.PDFImage.map((image: any) => {
                if (image.imageURL === "") return;
                let img = new Image();
                img.crossOrigin = "";
                img.src = `http://localhost:5000/files/get_image_by_id?_id=${image.imageURL}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`;

                doc.addImage(img, "", Number(image.xPosition), Number(image.yPosition), Number(image.width), Number(image.height));
            })

        }

        doc.autoPrint();
        let blob = doc.output("blob");
        window.open(URL.createObjectURL(blob));
    }

    const handleClose = () => {

    }

    const deleteSticker = (id: string) => {
        let newStickers = stickers.filter((sticker) => {
            return sticker._id !== id;
        });
        let newPStickers = printableStickers.filter((sticker) => {
            return sticker._id !== id;
        });
        setPrintableStickers(newPStickers);
        setStickers(newStickers);
    }

    const addStickers = (sticker: Stickers, amount: Number) => {
        let stickerAmount = printableStickers.filter((item) => {
            return item._id !== sticker._id
        })
        let newAmount = [];
        for (let i = 0; i < amount; i++) {
            newAmount.push(sticker);
        }
        stickerAmount = [...stickerAmount, ...newAmount];
        setPrintableStickers(stickerAmount);
    }

    return (
        <Dialog
            onClose={() => setIsOpen(!isOpen)}
            fullWidth={true}
            maxWidth={"md"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Tulosta tarrat
                <IconButton
                    aria-label="close"
                    onClick={() => setIsOpen(!isOpen)}
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

                <Table style={{
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
                }}>
                    <Thead>
                        <Tr>
                            <Th>Kauppa</Th>
                            <Th>Tuote</Th>
                            <Th>Kerätään</Th>
                            <Th>Lisätietoa</Th>
                            <Th>Tarrojen määrä</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            stickers.map((sticker) => (
                                <PrinterData key={sticker._id} sticker={sticker} deleteSticker={(id) => deleteSticker(id)} addStickers={(sticker, amount) => addStickers(sticker, amount)} />
                            ))
                        }
                    </Tbody>
                </Table>

            </DialogContent>
            <DialogActions>
                <Button variant='contained' autoFocus startIcon={<PrintIcon />} onClick={() => print()}>
                    Tulosta
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default Printer