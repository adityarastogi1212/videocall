const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')



const PORT = process.env.PORT || 3000;

const eurekaHelper = require('./eureka-helper.js');
eurekaHelper.registerWithEureka('camera-service', PORT)

app.get('/camera/link',(req,res)=>{
    //  window.open("http://localhost:3000/")
    res.json(`${uuidV4()}`)
  })

app.get('/cameratest', (req, res) => {
    res.json("I am camera-service")
   })



app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/camera', (req, res) => {
   // res.redirect(`http://localhost:3000/${uuidV4()}`)
   res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)