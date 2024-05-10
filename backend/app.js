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
import jwt from 'jsonwebtoken';
import { secret } from './config.js';
import User from './src/models/User.js';

// websocket imports:
import { incomingMessage } from './WebsocketServer.js';
import { assignRole, createNewGame, createNewMultiplayerGame, joinMultiplayerGame } from './src/controllers/games.js';

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

app.get("*", (req, res) => {
    const indexPath = path.resolve(publicDirectoryPath, "index.html");
    res.sendFile(indexPath);
});

// websocket
const server = app.listen(port, () => console.log(`Now listening on port ${port}`));
const wss = new WebSocketServer({server});

// ws = person connecting to the server / current user

wss.on('connection', async function connection(ws, req) {
    console.log('A new client Connected!');
    const token = cookie.parse(req.headers.cookie).jwt;

    const {userName} = jwt.verify(token, secret);
    const user = await User.findOne({userName});

    assignRole(ws, user.userName);

    ws.on('message', incomingMessage.bind(null, ws, userName));
    
    ws.on('close', () => {
    });
});

