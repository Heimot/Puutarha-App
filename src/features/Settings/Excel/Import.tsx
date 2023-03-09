import React, { useState } from 'react'
import { Button, Box, Table, TableBody, TableCell, TableContainer, TableRow, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { read, utils } from 'xlsx';

import UploadIcon from '@mui/icons-material/Upload';

import ExcelAuto from './ExcelAuto';
import { useSelector } from 'react-redux';
import { State } from '../../../app/redux/store';
import { Location, Message as ModelMessage } from '../../../Model';
import dayjs from 'dayjs';
import FetchData from '../../Components/Fetch';
import MenuDialog from '../../Components/MenuDialog';
import Message from '../../Components/Message';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black'
}));

const Import = () => {
  const [orders, setOrders] = useState<any>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<ModelMessage>({ title: '', message: '' });
  const [messageOpen, setMessageOpen] = useState<boolean>(false);

  const { locationSettings } = useSelector((state: State) => state.data);

  const handleFileChange = async (e: React.FormEvent) => {
    try {
      const target = e?.target as HTMLInputElement;
      const file: File = (target.files as FileList)[0];
      if (!file) return;
      const FR = new FileReader();
      FR.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const result: any[] = utils.sheet_to_json(firstSheet, { header: 1, defval: null, blankrows: true });
        setOrders(result);
      };
      FR.readAsArrayBuffer(file);
    } catch (error) {
      console.log(error);
    };
  }

  const updateData = (value: string, rowVal: number, index: number) => {
    setOrders((prevState: any) => {
      const arr = prevState;
      arr[rowVal][index] = value;
      return arr;
    })
  }

  const createOrdersFromExcel = async () => {
    if (!orders) return;
    const ordersToCreate = [];
    for (let i = 3; i < orders[0].length; i++) {
      let orderData = null;
      let productData: any[] = []
      for (let x = 5; x < orders.length; x++) {
        if (x > 1) {
          if (orders[x][i] || orders[x][i] > 0) {
            let information = orders[x][2];
            if (!information) information = '';
            productData.push({ flower: orders[x][0], amount: orders[x][i], location: orders[x][1], information: information })
          }
        }
      }
      let picking = orders[4][i].split('/');
      let pickingdate = `${picking[1]}/${picking[0]}/${picking[2]}`;
      let delivery = orders[3][i].split('/');
      let deliverydate = `${delivery[1]}/${delivery[0]}/${delivery[2]}`;
      let information = orders[2][i];
      if (!information) information = '';
      let ordercode = orders[1][i];
      if (!ordercode) ordercode = '';
      orderData = { store: orders[0][i], ordercode: ordercode, information: information, deliverydate: dayjs(deliverydate).format('YYYY-MM-DD').toString(), pickingdate: dayjs(pickingdate).format('YYYY-MM-DD').toString(), products: productData };
      if (orderData) {
        ordersToCreate.push(orderData);
      }
    }
    if (ordersToCreate.length <= 0) return;
    let userId = localStorage.getItem('userId');
    let url = process.env.REACT_APP_API_URL;
    const data = await FetchData({ urlHost: url, urlPath: '/orders/excel_import', urlQuery: `?currentUserId=${userId}`, urlMethod: 'POST', urlHeaders: 'Auth', urlBody: ordersToCreate });
    if (data?.success) {
      setMessage({ title: 'Excel', message: 'Excel on tuotu onnistuneesti!' });
      setMessageOpen(true);
      setOrders([]);
    } else {
      setMessage({ title: 'Excel error', message: 'Excel vienti ei toiminut. Onko tiedosto varmasti oikeassa muodossa?' });
      setMessageOpen(true);
    }
  }

  const restCells = () => {
    const cells = [];
    for (let i = 3; i < orders[0].length; i++) {
      cells.push(<TableCell key={i}></TableCell>)
    }
    return cells;
  }

  return (
    <Grid container sx={{ padding: '10px', width: '100%' }}>
      <Grid xs={12}>
        <Item>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button component='label' startIcon={<UploadIcon />}>
              Lisää uusi excel tiedosto
              <input
                accept="*"
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <Button onClick={() => setIsOpen(true)}>Vie tiedosto</Button>
          </Box>
          <Box>
            {
              orders.length > 0
              &&
              <TableContainer>
                <Table aria-label='table' style={{ width: "auto", tableLayout: "auto" }}>
                  <TableBody>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>KUKKA</TableCell>
                      <TableCell>KERÄYSPAIKKA</TableCell>
                      <TableCell>LISÄTIETOA</TableCell>
                      {restCells()}
                    </TableRow>
                    {
                      orders?.map((order: any, index: number) => {
                        const rowVal = index;
                        return (
                          <TableRow key={index} hover role='checkbox'>
                            {
                              index === 0
                                ?
                                <TableCell>KAUPPA</TableCell>
                                :
                                index === 1
                                  ?
                                  <TableCell>TILAUSNUMERO</TableCell>
                                  :
                                  index === 2
                                    ?
                                    <TableCell>LISÄTIETOA</TableCell>
                                    :
                                    index === 3
                                      ?
                                      <TableCell>TOIMITUSPÄIVÄ</TableCell>
                                      :
                                      index === 4
                                        ?
                                        <TableCell>KERÄYSPÄIVÄ</TableCell>
                                        :
                                        <TableCell></TableCell>
                            }
                            {
                              order?.map((item: any, index: number) => (
                                <TableCell key={index} sx={{ textAlign: rowVal > 4 && index > 1 ? 'center' : 'left' }}>
                                  {
                                    rowVal > 4 && index < 1
                                      ?
                                      <ExcelAuto item={item} type={'Flowers'} onValueChange={(value) => updateData(value, rowVal, index)} />
                                      :
                                      rowVal > 4 && index === 1
                                        ?
                                        <FormControl sx={{ width: '200px' }}>
                                          <InputLabel id='location-label'>{item}</InputLabel>
                                          <Select defaultValue={''} labelId='location-label' label={item} sx={{ width: '100%' }} onChange={(e) => updateData(e.target.value as string, rowVal, index)} >
                                            {locationSettings?.map((location: Location) => (
                                              <MenuItem key={location._id} value={location?._id}>{location?.location}</MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>
                                        :
                                        rowVal === 0 && index > 2
                                          ?
                                          <ExcelAuto item={item} type={'Stores'} onValueChange={(value) => updateData(value, rowVal, index)} />
                                          :
                                          item
                                  }
                                </TableCell>
                              ))
                            }
                          </TableRow>
                        )
                      })
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            }
          </Box>
        </Item>
      </Grid>
      <MenuDialog isOpen={isOpen} setIsOpen={(value: boolean) => setIsOpen(value)} result={() => createOrdersFromExcel()} dialogTitle={'VAROITUS!'} actions={true}>
        JOS ET OLE VALINNUT KAIKKIA KAUPPOJA, KUKKIA JA SIJAINTEJA. OSA TIEDOISTA EI TULE SOVELLUKSEEN, VARMISTA ETTÄ KAIKKI ON VARMASTI OK! HUOMIOI MYÖS ETTÄ TIEDOSTO ON OIKEASSA MUODOSSA JA ETTÄ
        PÄIVÄMÄÄRÄ ON MUODOSSA (PÄIVÄ/KUUKAUSI/VUOSI) ESIM. 20/01/2023!
      </MenuDialog>
      {
        messageOpen
        &&
        <Message setIsOpen={(value) => setMessageOpen(value)} isOpen={messageOpen} dialogTitle={message.title}>
          {message.message}
        </Message>
      }
    </Grid>
  )
}

export default Import;