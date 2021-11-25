document.addEventListener('DOMContentLoaded', () => {
  const user1Grid = document.querySelector('.grid-user')
  const user2Grid = document.querySelector('.grid-user2')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const destroyer = document.querySelector('.destroyer_')
  const submarine = document.querySelector('.submarine_')
  const battleship = document.querySelector('.battleship_')
  const carrier = document.querySelector('.carrier_')
  const startButton = document.querySelector('#start')
  const turnDisplay = document.querySelector('#turn')
  const infoDisplay = document.querySelector('#info')
  const multiPlayerButton = document.querySelector('#multiPlayerButton')
  const readyButton = document.querySelector('#ready')


//make sure it's not null
if(multiPlayerButton){
  multiPlayerButton.addEventListener('click',startMultiPlayer)
}

  const user1Squares = []
  const user2Squares = []

 
  let isGameOver = false
  let currentPlayer = 'user'
  let playerNum = 0
  let ready = false
  let enemyReady = false
  let shotFired = -1
  const width=10

  //const socket = io();

//Create Board
function createBoard(grid, squares) {
  for (let i = 0; i <100; i++) {
    const square = document.createElement('div')
    square.dataset.id = i
    grid.appendChild(square)
    squares.push(square)
  }
}
createBoard(user1Grid, user1Squares)
createBoard(user2Grid, user2Squares)

const shipArray = [
  {
    name: 'destroyer',
    directions: [
      [0, 1],
      [0, width]
    ]
  },
  {
    name: 'submarine',
    directions: [
      [0, 1, 2],
      [0, width, width*2]
    ]
  },
  {
    name: 'battleship',
    directions: [
      [0, 1, 2, 3],
      [0, width, width*2, width*3]
    ]
  },
  {
    name: 'carrier',
    directions: [
      [0, 1, 2, 3, 4],
      [0, width, width*2, width*3, width*4]
    ]
  },
]




//Multi
function startMultiPlayer() {

///NEED TO BE FIXED

  //generate p1 ships
  function generate(ship) {
    let randomDirection = Math.floor(Math.random() * ship.directions.length)
    let current = ship.directions[randomDirection]
    if (randomDirection === 0) direction = 1
    if (randomDirection === 1) direction = 10
    let randomStart = Math.abs(Math.floor(Math.random() * user1Squares.length - (ship.directions[0].length * direction)))
  
    const isTaken = current.some(index => user1Squares[randomStart + index].classList.contains('taken'))
    const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
    const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)
  
    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => user1Squares[randomStart + index].classList.add('taken', ship.name))
  
    else generate(ship)
  }
  generate(shipArray[0])
  generate(shipArray[1])
  generate(shipArray[2])
  generate(shipArray[3])

  //NEED TO BE FIXED

  //generate p2 ships
  function generate2(ship) {
    let randomDirection = Math.floor(Math.random() * ship.directions.length)
  let current = ship.directions[randomDirection]
  if (randomDirection === 0) direction = 1
  if (randomDirection === 1) direction = 10
  let randomStart = Math.abs(Math.floor(Math.random() * user2Squares.length - (ship.directions[0].length * direction)))

  const isTaken = current.some(index => user2Squares[randomStart + index].classList.contains('taken'))
  const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
  const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

  if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => user2Squares[randomStart + index].classList.add('taken', ship.name))

  else generate2(ship)
}
generate2(shipArray[0])
generate2(shipArray[1])
generate2(shipArray[2])
generate2(shipArray[3])


  //conncetion socket
  const socket =io();
// Get your player number 0=player1 , 1=player2
socket.on('player-number', num => {
    playerNum = parseInt(num)
    if(playerNum === 1) currentPlayer = "enemy"
    console.log(playerNum)

    // Get other player status
    socket.emit('check-players')
  
})

// On other player ready
 socket.on('enemy-ready', num => {
  enemyReady = true
  playerReady(num)
  if (ready) {
    playMulti(socket)
  }
 })

// Check player status (when we are ready before player 2 connects)
socket.on('check-players', players => {
  players.forEach((p, i) => {
    if(p.connected) connectedTurnsGreen(i)
    if(p.ready) {
      playerReady(i)
      if(i !== playerReady) enemyReady = true
    }
  })
})

//player connected
socket.on('player-connection', num => {
  connectedTurnsGreen(num)
})
function connectedTurnsGreen(num) {
  //add 1 to get the propper player
  let player = `.player${parseInt(num) + 1}`
  document.querySelector(`${player} .connected span`).classList.toggle('green')
  //specify which player we are
  if(parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
}
//Ready Button
readyButton.addEventListener('click', () => {
   playMulti(socket)
})

//FIRING METHODS

// Setup event listeners for firing
user2Squares.forEach(square => {
  square.addEventListener('click', () => {
    console.log("Fire Listener working")
    shotFired = square.dataset.id
    socket.emit('fire', shotFired)
   // console.log("data sent")
  })
})
 // On Fire Received
 socket.on('fire', id => {
  console.log("Fire receiver working")
  enemyGo(id)
  const square = user1Squares[id]
  socket.emit('fire-reply', square.classList)
  playMulti(socket)
})
// On Fire Reply Received
socket.on('fire-reply', classList => {
  console.log("Fire reply receiver working")
  revealSquare(classList)
  playMulti(socket)
})
}
//end of startMultiPlayer FUNC

  let user2DestroyerCount = 0
  let user2SubmarineCount = 0
  let user2BattleshipCount = 0
  let user2CarrierCount = 0  

function enemyGo(square) {
  if (!user1Squares[square].classList.contains('boom')) {
    const hit = user1Squares[square].classList.contains('taken')
    user1Squares[square].classList.add(hit ? 'boom' : 'miss')
    if (user1Squares[square].classList.contains('destroyer')) user2DestroyerCount++
    if (user1Squares[square].classList.contains('submarine')) user2SubmarineCount++
    if (user1Squares[square].classList.contains('battleship')) user2BattleshipCount++
    if (user1Squares[square].classList.contains('carrier')) user2CarrierCount++
    //checkForWins()
  } 
  currentPlayer = 'user'
  turnDisplay.innerHTML = 'Your Go'
}


//rev
  let destroyerCount = 0
  let submarineCount = 0
  let battleshipCount = 0
  let carrierCount = 0

  function revealSquare(classList) {
    console.log("Reveal working")
    const enemySquare = user2Grid.querySelector(`div[data-id='${shotFired}']`)
    const obj = Object.values(classList)
    if (!enemySquare.classList.contains('boom') && currentPlayer === 'user') {
      if (obj.includes('destroyer')) destroyerCount++
      if (obj.includes('submarine')) submarineCount++
      if (obj.includes('battleship')) battleshipCount++
      if (obj.includes('carrier')) carrierCount++
    }
    if (obj.includes('taken')) {
      enemySquare.classList.add('boom')
    } else {
      enemySquare.classList.add('miss')
    }
   // checkForWins()
    currentPlayer = 'enemy'
  }











// MultiPlayer
function playMulti(socket) {
  //if(isGameOver) return
  if(!ready) {
    socket.emit('player-ready')
    ready = true
    playerReady(playerNum)
  }
  //display turns
  if(enemyReady) {
    if(currentPlayer === 'user') {
      turnDisplay.innerHTML = 'Your Go'
    }
    if(currentPlayer === 'enemy') {
      turnDisplay.innerHTML = "Enemy's Go"
    }
  }
}
//change ready color
function playerReady(num) {
  let player = `.player${parseInt(num) + 1}`
  document.querySelector(`${player} .ready span`).classList.toggle('green')
}



  

})



  