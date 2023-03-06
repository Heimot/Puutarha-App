import React, { useState, useEffect } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme, alpha } from "@mui/material/styles";
import Paper from '@mui/material/Paper';
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import FetchData from '../Components/Fetch';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import { Order, Truck, TruckData } from '../../Model';

import CalendarDialog from './CalendarDialog';
import CalendarTruckDialog from './CalendarTruckDialog';
import MenuDialog from '../Components/MenuDialog';
import CalendarPrinter from '../Printing/CalendarPrinter';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';


dayjs.extend(weekday)

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black',
}));

interface CalendarData {
  [key: number]: any;
  0: Order[];
  1: Order[];
  2: Order[];
  3: Order[];
  4: Order[];
  5: Order[];
  6: Order[];
}

const Calendar = () => {
  const [date, setDate] = useState<Date>(dayjs().weekday(0).toDate())
  const [pickingWeek, setPickingWeek] = useState<CalendarData | null>(null);
  const [deliveryWeek, setDeliveryWeek] = useState<CalendarData | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTruckOpen, setIsTruckOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<any>(null);
  const [trucks, setTrucks] = useState<Truck[] | null>(null);
  const [truckData, setTruckData] = useState<TruckData | null>(null);
  const [truckMessage, setTruckMessage] = useState<boolean>(false);
  const [isPDFOpen, setIsPDFOpen] = useState<boolean>(false);
  const [PDFData, setPDFData] = useState<Order[]>([]);
  const theme = useTheme();

  const { userData } = useSelector((state: State) => state.data);

  const borderStyle = {
    borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
    borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
  }

  /**
   * This useEffect is used to get the trucks incase user wants to change the truck which is used to deliver the order.
   */
  useEffect(() => {
    const getTrucks = async () => {
      let userId = localStorage.getItem('userId');
      let url = process.env.REACT_APP_API_URL;
      const truckData = await FetchData({ urlHost: url, urlPath: '/trucks/get_trucks', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
      setTrucks(truckData.result);
    }
    getTrucks();
    return () => {
      setTrucks(null);
    }
  }, [])

  /**
   * This useEffect is used to get the calendarPicking data from all days.
   * This also sorts the data into the right order.
   */
  useEffect(() => {
    const getCalendar = async () => {
      // Get the calendar datas.
      let userId = localStorage.getItem('userId');
      let url = process.env.REACT_APP_API_URL;
      const calendarPicking = await FetchData({ urlHost: url, urlPath: '/orders/get_calendar_picking', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&firstDate=${dayjs(date).day(1).format('YYYY-MM-DD')}&lastDate=${dayjs(date).day(7).format('YYYY-MM-DD')}` });
      const calendarDelivery = await FetchData({ urlHost: url, urlPath: '/orders/get_calendar_delivery', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&firstDate=${dayjs(date).day(1).format('YYYY-MM-DD')}&lastDate=${dayjs(date).day(7).format('YYYY-MM-DD')}` });

      // We need to do this for both calendars.
      // Here we do it for the picking calendar.
      if (calendarPicking?.result) {
        let calendar: CalendarData = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        for (let i = 0; 7 > i; i++) {
          let filteredDate = calendarPicking.result.filter((day: Order) => {
            return dayjs(day.pickingdate).format('YYYY-MM-DD') === dayjs(date).day(i + 1).format('YYYY-MM-DD')
          })
          calendar[i].push(...filteredDate);
        }
        setPickingWeek(calendar);
      }

      // Here we do it for the delivery calendar.
      if (calendarDelivery?.result) {
        let dCalendar: CalendarData = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        for (let i = 0; 7 > i; i++) {
          let filteredDate = calendarDelivery.result.filter((day: Order) => {
            return dayjs(day.deliverydate).format('YYYY-MM-DD') === dayjs(date).day(i + 1).format('YYYY-MM-DD')
          })
          filteredDate = filteredDate
            .sort((a: any, b: any) => { return a.calendarPosition - b.calendarPosition })
            .sort((a: any, b: any) => { return a?.truck?.truckLicensePlate.localeCompare(b?.truck?.truckLicensePlate) });
          dCalendar[i].push(...filteredDate);
        }
        setDeliveryWeek(dCalendar);
      }
    }

    getCalendar();
    return () => {
      setPickingWeek(null);
      setDeliveryWeek(null);
    }
  }, [date])


  /**
   * This is used to realtime update the calendars data.
   * @param order The order which truckData or calendarPosition has been updated.
   * @param truckData Truck data is the trucks id which has been updated.
   * @param calendarPosition Calendar position is the updated position.
   */
  const updateCalendar = async (order: Order, truckData: Truck, calendarPosition: Number | string) => {
    // Repeat for all days of the week.
    for (let i = 0; i < 7; i++) {
      // Here it done for deliveryWeek
      if (deliveryWeek) {
        if (dayjs(deliveryWeek[i][0]?.deliverydate).format('DD-MM-YYYY').toString() === dayjs(order.deliverydate).format('DD-MM-YYYY').toString()) {
          let data = deliveryWeek[i].map((mapOrder: Order) => {
            return mapOrder._id === order._id
              ?
              {
                ...mapOrder, truck: truckData, calendarPosition: calendarPosition
              }
              : mapOrder;
          })
          data = data
            .sort((a: any, b: any) => { return a.calendarPosition - b.calendarPosition })
            .sort((a: any, b: any) => { return a?.truck?.truckLicensePlate.localeCompare(b?.truck?.truckLicensePlate) });
          let newData = { ...deliveryWeek, [i]: data };
          setDeliveryWeek(newData);
        }
      }
    }
  }

  /**
   * This function renders the days of the week with their own data.
   * @param week Passes the whole weeks data to the function.
   * @returns This returns the html which is used to render the week view.
   */
  const weekTD = (week: CalendarData | null, mode: string) => {
    let items = [];
    for (let i = 0; 7 > i; i++) {
      let currentTruck: any = undefined;
      if (!week) return;
      items.push(
        <Td key={i} style={{ ...borderStyle, padding: 0, verticalAlign: 'top', height: week[i]?.length === 0 ? '30px' : '100%' }} >
          {
            week[i].map((item: Order) => {
              let filteredStatus = [];
              if ((userData?.role?.rights.includes('*') || userData?.role?.rights.includes('/trucks/get_trucks'))) {
                filteredStatus = item.statusLocation.filter((statusLoc: any) => { return statusLoc.status.default !== true });
              }
              if (currentTruck !== item?.truck?.truckLicensePlate) {
                currentTruck = item?.truck?.truckLicensePlate;
                return (
                  <Box key={item._id}>
                    {
                      mode === 'delivery'
                      &&
                      <Box
                        onClick={() => { if (item?.truck?.truckLicensePlate !== undefined && (userData?.role?.rights.includes('*') || userData?.role?.rights.includes('/trucks/get_trucks'))) { setTruckData({ deliverydate: dayjs(date).day(i + 1).format('MM-DD-YYYY'), truck: item.truck }); setPDFData(week[i].filter((order: Order) => order?.truck?.truckLicensePlate === item?.truck?.truckLicensePlate)); setTruckMessage(true); } }}
                        sx={
                          {
                            color: "white",
                            fontWeight: "bold",
                            bgcolor: "black",
                            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
                            padding: '10px',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.1)
                            }
                          }
                        }
                      >
                        <Typography>
                          Rekka: {item?.truck?.truckLicensePlate === undefined ? 'EI VALITTU' : item?.truck?.truckLicensePlate}
                        </Typography>
                      </Box>
                    }
                    <Box
                      sx={
                        {
                          border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
                        }
                      }
                      onClick={() => { if (mode === 'delivery' && (userData?.role?.rights.includes('*') || userData?.role?.rights.includes('/trucks/get_trucks'))) { setOrder(item); setIsOpen(true); } }}
                    >
                      <Box sx={{ display: 'flex', position: 'relative', width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {
                          filteredStatus.map((statusLoc: any, index: number) => {
                            const width = 100 / filteredStatus.length;
                            return (
                              <Box key={index} sx={
                                {
                                  display: 'flex',
                                  bgcolor: statusLoc.status.color,
                                  width: `${width}%`,
                                  minHeight: '42.02px'
                                }
                              }
                              >
                              </Box>
                            )
                          })
                        }
                        {
                          filteredStatus.length > 0
                          &&
                          <Box sx={
                            {
                              display: 'flex',
                              position: 'absolute',
                              padding: item.statusLocation.length <= 0 ? '10px' : 0,
                              width: '100%',
                              height: '100%',
                              justifyContent: 'center',
                              alignItems: 'center',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : alpha(theme.palette.common.white, 0.3)
                              }
                            }
                          }>
                            <Typography>
                              {item.store.name}
                            </Typography>
                          </Box>
                        }
                      </Box>
                      {
                        filteredStatus.length <= 0
                        &&
                        <Typography sx={
                          {
                            padding: filteredStatus.length <= 0 ? '10px' : 0,
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.1)
                            }
                          }
                        }
                        >
                          {item.store.name}
                        </Typography>
                      }

                    </Box>
                  </Box>
                )
              } else {
                currentTruck = item?.truck?.truckLicensePlate;
                return (
                  <Box
                    sx={
                      {
                        border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.1)
                        }
                      }
                    }
                    key={item._id}
                    onClick={() => { if (mode === 'delivery' && (userData?.role?.rights.includes('*') || userData?.role?.rights.includes('/trucks/get_trucks'))) { setOrder(item); setIsOpen(true); } }}
                  >
                    <Box sx={{ display: 'flex', position: 'relative', width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      {
                        filteredStatus.map((statusLoc: any, index: number) => {
                          const width = 100 / filteredStatus.length;
                          return (
                            <Box key={index} sx={
                              {
                                display: 'flex',
                                bgcolor: statusLoc.status.color,
                                width: `${width}%`,
                                minHeight: '42.02px'
                              }
                            }
                            >
                            </Box>
                          )
                        })
                      }
                      {
                        filteredStatus.length > 0
                        &&
                        <Box sx={
                          {
                            display: 'flex',
                            position: 'absolute',
                            padding: item.statusLocation.length <= 0 ? '10px' : 0,
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.3) : alpha(theme.palette.common.white, 0.3)
                            }
                          }
                        }>
                          <Typography>
                            {item.store.name}
                          </Typography>
                        </Box>
                      }
                    </Box>
                    {
                      filteredStatus.length <= 0
                      &&
                      <Typography sx={
                        {
                          padding: filteredStatus.length <= 0 ? '10px' : 0,
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.1)
                          }
                        }
                      }
                      >
                        {item.store.name}
                      </Typography>
                    }
                  </Box>
                )
              }
            })
          }
        </Td >
      )
    }
    return (items)
  }

  return (
    <Box sx={{ display: 'flex', padding: 3, paddingTop: 9, height: '100%', minHeight: '100vh', justifyContent: 'center' }}>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ marginTop: '50px', textAlign: 'center' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDatePicker
              label="Kalenteri"
              value={date}
              inputFormat='DD.MM.YYYY'
              closeOnSelect={true}
              onChange={(newValue) => {
                setDate(dayjs(newValue).weekday(0).toDate())
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Box>
        <Item sx={{ marginTop: '25px', display: userData?.role?.rights.includes('*') || userData?.role?.rights.includes('/trucks/get_trucks') ? 'display' : 'none' }}>
          <Typography sx={{ fontSize: '25px' }}>Toimitettavat kaupat</Typography>
          <Table style={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
          }}>
            <Thead>
              <Tr>
                <Th><Typography>{dayjs(date).day(1).format('DD/MM/YYYY')}</Typography></Th>
                <Th><Typography>{dayjs(date).day(2).format('DD/MM/YYYY')}</Typography></Th>
                <Th><Typography>{dayjs(date).day(3).format('DD/MM/YYYY')}</Typography></Th>
                <Th><Typography>{dayjs(date).day(4).format('DD/MM/YYYY')}</Typography></Th>
                <Th><Typography>{dayjs(date).day(5).format('DD/MM/YYYY')}</Typography></Th>
                <Th><Typography>{dayjs(date).day(6).format('DD/MM/YYYY')}</Typography></Th>
                <Th><Typography>{dayjs(date).day(7).format('DD/MM/YYYY')}</Typography></Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr style={{ textAlign: 'center' }}>
                {weekTD(deliveryWeek, 'delivery')}
              </Tr>
            </Tbody>
          </Table>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(-6).toDate())}>Viime viikko</Button>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(8).toDate())}>Seuraava viikko</Button>
        </ Item>
        <Item sx={{ marginTop: '25px' }}>
          <Typography sx={{ fontSize: '25px' }}>Kerättävät kaupat</Typography>
          <Table style={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
          }}>
            <Thead>
              <Tr>
                <Th>{dayjs(date).day(1).format('DD/MM/YYYY')}</Th>
                <Th>{dayjs(date).day(2).format('DD/MM/YYYY')}</Th>
                <Th>{dayjs(date).day(3).format('DD/MM/YYYY')}</Th>
                <Th>{dayjs(date).day(4).format('DD/MM/YYYY')}</Th>
                <Th>{dayjs(date).day(5).format('DD/MM/YYYY')}</Th>
                <Th>{dayjs(date).day(6).format('DD/MM/YYYY')}</Th>
                <Th>{dayjs(date).day(7).format('DD/MM/YYYY')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr style={{ textAlign: 'center' }}>
                {weekTD(pickingWeek, 'picking')}
              </Tr>
            </Tbody>
          </Table>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(-7).toDate())}>Viime viikko</Button>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(7).toDate())}>Seuraava viikko</Button>
        </ Item>
      </Grid>
      {
        truckMessage
          ?
          <MenuDialog isOpen={truckMessage} setIsOpen={(value) => setTruckMessage(value)} result={() => { return; }} dialogTitle={'Kalenteri toiminnot'} actions={false}>
            <Grid container sx={{ flexDirection: 'column', flexGrow: 1 }}>
              <Button variant='contained' startIcon={<EditIcon />} onClick={() => { setTruckMessage(false); setIsTruckOpen(true); }}>Muuta rekan lisätietoja</Button>
              <Button sx={{ marginTop: '15px' }} variant='contained' startIcon={<PictureAsPdfIcon />} onClick={() => { setTruckMessage(false); setIsPDFOpen(true); }}>Tulosta PDF</Button>
            </Grid>
          </MenuDialog>
          :
          null
      }
      {
        isPDFOpen
        &&
        <CalendarPrinter isOpen={isPDFOpen} setIsOpen={(value) => { setPDFData([]); setIsPDFOpen(value); }} orderPrint={PDFData} setOrderPrint={(value) => setPDFData(value)} truckData={truckData} />
      }
      {
        isOpen
          ?
          <CalendarDialog isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} order={order} trucks={trucks} updateCalendar={(order, truckData, calendarPosition) => updateCalendar(order, truckData, calendarPosition)} />
          :
          null
      }
      {
        isTruckOpen
          ?
          <CalendarTruckDialog isOpen={isTruckOpen} setIsOpen={(value) => setIsTruckOpen(value)} truckData={truckData} />
          :
          null
      }
    </Box>
  )
}

export default Calendar;