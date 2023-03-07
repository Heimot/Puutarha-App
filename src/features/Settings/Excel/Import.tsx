import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Button, Container, Box, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { read, utils } from 'xlsx';

import UploadIcon from '@mui/icons-material/Upload';
import ExcelTable from './ExcelTable';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';

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

  const theme = useTheme();

  const borderStyle = {
    borderLeft: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`,
    borderTop: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
  }

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
        /*console.log(result)
        let orders = [];
        for (let x = 0; x < result[0].length; x++) {
          let orderData = [];
          for (let i = 0; i < result.length; i++) {
            orderData.push(result[i][x]);
          }
          orders.push(orderData);
        }
        console.log(orders);*/
        setOrders(result);
      };
      FR.readAsArrayBuffer(file);
    } catch (error) {
      console.log(error);
    };
  }

  return (
    <Grid container sx={{ padding: '10px', width: '100%' }}>
      <Grid xs={12}>
        <Item>
          <Box>
            <Button component='label' startIcon={<UploadIcon />}>
              Upload new image
              <input
                accept="*"
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <Button onClick={() => console.log(orders)}>Get data</Button>
          </Box>
          <Box>
            <Table style={{
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              border: `solid ${theme.palette.mode === 'dark' ? 'white' : 'black'} 1px`
            }}>
              <Thead>
                <Tr>
                  <Th>Tuote</Th>
                  <Th>Kerätään</Th>
                  <Th>Keräyspiste</Th>
                  <Th>Lisätietoa</Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  orders?.map((order: any, index: number) => (
                    <Tr key={index}>
                      {
                        order?.map((item: any, index: number) => (
                          <Td styles={borderStyle} key={index}>{item}</Td>
                        ))
                      }
                    </Tr>
                  ))
                }
              </Tbody>
            </Table>
          </Box>
          {/*orders.map((order: any, index: number) => (
            <Box>
              {
                index >= 2
                &&
                <ExcelTable key={index} order={order} index={index} flowerNames={orders.slice(0, 1)[0].slice(5, orders[0].length)} locationNames={orders.slice(1, 2)[0].slice(5, orders[0].length)} />
              }
            </Box>
            ))*/}
        </Item>
      </Grid>
    </Grid>
  )
}

export default Import