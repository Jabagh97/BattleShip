const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 34000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

// Start server
server.listen(PORT, () => console.log(`Server running on  ${PORT}`))

// Handle a socket connection request from web client
const connections = [null, null]

io.on('connection', socket => {
   console.log('New Connection')

  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // sending the player number to the connecting players
  socket.emit('player-number', playerIndex)

  console.log(`Player ${playerIndex} has connected`)

  
  connections[playerIndex] = false
  socket.broadcast.emit('player-connection', playerIndex)


  // On Ready connction listener
  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  // Check connections
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
    }
    socket.emit('check-players', players)
  })

  // On Fire Received
  socket.on('fire', id => {
    console.log(`Shot fired from ${playerIndex}`, id)

    // Emit the move to the other player
    socket.broadcast.emit('fire', id)
    console.log("sent back perfectly")
  })

  // on Fire Reply
  socket.on('fire-reply', square => {
    console.log(square)

    // reply to the other player
    socket.broadcast.emit('fire-reply', square)
  })
})