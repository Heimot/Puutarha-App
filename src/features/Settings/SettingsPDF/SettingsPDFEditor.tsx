import React, { useEffect, useState } from 'react'
import { TextField, Select, MenuItem, InputLabel, FormControl, Box, FormControlLabel, Switch, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { PDFData, PDFText, PDFImage, Fonts, GetFonts } from '../../../Model'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table';
import FetchData from '../../Components/Fetch';
import SettingsPDFTextCell from './SettingsPDFTextCell';
import SettingsPDFImageCell from './SettingsPDFImageCell';
import Message from '../../Components/Message';

interface Props {
    pdfData: PDFData | null;
    setPdfData: (value: PDFData | any) => void;
    getFonts: GetFonts;
}

interface Acc {
    propName: string;
    value: any;
}

interface PDFPropData {
    _id: string;
    data: Acc[];
}

const TableFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    color: theme.palette.mode === 'dark' ? 'white' : 'black',
    borderBottom: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
    borderRight: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
    borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
    borderRadius: '0px 0px 5px 5px',
    marginBottom: '20px'
}));

const SettingsPDFEditor: React.FC<Props> = ({ pdfData, setPdfData, getFonts }) => {
    const [pdfName, setPDFName] = useState<string>('');
    const [pdfWidth, setPDFWidth] = useState<number>(0);
    const [pdfHeight, setPDFHeight] = useState<number>(0);
    const [pdfLayout, setPDFLayout] = useState<'Landscape' | 'Portrait'>('Landscape');
    const [stickerDefault, setStickerDefault] = useState<boolean>(false);
    const [pdfDefault, setPDFDefault] = useState<boolean>(false);
    const [fonts, setFonts] = useState<Fonts[]>([]);
    const [messageOpen, setMessageOpen] = useState<boolean>(false);

    const theme = useTheme();

    useEffect(() => {
        if (!getFonts) return;
        const getFontData = async () => {
            let data = [];
            data = await Object.keys(getFonts).reduce((acc: Fonts[], curr) => {
                acc.push({ name: curr, fontTypes: getFonts[curr] })
                return acc;
            }, [])
            setFonts(data);
        }
        getFontData();
    }, [])

    useEffect(() => {
        if (pdfData === null) return;
        setPDFName(pdfData?.PDFName);
        setPDFWidth(pdfData?.width);
        setPDFHeight(pdfData?.height)
        setPDFLayout(pdfData?.pageLayout);
        setStickerDefault(pdfData?.stickerDefault);
        setPDFDefault(pdfData?.orderDefault);
    }, [pdfData])

    const updatePDFData = (value: string | number | boolean, name: string) => {
        setPdfData((prevState: PDFData[]) => ({ ...prevState, [name]: value }))
    }

    const updateTextData = (_id: string, text: string, font: string, fontType: string, fontSize: number, xPosition: number, yPosition: number) => {
        let data = pdfData?.PDFText?.map((data) =>
            data._id === _id ? { ...data, text, font, fontType, fontSize, xPosition, yPosition } : data
        )
        setPdfData({ ...pdfData, PDFText: data });
    }

    const updateImageData = (_id: string, imageURL: string, height: number, width: number, xPosition: number, yPosition: number) => {
        let data = pdfData?.PDFImage?.map((data) =>
            data._id === _id ? { ...data, imageURL, height, width, xPosition, yPosition } : data
        )
        setPdfData({ ...pdfData, PDFImage: data });
    }

    const removeTextData = async (_id: string) => {
        let data = pdfData?.PDFText.filter((data) => {
            return data._id !== _id;
        });
        setPdfData({ ...pdfData, PDFText: data });

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFId: pdfData?._id,
            _id: _id
        }
        await FetchData({ urlHost: url, urlPath: '/pdftext/delete_pdf_text', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
    }

    const removeImageData = async (_id: string) => {
        let data = pdfData?.PDFImage.filter((data) => {
            return data._id !== _id;
        });
        setPdfData({ ...pdfData, PDFImage: data });

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFId: pdfData?._id,
            _id: _id
        }
        await FetchData({ urlHost: url, urlPath: '/pdfimage/delete_pdf_image', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
    }

    const addTextData = () => {
        if (!pdfData) return;
        setPdfData({ ...pdfData, PDFText: [...pdfData?.PDFText, { _id: Date.now(), text: "", font: "helvetica", fontType: "normal", fontSize: 10, xPosition: 0, yPosition: 0 }] })
    }

    const addImageData = () => {
        if (!pdfData) return;
        setPdfData({ ...pdfData, PDFImage: [...pdfData?.PDFImage, { _id: Date.now(), imageURL: "", height: 10, width: 10, xPosition: 0, yPosition: 0 }] })
    }

    const savePDF = async () => {
        if (pdfData === null) return;
        /*
            This will turn the array of objects to a object which we will be able to patch in a fetch request.
            Since there are arrays inside of the pdfData we need to also .map the pdfDatas arrays and do the same things for it as well. 
        */
        let patchableData = await Object.keys(pdfData).reduce((acc: Acc[], curr) => {
            if (curr !== "createdAt" && curr !== "updatedAt" && curr !== "data") {
                const keyValue: keyof PDFData = curr;
                if (curr === "PDFText" || curr === "PDFImage") {
                    let pdfTextData: PDFPropData[] = [];
                    let pdfImageData: PDFPropData[] = [];
                    pdfData[keyValue].map(async (item: PDFText | PDFImage) => {
                        let data = await Object.keys(item).reduce((accT: Acc[], curr) => {
                            if (curr !== "createdAt" && curr !== "updatedAt" && curr !== "_id") {
                                const keyValue: keyof PDFText | PDFImage = curr;
                                accT.push({ "propName": keyValue, "value": item[keyValue] });
                            }
                            return accT;
                        }, [])
                        if (keyValue === "PDFText") {
                            pdfTextData.push({ "_id": item._id, "data": data })
                        } else if (keyValue === "PDFImage") {
                            pdfImageData.push({ "_id": item._id, "data": data })
                        }
                    })
                    if (curr === "PDFText") {
                        acc.push({ "propName": "PDFText", "value": pdfTextData });
                    } else if (curr === "PDFImage") {
                        acc.push({ "propName": "PDFImage", "value": pdfImageData });
                    }

                } else {
                    acc.push({ "propName": keyValue, "value": pdfData[keyValue] });
                }
            }
            return acc;
        }, []);

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        const data = await FetchData({ urlHost: url, urlPath: '/pdf/edit_pdf', urlMethod: 'PATCH', urlHeaders: 'Auth', urlBody: patchableData, urlQuery: `?currentUserId=${userId}&currentPDFId=${pdfData._id}` });
        setPdfData(data.reslt);
        setMessageOpen(true);
    }

    return (
        <Grid container>
            <Grid xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextField sx={{ marginTop: '10px' }} label='PDF Nimi' name="PDFName" value={pdfName} onChange={(e) => { setPDFName(e.target.value); updatePDFData(e.target.value, e.target.name) }}></TextField>
                <TextField sx={{ marginTop: '10px' }} label='Leveys' type="number" name="width" value={pdfWidth} onChange={(e) => { setPDFWidth(Number(e.target.value)); updatePDFData(Number(e.target.value), e.target.name); }}></TextField>
                <TextField sx={{ marginTop: '10px' }} label='Korkeus' type="number" name="height" value={pdfHeight} onChange={(e) => { setPDFHeight(Number(e.target.value)); updatePDFData(Number(e.target.value), e.target.name) }}></TextField>
                <FormControl sx={{ marginTop: '10px' }}>
                    <InputLabel id='LAYOUT_ID'>Suunta</InputLabel>
                    <Select labelId='LAYOUT_ID' label='Suunta' value={pdfLayout} name="pageLayout" onChange={(e) => { setPDFLayout(e.target.value as 'Landscape' | 'Portrait'); updatePDFData(e.target.value, e.target.name) }}>
                        <MenuItem value='Landscape'>Landscape</MenuItem>
                        <MenuItem value='Portrait'>Portrait</MenuItem>
                    </Select>
                </FormControl>
                <FormControlLabel
                    sx={{ display: 'flex', justifyContent: 'center' }}
                    control={
                        <Switch
                            name='stickerDefault'
                            value={stickerDefault}
                            checked={stickerDefault}
                            onChange={(e) => { setStickerDefault(e.target.checked); updatePDFData(e.target.checked, e.target.name); }}
                        />
                    }
                    label={'Alkuperäinen tarra'}
                />
                <FormControlLabel
                    sx={{ display: 'flex', justifyContent: 'center' }}
                    control={
                        <Switch
                            name='orderDefault'
                            value={pdfDefault}
                            checked={pdfDefault}
                            onChange={(e) => { setPDFDefault(e.target.checked); updatePDFData(e.target.checked, e.target.name); }}
                        />
                    }
                    label={'Alkuperäinen tilaus pdf'}
                />
            </Grid>
            <Grid xs={12}>
                <Box>
                    <Table style={{
                        color: theme.palette.mode === 'dark' ? 'white' : 'black',
                        border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
                        borderRadius: '5px 5px 0px 0px'
                    }}>
                        <Thead>
                            <Tr>
                                <Th>Teksti</Th>
                                <Th>Fontti</Th>
                                <Th>Fontin koko</Th>
                                <Th>Fontin tyyppi</Th>
                                <Th>X-Kohta</Th>
                                <Th>Y-Kohta</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {pdfData?.PDFText.map((text: any) => {
                                return (
                                    <SettingsPDFTextCell key={text._id} text={text} fonts={fonts} getFonts={getFonts} removeTextData={(_id: string) => removeTextData(_id)}
                                        updateTextData={(_id: string, text: string, font: string, fontType: string, fontSize: number, xPosition: number, yPosition: number) => updateTextData(_id, text, font, fontType, fontSize, xPosition, yPosition)} />
                                )
                            })}
                        </Tbody>
                    </Table>
                    <TableFooter>
                        <Button onClick={() => addTextData()}>Lisää tekstiä</Button>
                    </TableFooter>

                </Box>
                <Box>
                    <Table style={{
                        color: theme.palette.mode === 'dark' ? 'white' : 'black',
                        border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
                        borderRadius: '5px 5px 0px 0px'
                    }}>
                        <Thead>
                            <Tr>
                                <Th>Kuva</Th>
                                <Th>Korkeus</Th>
                                <Th>Leveys</Th>
                                <Th>X-Kohta</Th>
                                <Th>Y-Kohta</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {pdfData?.PDFImage.map((image: any) => {
                                return (
                                    <SettingsPDFImageCell key={image._id} image={image} removeImageData={(_id: string) => removeImageData(_id)}
                                        updateImageData={(_id: string, imageURL: string, height: number, width: number, xPosition: number, yPosition: number) => updateImageData(_id, imageURL, height, width, xPosition, yPosition)} />
                                )
                            })}
                        </Tbody>
                    </Table>
                    <TableFooter>
                        <Button onClick={() => addImageData()}>Add new image</Button>
                    </TableFooter>
                </Box>
            </Grid>
            <Button variant='contained' onClick={() => savePDF()}>Save PDF</Button>
            {
                messageOpen
                &&
                <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle={'PDF'}>
                    PDF on päivitetty onnistuneesti.
                </Message>
            }
        </Grid>
    )
}

export default SettingsPDFEditor;