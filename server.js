const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const compression = require('compression')
const PORT = process.env.PORT || 3000
let data = [[], []]

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(compression({
    level: 6,
    threshold: 0,
}))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomID, userID) => {
        socket.join(roomID)

        data[0].push(socket.id)
        data[1].push(roomID)

        let userData = socket.id + " " + roomID
        io.to(socket.id).emit('name room', userData)
        // socket.to(roomId).emit('user-connected', userId)

        socket.on('send object', function (objectJSON) {
            socket.to(roomID).emit('get object', objectJSON)
        })

        // socket.on('get board', function (reuqester) {
        //     let requesterRoom = reuqester.substring(21, 57)
        //     if (data[0].length != 1) {
        //         let matchingIndexes = []
        //         data[1].forEach((currentItem, index) => {
        //             currentItem === requesterRoom ? matchingIndexes.push(index) : null
        //         })
        //         if (matchingIndexes.length != 1) {
        //             let mateString = matchingIndexes[0]
        //             let mateID = data[0][mateString]
        //             let requesterID = reuqester.substring(0, 20)
        //             io.to(mateID).emit('get requester', requesterID)
        //         }
        //     }
        // })

        // socket.on('send board', (requesterID, previousJSON) => {
        //     io.to(requesterID).emit('get board', previousJSON)
        // })

        socket.on('send command', function (command) {
            socket.to(roomID).emit('get command', command)
        })

        socket.on('disconnect', () => {
            socket.to(roomID).emit('user-disconnected', userID)
            let user = data[0].indexOf(socket.id)
            let room = data[1].indexOf(roomID)
            data[0].splice(user, 1)
            data[1].splice(room, 1)
        })
    })
})

server.listen(PORT, () => {
    console.log('Running on port ' + PORT)
})

// socket.on('new user', (usr) => {
//     socket.username = usr;
//     console.log('Подключился пользователь - Имя: ' + socket.username);
// });