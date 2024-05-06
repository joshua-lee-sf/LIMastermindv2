import Express from 'express';
import bodyParser from 'body-parser';
import http from "http";
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import { WebSocketServer } from 'ws';
import path from "path";
import 'dotenv/config';
import userRouter from '../backend/src/routes/users.js';
import gameRouter from '../backend/src/routes/games.js';
import { isProduction, mongoURI } from './config.js';


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

app.use('/api/users', userRouter);
app.use('/api/games', gameRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
});

app.get("*", (req, res) => {
    const indexPath = path.resolve(publicDirectoryPath, "index.html");
    res.sendFile(indexPath);
});

