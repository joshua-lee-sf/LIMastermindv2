import Express from 'express';
import bodyParser from 'body-parser';
import http from "http";
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import { WebSocketServer } from 'ws';
import cookieParser from 'cookie-parser';
import path from "path";
import 'dotenv/config';
import userRouter from '../backend/src/routes/users.js';
import gameRouter from '../backend/src/routes/games.js';
import cookie from 'cookie'
import { isProduction, mongoURI } from './config.js';

// websocket imports:
import { incomingMessage } from './WebsocketServer.js';
import { createNewGame, createNewMultiplayerGame, joinMultiplayerGame } from './src/controllers/games.js';
import { gameQueue } from './src/controllers/games.js';

await mongoose.connect(process.env.MONGO_URI);

const app = Express();
const port = 5000;

const publicDirectoryPath = path.join(
    new URL(".", import.meta.url).pathname.substring(1)
);

app.use(passport.initialize());
app.use(Express.static(publicDirectoryPath));  

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/users', userRouter);
app.use('/api/games', gameRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// app.listen(port, () => {
//     console.log(`App is listening on port ${port}`)
// });

app.get("*", (req, res) => {
    const indexPath = path.resolve(publicDirectoryPath, "index.html");
    res.sendFile(indexPath);
});

// websocket
const server = app.listen(port, () => console.log(`Now listening on port ${port}`));
const wss = new WebSocketServer({server});

// ws = person connecting to the server / current user

wss.on('connection', function connection(ws, req) {
    console.log('A new client Connected!');
    const masterCode = req.headers['sec-websocket-protocol'];
    const token = cookie.parse(req.headers.cookie).jwt;

    gameQueue.length > 0 ?  joinMultiplayerGame(ws, token) : createNewMultiplayerGame(ws, masterCode, token);
    console.log(gameQueue, 'gamequeue');

    ws.on('message', incomingMessage.bind(null, ws));
    
    ws.on('close', () => {
    });
});

