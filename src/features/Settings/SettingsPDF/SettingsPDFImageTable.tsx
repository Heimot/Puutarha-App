import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Button, Container } from '@mui/material';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import DeleteIcon from '@mui/icons-material/Delete';
import FetchData from '../../Components/Fetch';
import dayjs from 'dayjs';
import MenuDialog from '../../Components/MenuDialog';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    chooseImage: (value: string) => void;
}

interface Images {
    _id: string;
    filename: string;
    contentType: string;
    chunkSize: number;
    length: number;
    uploadDate: Date;
}

const SettingsPDFImageTable: React.FC<Props> = ({ isOpen, setIsOpen, chooseImage }) => {
    const [images, setImages] = useState<Images[]>([]);
    const [deletionId, setDeletionId] = useState<string>('');
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!isOpen) return;
        const getFiles = async () => {
            let userId = localStorage.getItem('userId');
            let url = process.env.REACT_APP_API_URL;
            const files = await FetchData({ urlHost: url, urlPath: '/files/get_files', urlMethod: 'GET', urlHeaders: 'Auth', urlQuery: `?currentUserId=${userId}` });
            setImages(files);
        }

        getFiles();
        return () => {
            setImages([]);
        }
    }, [isOpen])

    const handleClick = () => {
        setIsOpen(!isOpen);
    }

    const downloadImage = (id: string) => {
        let a = document.createElement('a');
        let url = process.env.REACT_APP_API_URL;
        a.href = `${url}/files/get_image_by_id?id=${id}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`;
        a.click();
    }

    const handleFileChange = async (e: React.FormEvent) => {
        const target = e?.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (!file) return;
        let formData = new FormData();
        formData.append('image', file);
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        const files = await FetchData({ urlHost: url, urlPath: '/files/upload', urlMethod: 'POST', urlHeaders: 'Auth', urlFormData: formData, urlQuery: `?currentUserId=${userId}` });
        setImages(prevState => [...prevState, { _id: files.file.id, filename: files.file.filename, contentType: files.file.contentType, chunkSize: files.file.chunkSize, length: files.file.length, uploadDate: files.file.uploadDate }]);
        (e.target as any).value = null
    }

    const deleteImage = async (_id: string) => {
        let userId = localStorage.getItem('userId');
        let url = process.env.REACT_APP_API_URL;
        let body = {
            _id: _id
        }
        await FetchData({ urlHost: url, urlPath: '/files/delete_image', urlMethod: 'DELETE', urlHeaders: 'Auth', urlBody: body, urlQuery: `?currentUserId=${userId}` });
        let filteredImages = images;
        filteredImages = images.filter((image) => {
            return image._id !== _id;
        });
        setImages(filteredImages);
    }

    return (
        <Dialog
            onClose={handleClick}
            fullWidth={true}
            maxWidth={"xl"}
            open={isOpen}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Kuvat
                <IconButton
                    aria-label="close"
                    onClick={handleClick}
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
                <ImageList sx={{
                    mb: 8,
                    height: "100%",
                    width: "100%",
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))!important'
                }}>
                    {images?.map((item) => {
                        return (
                            <ImageListItem key={item._id}>
                                <img
                                    src={`${process.env.REACT_APP_API_URL}/files/get_image_by_id?id=${item._id}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`}
                                    srcSet={`${process.env.REACT_APP_API_URL}/files/get_image_by_id?id=${item._id}&auth=${localStorage.getItem('token')}&currentUserId=${localStorage.getItem('userId')}`}
                                    alt={item.filename}
                                    loading="lazy"
                                />
                                <ImageListItemBar
                                    title={item.filename}
                                    subtitle={`${dayjs(item.uploadDate).format('DD-MM-YYYY')} ${dayjs(item.uploadDate).format('HH:MM:ss')}`}
                                    actionIcon={
                                        <Container sx={{ display: 'flex !important', justifyContent: 'flex-end !important', paddingRight: '0 !important', paddingLeft: '0 !important' }}>
                                            <IconButton
                                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                aria-label={`Delete image ${item.filename}`}
                                                component='label'
                                                onClick={() => { setDeletionId(item._id); setIsDeleteOpen(true); }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton
                                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                aria-label={`Download image ${item.filename}`}
                                                component='label'
                                                onClick={() => { downloadImage(item._id) }}
                                            >
                                                <DownloadForOfflineIcon />
                                            </IconButton>
                                            <IconButton
                                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                aria-label={`Choose image ${item.filename}`}
                                                onClick={() => { chooseImage(item._id); handleClick(); }}
                                            >
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </ Container>
                                    }
                                />
                            </ImageListItem>
                        )
                    })}
                </ImageList>
            </DialogContent>
            <DialogActions>
                <Button component='label' startIcon={<UploadIcon />}>
                    Upload new image
                    <input
                        accept="image/*"
                        type="file"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>
                <Button variant='contained' autoFocus onClick={handleClick}>
                    Save changes
                </Button>
            </DialogActions>
            <MenuDialog isOpen={isDeleteOpen} setIsOpen={(value: boolean) => setIsDeleteOpen(value)} result={() => deleteImage(deletionId)} dialogTitle={'Haluatko poistaa tämän kuvan?'} actions={true}>
                {`Haluatko varmasti tämän kuvan? Mikäli poistat sitä ei voida enää palauttaa.`}
            </MenuDialog>
        </Dialog >
    )
}

export default SettingsPDFImageTable;