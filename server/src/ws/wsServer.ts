import { WebSocketServer,WebSocket } from "ws";
import { Server,IncomingMessage } from "http";
import { TokenPayload, verifyAccessToken } from "../utils/jwt";

interface AuthenticatedWs extends WebSocket {
    userId: string;
    userName : string;
    role: string;
    quizId: string;
    isAlive: boolean;
}

interface WsMessage {
    type: string;
    [key : string] : unknown;
}

export const setUpWebSocketServer = (server: Server): WebSocketServer => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (rawWs: WebSocket, req: IncomingMessage): void => {
        const ws = rawWs as AuthenticatedWs;
        ws.isAlive = true;

        const url = new URL(req.url || '' ,'http://localhost');
        const token = url.searchParams.get('token');
        
        if(!token){
            ws.close(4001,'Missing token');
            return;
        }
        let payload: TokenPayload;

        try{
            payload = verifyAccessToken(token);
        }catch{
            ws.close(4003, 'Invalid token');
            return;
        }
    })

    return wss;
}