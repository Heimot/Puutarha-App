import React, { useEffect, useState } from 'react'
import { TextField, Select, MenuItem, InputLabel, FormControl, Box, FormControlLabel, Switch, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { PDFData, PDFText, PDFImage, Fonts, GetFonts, TableCells, PDFTable, TableHeaders, PDFHeader } from '../../../Model'
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table';
import FetchData from '../../Components/Fetch';
import SettingsPDFTextCell from './SettingsPDFTextCell';
import SettingsPDFImageCell from './SettingsPDFImageCell';
import Message from '../../Components/Message';
import SettingsPDFTableHeader from './SettingsPDFTableHeader';
import SettingsPDFTableCell from './SettingsPDFTableCell';
import SettingsPDFTableData from './SettingsPDFTableData';

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
        console.log(pdfData)
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

    const updateHeaderTextData = (_id: string, text: string, font: string, fontType: string, fontSize: number, xPosition: number, yPosition: number) => {
        let data = pdfData?.header?.PDFText?.map((data) =>
            data._id === _id ? { ...data, text, font, fontType, fontSize, xPosition, yPosition } : data
        )
        setPdfData({ ...pdfData, header: { ...pdfData?.header, PDFText: data } });
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

    const removeHeaderTextData = async (_id: string) => {
        let data = pdfData?.header?.PDFText.filter((data) => {
            return data._id !== _id;
        });
        setPdfData({ ...pdfData, header: { ...pdfData?.header, PDFText: data } });

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFId: pdfData?._id,
            _id: _id
        }
        await FetchData({ urlHost: url, urlPath: '/pdftext/delete_pdf_header_text', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
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

    const addHeaderTextData = () => {
        if (!pdfData) return;
        setPdfData({ ...pdfData, header: { ...pdfData?.header, PDFText: [...pdfData?.header?.PDFText, { _id: Date.now(), text: "", font: "helvetica", fontType: "normal", fontSize: 10, xPosition: 0, yPosition: 0 }] } })
    }

    const addImageData = () => {
        if (!pdfData) return;
        setPdfData({ ...pdfData, PDFImage: [...pdfData?.PDFImage, { _id: Date.now(), imageURL: "", height: 10, width: 10, xPosition: 0, yPosition: 0 }] })
    }

    const addTableHeaderData = (text: string) => {
        if (!pdfData) return;
        setPdfData({ ...pdfData, table: { ...pdfData?.table, headers: [...pdfData?.table?.headers, { _id: Date.now().toString(), text: text }] } });
    }

    const deleteTableHeader = async (_id: string) => {
        let data = pdfData?.table?.headers?.filter((data) => {
            return data._id !== _id;
        });
        setPdfData({ ...pdfData, table: { ...pdfData?.table, headers: data } });

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFId: pdfData?.table?._id,
            _id: _id
        }
        await FetchData({ urlHost: url, urlPath: '/pdftableheader/delete_pdf_table_header', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
    }

    const updateTableHeader = (_id: string, value: string) => {
        let updatedData = pdfData?.table?.headers?.map((header) => {
            return header._id === _id
                ?
                { ...header, text: value }
                :
                header;
        })
        setPdfData((currentState: PDFData) => ({ ...currentState, table: { ...currentState?.table, headers: updatedData } }))
    }

    const addTableCellData = (text: string) => {
        if (!pdfData) return;
        setPdfData({ ...pdfData, table: { ...pdfData?.table, cells: [...pdfData?.table?.cells, { _id: Date.now().toString(), text: text }] } });
    }

    const deleteTableCell = async (_id: string) => {
        let data = pdfData?.table?.cells?.filter((data) => {
            return data._id !== _id;
        });
        setPdfData({ ...pdfData, table: { ...pdfData?.table, cells: data } });

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFId: pdfData?.table?._id,
            _id: _id
        }
        await FetchData({ urlHost: url, urlPath: '/pdftablecell/delete_pdf_table_cell', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
    }

    const updateTableCell = (_id: string, value: string) => {
        let updatedData = pdfData?.table?.cells?.map((cell) => {
            return cell._id === _id
                ?
                { ...cell, text: value }
                :
                cell;
        })
        setPdfData((currentState: PDFData) => ({ ...currentState, table: { ...currentState?.table, cells: updatedData } }))
    }

    const createTable = async (yPosition: number) => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFId: pdfData?._id,
            yPosition: yPosition
        }
        const newTable = await FetchData({ urlHost: url, urlPath: '/pdftable/add_table_to_pdf', urlMethod: 'POST', urlHeaders: 'Auth', urlBody: body });
        if (!newTable?.result) return;
        setPdfData((currentState: PDFData) => ({ ...currentState, table: newTable?.result }));
    }

    const deleteTable = async (_id: string) => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            PDFId: pdfData?._id,
            _id: _id
        }
        await FetchData({ urlHost: url, urlPath: '/pdftable/delete_pdf_table', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
        setPdfData((currentState: PDFData) => ({ ...currentState, table: null }))
    }

    const savePDF = async () => {
        if (pdfData === null) return;
        /*
            This will turn the array of objects to a object which we will be able to patch in a fetch request.
            Since there are arrays inside of the pdfData we need to also .map the pdfDatas arrays and do the same things for it as well. 
        */
        let patchableData = Object.keys(pdfData).reduce((acc: Acc[], curr) => {
            if (curr !== "createdAt" && curr !== "updatedAt" && curr !== "data") {
                const keyValue: keyof PDFData = curr;
                if (curr === "PDFText" || curr === "PDFImage") {
                    let pdfTextData: PDFPropData[] = [];
                    let pdfImageData: PDFPropData[] = [];
                    pdfData[keyValue].map((item: PDFText | PDFImage) => {
                        let data = Object.keys(item).reduce((accT: Acc[], curr) => {
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

                } else if (curr === "table") {
                    if (pdfData?.table) {
                        let data = Object.keys(pdfData?.table).reduce((accT: Acc[], curr) => {
                            if (curr === 'headers' || curr === 'cells') {
                                const keyValue: keyof PDFTable = curr;
                                let pdfHeaderdata: PDFPropData[] = [];
                                let pdfCellData: PDFPropData[] = [];
                                pdfData?.table[keyValue]?.map((item: TableHeaders | TableCells) => {
                                    let data = Object.keys(item).reduce((accT: Acc[], curr) => {
                                        if (curr !== "createdAt" && curr !== "updatedAt" && curr !== "_id") {
                                            const keyValue: keyof TableHeaders | TableCells = curr;
                                            accT.push({ "propName": keyValue, "value": item[keyValue] });
                                        }
                                        return accT;
                                    }, [])
                                    if (keyValue === "headers") {
                                        pdfHeaderdata.push({ "_id": item._id, "data": data })
                                    } else if (keyValue === "cells") {
                                        pdfCellData.push({ "_id": item._id, "data": data })
                                    }
                                })
                                if (keyValue === "headers") {
                                    accT.push({ "propName": keyValue, "value": pdfHeaderdata });
                                } else if (keyValue === "cells") {
                                    accT.push({ "propName": keyValue, "value": pdfCellData });
                                }
                            }
                            return accT;
                        }, [])
                        acc.push({ "propName": "PDFTable", "value": { "_id": pdfData?.table?._id, "xPosition": pdfData?.table?.xPosition, "yPosition": pdfData?.table?.yPosition, "data": data } });
                    }
                } else if (curr === "header") {
                    if (pdfData?.header) {
                        let data = Object.keys(pdfData?.header).reduce((accT: Acc[], curr) => {
                            if (curr === 'PDFText' || curr === 'PDFImage') {
                                const keyValue: keyof PDFHeader = curr;
                                let pdfTextData: PDFPropData[] = [];
                                let pdfImageData: PDFPropData[] = [];
                                pdfData?.header[keyValue]?.map((item: PDFImage | PDFText) => {
                                    let data = Object.keys(item).reduce((accT: Acc[], curr) => {
                                        if (curr !== "createdAt" && curr !== "updatedAt" && curr !== "_id") {
                                            const keyValue: keyof PDFImage | PDFText = curr;
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
                                if (keyValue === "PDFText") {
                                    accT.push({ "propName": keyValue, "value": pdfTextData });
                                } else if (keyValue === "PDFImage") {
                                    accT.push({ "propName": keyValue, "value": pdfImageData });
                                }
                            }
                            return accT;
                        }, [])
                        acc.push({ "propName": "PDFHeader", "value": { "_id": pdfData?.header?._id, "data": data } });
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
                            {pdfData?.PDFText?.map((text: any) => {
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
                            {pdfData?.PDFImage?.map((image: any) => {
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
                <Box>
                    <Typography variant='h6'>Ylätunniste</Typography>
                    {pdfData?.header
                        &&
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
                                    {pdfData?.header?.PDFText?.map((text: any) => {
                                        return (
                                            <SettingsPDFTextCell key={text._id} text={text} fonts={fonts} getFonts={getFonts} removeTextData={(_id: string) => removeHeaderTextData(_id)}
                                                updateTextData={(_id: string, text: string, font: string, fontType: string, fontSize: number, xPosition: number, yPosition: number) => updateHeaderTextData(_id, text, font, fontType, fontSize, xPosition, yPosition)} />
                                        )
                                    })}
                                </Tbody>
                            </Table>
                            <TableFooter>
                                <Button onClick={() => addHeaderTextData()}>Lisää tekstiä</Button>
                            </TableFooter>
                        </Box>
                    }
                </Box>
                <SettingsPDFTableData data={pdfData?.table}
                    createTable={(yPosition: number) => createTable(yPosition)}
                    deleteTable={(_id: string) => deleteTable(_id)}
                    updateTable={(value: number) => setPdfData((currentState: PDFData) => ({ ...currentState, table: { ...currentState?.table, yPosition: Number(value) } }))}
                />
                {pdfData?.table
                    &&
                    <Box>
                        <SettingsPDFTableHeader data={pdfData?.table}
                            addTableHeader={(text: string) => addTableHeaderData(text)}
                            deleteTableHeader={(_id: string) => deleteTableHeader(_id)}
                            updateTableHeader={(_id: string, value: string) => updateTableHeader(_id, value)}
                        />
                        <SettingsPDFTableCell data={pdfData?.table}
                            addTableCell={(text: string) => addTableCellData(text)}
                            deleteTableCell={(_id: string) => deleteTableCell(_id)}
                            updateTableCell={(_id: string, value: string) => updateTableCell(_id, value)}
                        />
                    </Box>
                }
            </Grid>
            <Button variant='contained' onClick={() => savePDF()}>Save PDF</Button>
            {
                messageOpen
                &&
                <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle={'PDF'}>
                    PDF on päivitetty onnistuneesti.
                </Message>
            }
        </Grid >
    )
}

export default SettingsPDFEditor;