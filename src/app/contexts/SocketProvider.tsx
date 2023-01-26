import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

const SocketContext = React.createContext(null);

export function useSocket() {
    return useContext(SocketContext)
}

export function SocketProvider({ children }: any) {
    const [socket, setSocket] = useState<any>()

    useEffect(() => {
        let url = process.env.REACT_APP_API_URL;
        const newSocket: any = io(url + '/', {
            query: {
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