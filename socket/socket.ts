import { API_URL } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Socket, io } from 'socket.io-client'

let socket: Socket | null = null;

export async function connectionSocket(): Promise<Socket> {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
        throw new Error("no token found. User must login first")
    }
    if (!socket || !socket.connected) {
        if (socket) {
            socket.disconnect();
        }
        socket = io(API_URL, {
            auth: { token },
            transports: ["websocket"]
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });
    }
    return socket
}

export function getSocket(): Socket | null {
    return socket
}
export function disconnectSocket(): void {
    if (socket) {
        console.log("Disconnecting socket...");
        socket.disconnect();
        socket.removeAllListeners();
        socket = null;
        console.log("Socket disconnected and cleaned up");
    }
}