const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');


const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.port || 3000;

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));


io.on('connection', (socket) => {
    console.log('New connection');
    socket.emit('message', 'Welcome to the chat room!')
    socket.broadcast.emit('message', 'A new user has connected!')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        io.emit('message', message);
        callback();
    });

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`)
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', 'User has disconnected!');
    })

});




server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});