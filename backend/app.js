import Express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import { Server } from 'socket.io';
import 'dotenv/config';
import userRouter from './routes/users.js';
import gameRouter from './routes/games.js';

await mongoose.connect(process.env.MONGO_URI);

const app = Express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Express Session Config
app.use(session({
    secret: 'linkedin mastermind2 password',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: app.get('env') === 'production'}
}));

app.use('/api/users', userRouter);
app.use('/api/games', gameRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})