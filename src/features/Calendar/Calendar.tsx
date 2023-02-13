import React, { useState, useEffect } from 'react'
import { Box, Button, TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from "@mui/material/styles";
import Paper from '@mui/material/Paper';
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import FetchData from '../Components/Fetch';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import { Order, Truck } from '../../Model';

import CalendarDialog from './CalendarDialog';

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
  const [date, setDate] = useState<Date>(dayjs().toDate())
  const [pickingWeek, setPickingWeek] = useState<CalendarData | null>(null);
  const [deliveryWeek, setDeliveryWeek] = useState<CalendarData | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<any>(null);
  const [trucks, setTrucks] = useState<Truck[] | null>(null);
  const theme = useTheme();

  const borderStyle = {
    borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
    borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
  }

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

  useEffect(() => {
    const getCalendar = async () => {
      let userId = localStorage.getItem('userId');
      let url = process.env.REACT_APP_API_URL;
      const calendarPicking = await FetchData({ urlHost: url, urlPath: '/orders/get_calendar_picking', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&firstDate=${dayjs(date).day(1).format('YYYY-MM-DD')}&lastDate=${dayjs(date).day(7).format('YYYY-MM-DD')}` });
      const calendarDelivery = await FetchData({ urlHost: url, urlPath: '/orders/get_calendar_delivery', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&firstDate=${dayjs(date).day(1).format('YYYY-MM-DD')}&lastDate=${dayjs(date).day(7).format('YYYY-MM-DD')}` });
      console.log(calendarPicking)

      if (!calendarPicking?.result) return;
      let calendar: CalendarData = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      for (let i = 0; 7 > i; i++) {
        let filteredDate = calendarPicking.result.filter((day: Order) => {
          return dayjs(day.pickingdate).format('YYYY-MM-DD') === dayjs(date).day(i + 1).format('YYYY-MM-DD')
        })
        filteredDate = filteredDate
          .sort((a: any, b: any) => { return a.calendarPosition - b.calendarPosition })
          .sort((a: any, b: any) => { return a?.truck?.truckLicensePlate.localeCompare(b?.truck?.truckLicensePlate) });
        calendar[i].push(...filteredDate);
      }
      setPickingWeek(calendar);

      if (!calendarDelivery?.result) return;
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

    getCalendar();
    return () => {
      setPickingWeek(null);
      setDeliveryWeek(null);
    }
  }, [date])

  const updateCalendar = async (order: Order, truckData: Truck, calendarPosition: Number | string) => {
    for (let i = 0; i < 7; i++) {
      if (pickingWeek) {
        if (dayjs(pickingWeek[i][0]?.pickingdate).format('DD-MM-YYYY').toString() === dayjs(order.pickingdate).format('DD-MM-YYYY').toString()) {
          let data = pickingWeek[i].map((mapOrder: Order) => {
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
          let newData = { ...pickingWeek, [i]: data };
          setPickingWeek(newData);
        }
      }
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

  const weekTD = (week: CalendarData | null) => {
    let items = [];
    for (let i = 0; 7 > i; i++) {
      let currentTruck: any = undefined;
      items.push(
        <Td key={i} style={{ ...borderStyle, padding: 0, height: '100%', verticalAlign: 'top', }} >
          {
            week !== null
              ?
              week[i].map((item: Order) => {
                if (currentTruck !== item?.truck?.truckLicensePlate) {
                  currentTruck = item?.truck?.truckLicensePlate;
                  return (
                    <Box key={item._id}>
                      <Box
                        sx={
                          {
                            color: "white",
                            fontWeight: "bold",
                            bgcolor: "black",
                            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
                            padding: '10px'
                          }
                        }
                      >
                        Rekka: {item?.truck?.truckLicensePlate === undefined ? 'EI VALITTU' : item?.truck?.truckLicensePlate}
                      </Box>
                      <Box
                        sx={
                          {
                            border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
                            padding: '10px',
                          }
                        }
                        onClick={() => { setOrder(item); setIsOpen(true); }}
                      >
                        {item.store.name}
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
                          padding: '10px',
                        }
                      }
                      key={item._id}
                      onClick={() => { setOrder(item); setIsOpen(true); }}
                    >
                      {item.store.name}
                    </Box>
                  )
                }
              })
              :
              null
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
        <Item sx={{ marginTop: '25px' }}>
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
                {weekTD(pickingWeek)}
              </Tr>
            </Tbody>
          </Table>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(-6).toDate())}>Last week</Button>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(8).toDate())}>Next week</Button>
        </ Item>
        <Item sx={{ marginTop: '25px' }}>
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
                {weekTD(deliveryWeek)}
              </Tr>
            </Tbody>
          </Table>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(-6).toDate())}>Last week</Button>
          <Button onClick={() => setDate(prevState => dayjs(prevState).weekday(8).toDate())}>Next week</Button>
        </ Item>
      </Grid>
      {
        isOpen
          ?
          <CalendarDialog isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} order={order} trucks={trucks} updateCalendar={(order, truckData, calendarPosition) => updateCalendar(order, truckData, calendarPosition)} />
          :
          null
      }
    </Box>
  )
}

export default Calendar