import React, { useState, useEffect } from 'react'
import { Box, Button } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from "@mui/material/styles";
import Paper from '@mui/material/Paper';

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import FetchData from '../Components/Fetch';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import { Order } from '../../Model';
dayjs.extend(weekday)

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  border: theme.palette.mode === 'dark' ? 'none' : 'solid 1px black',
}));

interface Calendar {
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
  const [pickingWeek, setPickingWeek] = useState<Calendar | null>(null);
  const [deliveryWeek, setDeliveryWeek] = useState<Calendar | null>(null);
  const theme = useTheme();

  useEffect(() => {

    const getCalendar = async () => {
      let userId = localStorage.getItem('userId');
      let url = process.env.REACT_APP_API_URL;
      const calendarPicking = await FetchData({ urlHost: url, urlPath: '/orders/get_calendar_picking', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&firstDate=${dayjs(date).day(1).format('YYYY-MM-DD')}&lastDate=${dayjs(date).day(7).format('YYYY-MM-DD')}` });
      const calendarDelivery = await FetchData({ urlHost: url, urlPath: '/orders/get_calendar_delivery', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}&firstDate=${dayjs(date).day(1).format('YYYY-MM-DD')}&lastDate=${dayjs(date).day(7).format('YYYY-MM-DD')}` });

      if (!calendarPicking?.result) return;
      let calendar: Calendar = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      for (let i = 0; 7 > i; i++) {
        let filteredDate = calendarPicking.result.filter((day: Order) => {
          return dayjs(day.pickingdate).format('YYYY-MM-DD') === dayjs(date).day(i + 1).format('YYYY-MM-DD')
        })

        calendar[i].push(...filteredDate);
      }
      setPickingWeek(calendar);

      if (!calendarDelivery?.result) return;
      let dCalendar: Calendar = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      for (let i = 0; 7 > i; i++) {
        let filteredDate = calendarDelivery.result.filter((day: Order) => {
          return dayjs(day.deliverydate).format('YYYY-MM-DD') === dayjs(date).day(i + 1).format('YYYY-MM-DD')
        })

        dCalendar[i].push(...filteredDate);
      }
      setDeliveryWeek(dCalendar);

    }
    getCalendar();
  }, [date])

  const borderStyle = {
    borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
    borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
  }

  const weekTD = (week: Calendar | null) => {
    let items = [];
    for (let i = 0; 7 > i; i++) {
      items.push(
        <Td key={i} style={borderStyle}>
          {
            week !== null
              ?
              week[i].map((item: Order) => (
                <div key={item._id}>{item.store.name}</div>
              ))
              :
              null
          }
        </Td>
      )
    }
    return (items)
  }

  return (
    <Box sx={{ display: 'flex', padding: 3, paddingTop: 9, height: '100%', minHeight: '100vh', justifyContent: 'center' }}>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ flexDirection: 'column', flexGrow: 1 }}>
        <Item sx={{ marginTop: '50px' }}>
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
        <Item sx={{ marginTop: '50px' }}>
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
    </Box>
  )
}

export default Calendar