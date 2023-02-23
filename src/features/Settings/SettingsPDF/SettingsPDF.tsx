import React, { useState, useEffect, useRef } from 'react'
import { Button, Typography, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import jsPDF from 'jspdf';
import { ImageData, PDFData, PDFImage } from '../../../Model';
import FetchData from '../../Components/Fetch';
import SettingsPDFEditor from './SettingsPDFEditor';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

interface pdfs {
    _id: string;
    PDFName: string;
}

let doc = new jsPDF();

const SettingsPDF = () => {
    const [pdfData, setPdfData] = useState<PDFData | null>(null);
    const [pdfs, setPdfs] = useState<pdfs[]>([]);
    const [chosenPDF, setChosenPDF] = useState<string>("")

    const pdfRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const getNames = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const pdfNames = await FetchData({ urlHost: url, urlPath: '/pdf/get_pdf_names', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setPdfs(pdfNames.result);
        }

        getNames();
        return () => {
            setPdfs([]);
        }
    }, [])

    useEffect(() => {
        try {
            if (pdfData === null) return;
            let layoutMode = pdfData?.pageLayout as 'p' | 'portrait' | 'l' | 'landscape' | undefined;
            doc = new jsPDF(layoutMode, 'mm', [pdfData?.height, pdfData?.width]);
            let imageRef: ImageData[] = [];

            let baseImagePromises = pdfData?.PDFImage.map((image: PDFImage) => new Promise((resolve, reject) => {
                if (imageRef.length > 0) {
                    let exists = imageRef?.filter((item: ImageData) => {
                        return item.imageID === image.imageURL;
                    });
                    if (exists.length <= 0) {
                        imageToBase64(`${process.env.REACT_APP_API_URL}/files/get_image_by_id?id=${image.imageURL}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`, (base64image: string) => {
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
                    imageToBase64(`${process.env.REACT_APP_API_URL}/files/get_image_by_id?id=${image.imageURL}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`, (base64image: string) => {
                        if (base64image) {
                            resolve({ _id: image._id, image: base64image, imageID: image.imageURL });
                        } else {
                            // It will return empty base64image here if image doesnt exist or fails to fetch for some reason
                            // Otherwise it wont show the text data
                            resolve({ _id: image._id, image: base64image, imageID: image.imageURL })
                        }
                    });
                }
            }))
            Promise.all(baseImagePromises)
                .then((data: any) => {
                    imageRef.push(...data);
                })
                .then(async () => {
                    pdfData?.PDFText.map((text: any) => {
                        doc.setFont(text.font, text.fontType);
                        doc.setFontSize(text.fontSize);
                        doc.text(text.text, text.xPosition, text.yPosition);
                    })

                    if (pdfData === null) return;
                    pdfData?.PDFImage.map((image: any) => {
                        if (image.imageURL === "") return;
                        let docImage = imageRef.filter((img) => {
                            return img.imageID === image.imageURL;
                        })[0];
                        if (!docImage?.image) return;
                        doc.addImage(docImage.image, "", Number(image.xPosition), Number(image.yPosition), Number(image.width), Number(image.height));
                    })
                    let url = doc.output('bloburl') + "#toolbar=0&navpanes=0";
                    pdfRef.current?.setAttribute('src', url.toString());
                })
        } catch (err) {
            console.log(err);
        }
    }, [pdfData])

    const imageToBase64 = (imgUrl: string, callback: Function) => {
        var img = new Image();

        // onload fires when the image is fully loadded, and has width and height
        img.onload = () => {
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

    const getPDF = async (id: string) => {
        if (id === '') {
            setPdfData(null);
            setChosenPDF('');
        } else {
            setChosenPDF(id);
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const pdfValues = await FetchData({ urlHost: url, urlPath: '/pdf/get_pdf_by_id', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&currentPDFId=${id}` });
            setPdfData(pdfValues.result);
        }
    }

    const printPDF = () => {
        doc.save();
    }

    const createNewPDF = async () => {
        let date = Date.now();
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFName: 'pdf' + date
        }
        const pdfValues = await FetchData({ urlHost: url, urlPath: '/pdf/create_pdf', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        setPdfs((prevState: pdfs[] | any) => [...prevState, { _id: pdfValues.result._id, PDFName: pdfValues.result.PDFName }]);
        getPDF(pdfValues.result._id);
    }

    const deletePDF = async () => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            _id: chosenPDF
        }
        await FetchData({ urlHost: url, urlPath: '/pdf/delete_pdf', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
        let data = pdfs?.filter((pdf: any) => {
            return pdf._id !== chosenPDF
        })
        setChosenPDF('');
        setPdfs(data);
        setPdfData(null);
    }

    return (
        <Box sx={{ padding: '10px', width: '100%' }}>
            <Item sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>

                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', maxWidth: '500px' }}>
                    <Typography variant='h4'>Valitse PDF</Typography>
                    <FormControl fullWidth sx={{ margin: '5px 0 5px 0' }}>
                        <InputLabel id='PDF_ID'>PDF</InputLabel>
                        <Select label='PDF' labelId='PDF_ID' value={chosenPDF} onChange={((e) => getPDF(e.target.value as string))}>
                            <MenuItem value={''}>Ei valittu</MenuItem>
                            {pdfs?.map((pdfName) => (
                                <MenuItem key={pdfName._id} value={pdfName._id}>{pdfName.PDFName}</MenuItem>
                            ))}
                        </Select>
                    </ FormControl>
                    <Button onClick={() => createNewPDF()}>Luo uusi PDF</Button>
                    <Button onClick={() => deletePDF()}>Poista PDF</Button>
                </Box>
                <Box>
                    <iframe style={{ "width": (pdfData !== null ? pdfData?.width * 3.7795275591 : 0), "height": (pdfData !== null ? pdfData?.height * 3.7795275591 : 0), "backgroundColor": 'white', border: "black 5px solid", transform: "scale(1)" }} ref={pdfRef} />
                </Box>
                <Box>
                    <SettingsPDFEditor pdfData={pdfData} setPdfData={(value: PDFData) => setPdfData(value)} getFonts={doc.getFontList()} />
                    <Button onClick={printPDF}>Tulosta PDF</Button>
                </Box>

            </Item>
        </Box>
    )
}

export default SettingsPDF;