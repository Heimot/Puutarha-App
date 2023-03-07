import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';

import { PDFImage, PDFText, ImageData, Order, TruckData, pdfs } from '../../Model';
import dayjs from 'dayjs';
import FetchData from '../Components/Fetch';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    orderPrint: Order[] | null;
    setOrderPrint: (value: any) => void;
    truckData: TruckData | null;
}

const CalendarPrinter: React.FC<Props> = ({ isOpen, setIsOpen, orderPrint, setOrderPrint, truckData }) => {
    const [order, setOrder] = useState<Order[] | null>(null);
    const [chosenSticker, setChosenSticker] = useState<string>('');
    const [pdfs, setPdfs] = useState<pdfs[]>([]);

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
        setOrder(orderPrint);
    }, [orderPrint])

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
        let page = 1;
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let pdfData = await FetchData({ urlHost: url, urlPath: '/pdf/get_pdf_by_id', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentPDFId=${chosenSticker}` });
        if (pdfData === null) return;
        pdfData = pdfData?.result;
        doc = new jsPDF(pdfData?.pageLayout, 'mm', [pdfData?.height, pdfData?.width]);
        let imageRef: ImageData[] = [];
        let images = [];

        if (pdfData?.PDFImage?.length > 0) {
            images.push(...pdfData?.PDFImage);
        }

        if (pdfData?.header?.PDFImage?.length > 0) {
            images.push(...pdfData?.header?.PDFImage)
        }
        const cInfo = await FetchData({ urlHost: url, urlPath: '/calendar/get_calendar_info', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&truck=${truckData?.truck?._id}&date=${dayjs(truckData?.deliverydate)}` });

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

                    order?.map((order) => {
                        let dCell = [];
                        for (let i = 0; i < defaultCell.length; i++) {
                            switch (defaultCell[i]) {
                                case '[[STORE]]':
                                    dCell.push(order.store.name);
                                    break;
                                case '[[PICKINGDATE]]':
                                    dCell.push(dayjs(order?.pickingdate).format('DD/MM/YYYY').toString());
                                    break;
                                case '[[DELIVERYDATE]]':
                                    dCell.push(dayjs(order?.deliverydate).format('DD/MM/YYYY').toString());
                                    break;
                                case '[[INFORMATION]]':
                                    dCell.push(order.information);
                                    break;
                                case '[[ORDERCODE]]':
                                    dCell.push(order.ordercode);
                                    break;
                                case '[[TRUCK]]':
                                    dCell.push(order.truck.truckLicensePlate);
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
                                case '[[PAGE]]':
                                    doc.text(page.toString(), text.xPosition, text.yPosition);
                                    break;
                                case '[[TODAY]]':
                                    doc.text(dayjs().format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                                    break;
                                case '[[LICENSEPLATE]]':
                                    if (!truckData?.truck?.truckLicensePlate) return;
                                    doc.text(truckData?.truck?.truckLicensePlate, text.xPosition, text.yPosition);
                                    break;
                                case '[[INFORMATION]]':
                                    if (!cInfo?.result?.info) return;
                                    doc.text(cInfo?.result?.info, text.xPosition, text.yPosition);
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

                pdfData?.PDFText?.map((text: PDFText) => {
                    doc.setFont(text.font, text.fontType);
                    doc.setFontSize(text.fontSize);
                    switch (text.text) {
                        case '[[TODAY]]':
                            doc.text(dayjs().format('DD/MM/YYYY').toString(), text.xPosition, text.yPosition);
                            break;
                        default:
                            doc.text(text.text, text.xPosition, text.yPosition);
                            break;
                    }
                })

                pdfData?.PDFImage?.map((image: any) => {
                    if (image.imageURL === "") return;
                    let docImage = imageRef.filter((img) => {
                        return img.imageID === image.imageURL;
                    })[0];
                    if (!docImage?.image) return;
                    doc.addImage(docImage.image, "", Number(image.xPosition), Number(image.yPosition), Number(image.width), Number(image.height));
                })

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
                                    pdfs.map((pdf: pdfs) => (
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

export default CalendarPrinter;