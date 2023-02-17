import React, { useState, useEffect } from 'react'
import { Button, TextField, Box, Autocomplete, createFilterOptions, FilterOptionsState, useTheme, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useSelector } from 'react-redux';
import { State } from '../../app/redux/store';

import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table'

import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import { Store, Location, Roller } from '../../Model';
import FetchData from './Fetch';
import EditingMenuData from './EditingMenuData';
import AddAutofill from './AddAutofill';

interface Props {
    orderData: any;
    setOrderData: (value: any, name: string) => void;
    updateData: (value: any) => void;
    isCreated: boolean;
    removeProduct?: (id: string, isEditor: boolean, method: 'DELETE' | 'POST' | 'PATCH' | 'DELETEPRODUCT', date: Date, productId: string | undefined) => void;
}

const EditTable: React.FC<Props> = ({ orderData, setOrderData, updateData, isCreated, removeProduct }) => {
    const [orderCode, setOrderCode] = useState<string>('');
    const [information, setInformation] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [roller, setRoller] = useState<Roller | null>(null);

    const theme = useTheme();

    const { locationSettings, storeSettings, rollerSettings } = useSelector((state: State) => state.data);

    const defaultFilterOptions = createFilterOptions<Store>();
    const filterOptions = (options: Store[], state: FilterOptionsState<Store>) => {
        return defaultFilterOptions(options, state).slice(0, 10);
    }

    useEffect(() => {
        setOrderCode(orderData.ordercode);
        setInformation(orderData.information);
        if (orderData?.roller?._id !== '') {
            setRoller(orderData.roller);
        } else {
            const defaultRoller = rollerSettings?.filter((roller: Roller) => {
                return roller.default;
            })
            setRoller(defaultRoller[0]);
        }
    }, [])

    useEffect(() => {
        setOrderData(information, 'information');
    }, [information])

    useEffect(() => {
        setOrderData(orderCode, 'ordercode');
    }, [orderCode])

    useEffect(() => {
        setOrderData(roller, 'roller');
    }, [roller])

    const updateProducts = (value: any, name: string, productId: string) => {
        let data = value;
        switch (name) {
            case 'amount':
                data = Number(value);
                break;
            case 'location':
                data = locationSettings.filter((location: Location) => {
                    return location._id === value;
                })[0]
                break;
            default:
                data = value;
                break;
        }

        if (orderData) {
            let newData = {
                ...orderData, products: orderData.products.map((product: any) => {
                    return product._id === productId
                        ?
                        { ...product, [name]: data }
                        :
                        product
                })
            }
            updateData(newData);
        }
    }

    const deleteProduct = async (productId: string) => {
        if (!orderData) return;
        let newData = {
            ...orderData, products: orderData.products.filter((product: any) => {
                return product._id !== productId
            })
        }
        updateData(newData);

        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            currentUserId: userId,
            _id: productId,
            orderId: orderData._id
        }
        await FetchData({ urlHost: url, urlPath: '/products/delete_product', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body });
        if (isCreated) {
            if (!removeProduct) return;
            removeProduct(orderData._id, false, 'DELETEPRODUCT', orderData.pickingdate, productId);
        }
    }

    const updateRoller = (e: any) => {
        const filteredRoller = rollerSettings?.filter((roller: Roller) => {
            return roller._id === e.target.value;
        })
        setRoller(filteredRoller[0]);
    }

    return (
        <div>
            <Grid container xs={12}>
                <Grid container direction="column" xs={12} sm={6}>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid xs={12}>
                                {
                                    orderData?.pickingdate !== null ?
                                        <MobileDatePicker
                                            label="Keräyspäivä"
                                            value={dayjs(orderData?.pickingdate)}
                                            inputFormat='DD.MM.YYYY'
                                            closeOnSelect={true}
                                            onChange={(newValue) => {
                                                setOrderData(dayjs(newValue), 'pickingdate')
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                        : null
                                }
                            </Grid>
                            <Grid sx={{ marginTop: '10px' }} xs={12}>
                                {
                                    orderData?.deliverydate !== null ?
                                        <MobileDatePicker
                                            label="Toimituspäivä"
                                            value={dayjs(orderData?.deliverydate)}
                                            inputFormat='DD.MM.YYYY'
                                            closeOnSelect={true}
                                            onChange={(newValue) => {
                                                setOrderData(dayjs(newValue), 'deliverydate')
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                        : null
                                }
                            </Grid>
                        </LocalizationProvider>
                    </Box>
                    <Box sx={{ margin: '10px 0 10px 0' }}>
                        {
                            orderData?.store !== null && storeSettings !== null ?
                                <Autocomplete
                                    id="store-auto"
                                    value={orderData?.store}
                                    filterOptions={filterOptions}
                                    onChange={(e, value) => setOrderData(value, 'store')}
                                    options={storeSettings}
                                    getOptionLabel={(option: Store) => option.name}
                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                    sx={{ maxWidth: 300 }}
                                    noOptionsText={<Button startIcon={<AddIcon />} style={{ width: '100%' }} onClick={() => setIsOpen(true)}>Luo uusi?</Button>}
                                    includeInputInList
                                    disableClearable
                                    renderInput={(params) => (
                                        <TextField {...params} label="Kauppa" />
                                    )}
                                />
                                : null
                        }
                    </Box>
                </Grid>
                <Grid container direction="column" xs={12} sm={6} sx={{ padding: 0 }}>
                    <Grid style={{ display: "flex", justifyContent: "flex-end" }} xs={12} >
                        <TextField name='information' label="Lisätietoa" value={information} multiline onChange={(e) => setInformation(e.target.value)}></TextField>
                    </Grid>
                    <Grid style={{ display: "flex", justifyContent: "flex-end", margin: '10px 0 0 0' }} xs={12}>
                        <TextField name='ordercode' label="Tilauskoodi" value={orderCode} multiline onChange={(e) => setOrderCode(e.target.value)}></TextField>
                    </Grid>
                    <Grid style={{ display: "flex", justifyContent: "flex-end", margin: '10px 0 10px 0' }} xs={12}>
                        {
                            roller !== null
                                ?
                                <FormControl fullWidth sx={{ maxWidth: 300 }}>
                                    <InputLabel id='roller-label'>Rullakko</InputLabel>
                                    <Select labelId='roller-label' label='Rullakko' value={roller._id} onChange={(e) => updateRoller(e)}>
                                        {
                                            rollerSettings?.map((roller: Roller) => (
                                                <MenuItem key={roller._id} value={roller._id}>{roller.roller}</MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                                :
                                null
                        }

                    </Grid>
                </Grid>
            </Grid>
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
                        orderData?.products.map((product: any) =>
                            <EditingMenuData key={product._id} product={product} updateProducts={(value, name, productId) => updateProducts(value, name, productId)} deleteProduct={(productId) => deleteProduct(productId)} isCreated={isCreated} />
                        )
                    }
                </Tbody>
            </Table>
            <AddAutofill isOpen={isOpen} setIsOpen={(value) => setIsOpen(value)} usedGroup='Stores' updateText={(value) => setOrderData(value, 'store')} />
        </div>
    )
}

export default EditTable