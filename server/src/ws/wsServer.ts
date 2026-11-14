import { WebSocketServer,WebSocket } from "ws";
import { Server,IncomingMessage } from "http";
import { TokenPayload, verifyAccessToken } from "../utils/jwt";
import { initLeaderboardMemeber,getRoomState } from "../services/redis/redis";
import { getCachedQuestions } from "../services/redis/cache";
import Quiz from "../models/Quiz";
import Question, { IQuestion } from "../models/Question";

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

const rooms = new Map<string, Set<AuthenticatedWs>>();

function getRoom(quizId: string): Set<AuthenticatedWs> {
    if(!rooms.has(quizId)) rooms.set(quizId,new Set<AuthenticatedWs>());
    return rooms.get(quizId)!;
}

function broadcast(quizId: string, payload: object, exclude?: AuthenticatedWs){
    const room = getRoom(quizId);
    for(const client of room){
        if(client != exclude && client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(payload));
        }
    }
}

function sendTo(ws: AuthenticatedWs,payload: object){
    if(ws.readyState === WebSocket.OPEN){
        ws.send(JSON.stringify(payload));
    }
}

async function handleJoin(ws: AuthenticatedWs): Promise<void> {
    const { quizId,userId } = ws;
    const room = getRoom(quizId);
    room.add(ws);

    initLeaderboardMemeber(quizId, userId);
    // update participant count
    await Quiz.findByIdAndUpdate(quizId,{ participantCount: room.size});

    const state = await getRoomState(quizId);
    sendTo(ws,{
        type: 'room_joined',
        quizId,
        participantCount: room.size,
        roomState: state
    })

    broadcast(quizId,{ type: 'participant_joined', userId,participantCount: room.size}, ws);
    // if user join mid-quiz, send him the current ongoing question
    if(state && state.status === 'active' && state.currentQuestionIndex >= 0){
        const questions = await getCachedQuestions(quizId);
        const q = questions[state.currentQuestionIndex];

        if(q){
            const elapsed = Date.now() - state.qStartedAt;
            const remaining = Math.max(0, q.timeLimitSeconds * 1000 - elapsed);
            sendTo(ws, {
                type: 'question',
                question: {
                    _id: q._id,
                    text: q.text,
                    options: q.options,
                    timeLimitSeconds: q.timeLimitSeconds,
                    points: q.points
                },
                qIndex: state.currentQuestionIndex,
                remainingMs: remaining
            })
        }
    }
}

export const setUpWebSocketServer = (server: Server): WebSocketServer => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async(rawWs: WebSocket, req: IncomingMessage) => {
        const ws = rawWs as AuthenticatedWs;
        ws.isAlive = true;

        const url = new URL(req.url || '' ,'http://localhost');
        const token = url.searchParams.get('token');
        const quizId = url.searchParams.get('quizId');
        
        if(!token || ! quizId){
            ws.close(4001,'Token or quizId is missing');
            return;
        }
        let payload: TokenPayload;

        try{
            payload = verifyAccessToken(token);
        }catch{
            ws.close(4003, 'Invalid token');
            return;
        }

        ws.userId = payload.userId;
        ws.role = payload.role;
        ws.quizId = quizId;
        ws.userName = payload.email;

        const quiz = await Quiz.findById({ quizId });
        if(!quiz){
            ws.close(4004,'Quiz not found');
            return;
        }
        if(quiz.status === 'ended'){
            ws.close(4005,'Quiz Already ended'); return;
        }
        console.log(`[Ws] ${payload.role} ${payload.userId} joined quiz ${quizId}`);

        ws.on('pong', () => ws.isAlive = true);

        ws.on('message', async (data) => {
            let msg: WsMessage;
            try{
                msg = JSON.parse(data.toString());
            }catch{
                sendTo(ws, {type: 'error', message: 'invalid JSON'});
                return;
            }

            try{
                switch(msg.type){
                    case 'join_quiz': await handleJoin(ws); break;
                }
            }catch(err){
                console.error('[Ws] server error', JSON.stringify(err));
                sendTo(ws, {type: 'error', mesage: 'Action not supported or Internal Server error'})
            }
        })

    });
    
    console.log('[Ws] server ready!');
    return wss;
}