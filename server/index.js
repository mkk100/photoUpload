const express = require('express')
const app = express();
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors')
const fs = require('fs');
const dataURLtoBlob = require('dataurl-to-blob');
const path = require('path')
app.use(cors())

app.use(express.static(path.join(__dirname, '/client/dist')));

const connectedUsers = {};
const server = http.createServer(app)
const io = new Server(server, { 
    maxHttpBufferSize: 1e8,
    cors: {
        origin: ["http://localhost:5173","https://photoupload-58cf3.web.app"],
        methods: ['GET','POST']
    }
})
io.on('connection',(socket)=>{
    socket.on('submitImg', (data)=>{
        io.emit('sentImg',data)
    })
    socket.on("join_room", (data) => {
        socket.join(data);
      });
    socket.on('del_image',(data)=>{
        io.emit('updated',data)
    })
    socket.on('sendUser',(data)=>{
        connectedUsers[socket.id] = data;
        io.emit('username',data)
        console.log(connectedUsers)
    })
})
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist','index.html')); // Serve index.html for all unmatched routes
  });

server.listen(3001, () => {
  console.log('Server is running');
});
