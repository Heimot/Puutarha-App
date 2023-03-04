import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Select, MenuItem, Box, Typography, TextField, FormControl, InputLabel } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';

import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';

import { PDFData, PDFImage, PDFText, ImageData, Order } from '../../Model';
import dayjs from 'dayjs';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    orderPrint: Order | null;
    setOrderPrint: (value: any) => void;
}

let counter = 0;

const OrderPrinter: React.FC<Props> = ({ isOpen, setIsOpen, orderPrint, setOrderPrint }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [chosenSticker, setChosenSticker] = useState<string>('');
    const { pdfSettings } = useSelector((state: State) => state.data);

    useEffect(() => {
        const chosen = pdfSettings.filter((pdf: PDFData) => {
            return pdf.orderDefault
        })
        setChosenSticker(chosen[0]._id);
    }, [])

    useEffect(() => {
        setOrder(orderPrint);
    }, [orderPrint])

    const imageToBase64 = (imgUrl: string, callback: Function) => {
        var img = new Image();

        // onload fires when the image is fully loadded, and has width and height
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png"),
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
        let page = 1;
        counter = 0;
        let pdfData = pdfSettings.filter((pdf: PDFData) => {
            return pdf._id === chosenSticker;
        })[0];
        if (pdfData === null) return;
        doc = new jsPDF(pdfData?.pageLayout, 'mm', [pdfData?.height, pdfData?.width]);
        let imageRef: ImageData[] = [];
        let images = [];

        if (pdfData?.PDFImage?.length > 0) {
            images.push(...pdfData?.PDFImage);
        }

        if (pdfData?.header?.PDFImage?.length > 0) {
            images.push(...pdfData?.header?.PDFImage)
        }

        /**
         * This is done so we dont need to get the image from the url each time we create a pdf.
         * It gets the images the pdf needs and re uses them. 
         */
        let baseImagePromises = images.map((image: PDFImage) => new Promise((resolve, reject) => {
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
                if (!order) return;
                if (pdfData?.table) {
                    let tableHeader: string[] = [];
                    let defaultCell: string[] = [];
                    let resultCell: any = [];

                    for (let i = 0; i < pdfData.table.cells.length; i++) {
                        defaultCell.push(pdfData.table.cells[i].text);
                    }

                    order?.products.map((product) => {
                        let dCell = [];
                        for (let i = 0; i < defaultCell.length; i++) {
                            switch (defaultCell[i]) {
                                case '[[FLOWER]]':
                                    dCell.push(product.flower.name);
                                    break;
                                case '[[AMOUNT]]':
                                    dCell.push(product.amount);
                                    break;
                                case '[[PICKED]]':
                                    dCell.push(product.amountToDeliver);
                                    break;
                                case '[[INFORMATION]]':
                                    dCell.push(product.information);
                                    break;
                                case '[[L]]':
                                    dCell.push(product.location.location);
                                    break;
                                case '[[TODAY]]':
                                    dCell.push(dayjs().format('DD/MM/YYYY').toString());
                                    break;
                                default:
                                    dCell.push(defaultCell[i])
                                    break;
                            }
                        }
                        resultCell.push(dCell);
                    })

                    for (let i = 0; i < pdfData.table.headers.length; i++) {
                        tableHeader.push(pdfData.table.headers[i].text);
                    }

                    const header = () => {
                        pdfData?.header?.PDFText.map((text: any) => {
                            doc.setFont(text.font, text.fontType);
                            doc.setFontSize(text.fontSize);
                            switch (text.text) {
                                case '[[ID]]':
                                    if (!order?._id) return;
                                    doc.text(order?._id, text.xPosition, text.yPosition);
                                    break;
                                case '[[STORE]]':
                                    if (!order?.store?.name) return;
                                    doc.text(order?.store?.name, text.xPosition, text.yPosition);
                                    break;
                                case '[[PICKINGDATE]]':
                                    if (!order?.pickingdate) return;
                                    doc.text(dayjs(order?.pickingdate).format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                                    break;
                                case '[[DELIVERYDATE]]':
                                    if (!order?.deliverydate) return;
                                    doc.text(dayjs(order?.deliverydate).format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                                    break;
                                case '[[INFORMATION]]':
                                    if (!order?.information) return;
                                    doc.text(order?.information, text.xPosition, text.yPosition);
                                    break;
                                case '[[ORDERCODE]]':
                                    if (!order?.ordercode) return;
                                    doc.text(order?.ordercode, text.xPosition, text.yPosition);
                                    break;
                                case '[[PAGE]]':
                                    doc.text(page.toString(), text.xPosition, text.yPosition);
                                    break;
                                case '[[TODAY]]':
                                    doc.text(dayjs().format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                                    break;
                                default:
                                    doc.text(text.text, text.xPosition, text.yPosition);
                                    break;
                            }

                        })
                        if (pdfData === null) return;
                        pdfData?.header?.PDFImage.map((image: any) => {
                            if (image.imageURL === "") return;
                            let docImage = imageRef.filter((img) => {
                                return img.imageID === image.imageURL;
                            })[0];
                            if (!docImage?.image) return;
                            doc.addImage(docImage.image, "", Number(image.xPosition), Number(image.yPosition), Number(image.width), Number(image.height));
                        })
                        page++;
                    }

                    autoTable(doc, {
                        head: [tableHeader],
                        body: resultCell,
                        margin: { top: pdfData.table.yPosition },
                        bodyStyles: { valign: 'top' },
                        styles: { overflow: 'linebreak', cellWidth: 'wrap' },
                        columnStyles: { text: { cellWidth: 'auto' } },
                        didDrawPage: header
                    });
                }
                for (let i = 0; order.length > i; i++) {
                    if (pdfData === null) return;

                    await pdfData?.PDFText.map((text: PDFText) => {
                        doc.setFont(text.font, text.fontType);
                        doc.setFontSize(text.fontSize);
                        switch (text.text) {
                            case '[[ID]]':
                                if (!order?._id) return;
                                doc.text(order?._id, text.xPosition, text.yPosition);
                                break;
                            case '[[STORE]]':
                                if (!order?.store) return;
                                doc.text(order?.store.name, text.xPosition, text.yPosition);
                                break;
                            case '[[PICKINGDATE]]':
                                if (!order?.pickingdate) return;
                                doc.text(dayjs(order.pickingdate).format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                                break;
                            case '[[DELIVERYDATE]]':
                                if (!order?.deliverydate) return;
                                doc.text(dayjs(order.deliverydate).format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                                break;
                            case '[[INFORMATION]]':
                                if (!order?.information) return;
                                doc.text(order?.information, text.xPosition, text.yPosition);
                                break;
                            case '[[ORDERCODE]]':
                                if (!order?.ordercode) return;
                                doc.text(order?.ordercode, text.xPosition, text.yPosition);
                                break;
                            case '[[TODAY]]':
                                doc.text(dayjs().format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
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
                    if ((order?.length - 1) > i) {
                        doc.addPage();
                    }
                }

                doc.autoPrint();
                let blob = doc.output("blob");
                window.open(URL.createObjectURL(blob));
                setOrder(null);
                setOrderPrint(null);
                setIsOpen(false);
            })
    }

    return (
        <Dialog
            onClose={() => setIsOpen(!isOpen)}
            fullWidth={true}
            maxWidth={"xs"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Tulosta tilaus
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
                {
                    chosenSticker !== ''
                        ?
                        <FormControl>
                            <InputLabel id='PDF_ID'>PDF</InputLabel>
                            <Select label='PDF' labelId='PDF_ID' style={{ marginRight: 'auto' }} value={chosenSticker} onChange={(e) => setChosenSticker(e.target.value)}>
                                {
                                    pdfSettings.map((pdf: PDFData) => (
                                        <MenuItem value={pdf._id} key={pdf._id}>{pdf.PDFName}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        :
                        null
                }
            </DialogContent>
            <DialogActions>
                <Button variant='contained' autoFocus startIcon={<PrintIcon />} onClick={() => print()}>
                    Tulosta
                </Button>
            </DialogActions>
        </Dialog >
    )
}

export default OrderPrinter;