const express = require('express')
const app = express();
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors')
const fs = require('fs');
const dataURLtoBlob = require('dataurl-to-blob');

app.use(cors())

const connectedUsers = {};
const server = http.createServer(app)
const io = new Server(server, { 
    maxHttpBufferSize: 1e8,
    cors: {
        origin: 'https://photo-upload-smoky.vercel.app',
        methods: ['GET','POST']
    }
})
app.get('/',(req,res)=>{
    res.json('On live!')
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
server.listen(3001, () => {
  console.log('Server is running');
});
