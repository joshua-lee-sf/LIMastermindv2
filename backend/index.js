import {Server} from 'socket.io';

import Express from 'express';
import http from 'http';

const app = Express();
const server = http.createServer(app)
const io = new Server(server);

app.get('/', (req, res) => {
    res.send('Hello, World!')
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});