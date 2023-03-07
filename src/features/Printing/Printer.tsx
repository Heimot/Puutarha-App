import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Select, MenuItem } from '@mui/material';
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'
import jsPDF from 'jspdf';

import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';

import { Stickers, pdfs, PDFImage, PDFText, ImageData } from '../../Model';
import { useTheme } from '@mui/material/styles';
import PrinterData from './PrinterData';
import dayjs from 'dayjs';
import FetchData from '../Components/Fetch';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    stickers: Stickers[];
    setStickers: (value: any) => void;
    resetCards: () => void;
}

const Printer: React.FC<Props> = ({ isOpen, setIsOpen, stickers, setStickers, resetCards }) => {
    const [printableStickers, setPrintableStickers] = useState<Stickers[]>([]);
    const [chosenSticker, setChosenSticker] = useState<string>('');
    const [pdfs, setPdfs] = useState<pdfs[]>([]);

    const theme = useTheme();

    useEffect(() => {
        const getNames = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const pdfNames = await FetchData({ urlHost: url, urlPath: '/pdf/get_pdf_names', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setPdfs(pdfNames.result);
            const chosen = pdfNames?.result?.filter((pdf: any) => {
                return pdf.stickerDefault;
            })[0];
            if (!chosen) return;
            setChosenSticker(chosen?._id);
        }

        getNames();
        return () => {
            setPdfs([]);
            setChosenSticker('');
        }
    }, [])

    useEffect(() => {
        setPrintableStickers(stickers);
    }, [stickers])

    const imageToBase64 = (imgUrl: string, callback: Function) => {
        let img = new Image();

        // onload fires when the image is fully loadded, and has width and height

        img.onload = function () {
            let canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            let dataURL = canvas.toDataURL("image/png");
            dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
            callback(dataURL); // the base64 string
        };

        // incase image has been deleted dont show anything.
        img.onerror = () => {
            callback(null);
        }

        // set attributes and src 
        img.crossOrigin = '';
        img.src = imgUrl;
    }

    const print = async () => {
        let doc = new jsPDF();
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let pdfData = await FetchData({ urlHost: url, urlPath: '/pdf/get_pdf_by_id', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentPDFId=${chosenSticker}` });
        if (pdfData === null) return;
        pdfData = pdfData?.result;
        doc = new jsPDF(pdfData?.pageLayout, 'mm', [pdfData?.height, pdfData?.width]);
        let imageRef: ImageData[] = [];


        /**
         * This is done so we dont need to get the image from the url each time we create a pdf.
         * It gets the images the pdf needs and re uses them. 
         */

        let baseImagePromises = pdfData?.PDFImage.map((image: PDFImage) => new Promise((resolve, reject) => {
            if (imageRef.length > 0) {
                let exists = imageRef?.filter((item: ImageData) => {
                    return item.imageID === image.imageURL;
                });
                if (exists.length <= 0) {
                    imageToBase64(`${process.env.REACT_APP_API_URL}/files/get_image_by_id?id=${image.imageURL}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`, function (base64image: string) {
                        if (base64image) {
                            resolve({ _id: image._id, image: base64image, imageID: image.imageURL });
                        } else {
                            // It will return empty base64image here if image doesnt exist or fails to fetch for some reason
                            // Otherwise it wont show the text data
                            resolve({ _id: image._id, image: base64image, imageID: image.imageURL });
                        }
                    });
                }
            } else {
                imageToBase64(`${process.env.REACT_APP_API_URL}/files/get_image_by_id?id=${image.imageURL}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`, function (base64image: string) {
                    if (base64image) {
                        resolve({ _id: image._id, image: base64image, imageID: image.imageURL });
                    } else {
                        // It will return empty base64image here if image doesnt exist or fails to fetch for some reason
                        // Otherwise it wont show the text data
                        resolve({ _id: image._id, image: base64image, imageID: image.imageURL });
                    }
                });
            }
        }))
        Promise.all(baseImagePromises)
            .then((data: any) => {
                imageRef.push(...data);
            })
            .then(async () => {
                for (let i = 0; printableStickers.length > i; i++) {
                    if (pdfData === null) return;
                    await pdfData?.PDFText.map((text: PDFText) => {
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
                            case '[[L]]':
                                if (printableStickers[i] === undefined) return;
                                doc.text(printableStickers[i].location.location, text.xPosition, text.yPosition);
                                break;
                            default:
                                doc.text(text.text, text.xPosition, text.yPosition);
                                break;
                        }
                    })

                    if (pdfData === null) return;
                    await pdfData?.PDFImage.map((image: any) => {
                        if (image.imageURL === "") return;
                        let docImage = imageRef.filter((img) => {
                            return img.imageID === image.imageURL;
                        })[0];
                        if (!docImage?.image) return;
                        doc.addImage(docImage.image, "", Number(image.xPosition), Number(image.yPosition), Number(image.width), Number(image.height));
                    })
                    if ((printableStickers.length - 1) > i) {
                        doc.addPage();
                    }
                }

                doc.autoPrint();
                let blob = doc.output("blob");
                window.open(URL.createObjectURL(blob));
                setStickers([]);
                setPrintableStickers([]);
                resetCards();
                setIsOpen(false);
            })
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
                {
                    chosenSticker !== ''
                        ?
                        <Select style={{ marginRight: 'auto' }} value={chosenSticker} onChange={(e) => setChosenSticker(e.target.value)}>
                            {
                                pdfs.map((pdf: pdfs) => (
                                    <MenuItem value={pdf._id} key={pdf._id}>{pdf.PDFName}</MenuItem>
                                ))
                            }
                        </Select>
                        :
                        null
                }
                <Button variant='contained' autoFocus startIcon={<PrintIcon />} onClick={() => print()}>
                    Tulosta
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default Printer;