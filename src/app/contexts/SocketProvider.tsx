import React, { useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = React.createContext<Socket | undefined>(undefined);

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({ children }: any) => {
    const [socket, setSocket] = useState<Socket | undefined>()

    useEffect(() => {
        let url = process.env.REACT_APP_API_URL;
        const newSocket: any = io(url + '/', {
            auth: {
                userid: localStorage.getItem('userId'),
                token: localStorage.getItem('token')
            }
        })
        newSocket.on('connect', () => {
            console.log('Connected ' + newSocket.id)
        })
        setSocket(newSocket)

        return () => newSocket.close()
    }, [])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}