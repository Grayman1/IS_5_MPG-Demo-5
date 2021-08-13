/*require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
//const expect = require("chai");
const socket = require("socket.io");
const helmet = require("helmet");
const nocache = require("nocache");
const cors = require("cors");

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

const app = express();

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
//app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

app.use(nocache());

app.use(cors({ origin: "*" }));

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/assets", express.static(process.cwd() + "/assets"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//app.use(express.urlencoded({ extended: true }));
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));



// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

// socket.io setup
// Start app and bind
// socket.io to the same port
const io = socket(server);
const Collectible = require('./public/Collectible');
const {generateStartPos, canvasCalcs} = require('./public/canvas-data');


let currPlayers = [];
let destroyedCoins = [];


// Generate new Coin
const generateCoin = () => {
  const rand = Math.random();
  let coinValue;

  if (rand < 0.25) {
    coinValue = 1;
  } else if (rand < 0.50) {
    coinValue = 2;
  } else if (rand < 0.75) {
    coinValue = 3;
  } else {
    coinValue = 4;
  }

  return new Collectible({
    x: generateStartPos(
      canvasCalcs.playFieldMinX,
      canvasCalcs.playFieldMaxX,
      5
    ),
    y: generateStartPos(
      canvasCalcs.playFieldMinY,
      canvasCalcs.playFieldMaxY,
      5
    ),
    value: coinValue,
    id: Date.now(),
  });
};

let coin = generateCoin();

// Inital Set-Up
io.sockets.on("connection", (socket) => {
  console.log(`New Connection: ${socket.id}`);
  //Initial Player Set-Up
  socket.emit("init", {id: socket.id, players: currPlayers, coin});

// Handle Add Player
  socket.on("new-player", (obj) => {
    obj.id = socket.id;
    currPlayers.push(obj);
    socket.broadcast.emit("new-player", obj);
  });

  // Handle Player Moves
  socket.on("move-player", (dir, obj) => {
    const movingPlayer = currPlayers.find((player) => player.id === socket.id);
    if (movingPlayer) {
      movingPlayer.x = obj.x;
      movingPlayer.y = obj.y;

      socket.broadcast.emit("move-player", {
        id: socket.id,
        dir,
        posObj: {x: movingPlayer.x, y: movingPlayer.y}
      });
    }
  });

  // Handle Player Stop Movement
  socket.on("stop-player", (dir, obj) => {
    const stoppingPlayer = currPlayers.find((player) => player.id === socket.id );
    if (stoppingPlayer) {
      stoppingPlayer.x = obj.x,
      stoppingPlayer.y = obj.y,

      socket.broadcast.emit("stop-player", {
        id: socket.id,
        dir,
        posObj: {x: stoppingPlayer.x, y: stoppingPlayer.y}
      });
    }
  });

  // Handle Item Destroyed
  socket.on("destroy-item", ({playerId, coinValue, coinId}) => {
    if (!destroyedCoins.includes(coinId)) {
      const scoringPlayer = currPlayers.find((obj) => obj.id === playerId );
      const sock = io.sockets.connected[scoringPlayer.id];

      scoringPlayer.score += coinValue;
      destroyedCoins.push(coinId);

      // Broadcast to all players when someone scores
      io.emit("update-player", scoringPlayer);

      // Communicate win state and broadcast losses
      if (scoringPlayer.score >= 100) {
        sock.emit("end-game", "win");
        sock.broadcast.emit("end-game", "lose")
      }

      // Generate  New Coin
      coin = generateCoin();
      io.emit("new-coin", coin);
    }
  });
  
  // Handle Disconnect Player
  socket.on("disconnect", () => {
    console.log(`Player disconnected on: ${socket.id}`);
    socket.broadcast.emit("remove-player", socket.id);
    currPlayers = currPlayers.filter((player) => player.id !== socket.id);
  });

})

module.exports = app; // For testing
*/


require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const socket = require("socket.io");
const helmet = require("helmet");
const nocache = require("nocache");
const cors = require('cors');

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

const app = express();

app.use(
  helmet({
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: {
      setTo: "PHP 7.4.3",
    }
  })
);

app.use(nocache());

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/assets", express.static(process.cwd() + "/assets"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

// Socket.io setup:
// Start app and bind
// Socket.io to the same port
const io = socket(server);
const Collectible = require("./public/Collectible");
const { generateStartPos, canvasCalcs } = require("./public/canvas-data");

let currPlayers = [];
const destroyedCoins = [];

const generateCoin = () => {
  const rand = Math.random();
  let coinValue;

  if (rand < 0.6) {
    coinValue = 1;
  } else if (rand < 0.85) {
    coinValue = 2;
  } else {
    coinValue = 3;
  }

  return new Collectible({
    x: generateStartPos(
      canvasCalcs.playFieldMinX,
      canvasCalcs.playFieldMaxX,
      5
    ),
    y: generateStartPos(
      canvasCalcs.playFieldMinY,
      canvasCalcs.playFieldMaxY,
      5
    ),
    value: coinValue,
    id: Date.now(),
  });
};

let coin = generateCoin();

// on Connection, Expect main socket
io.sockets.on("connection", (socket) => {
  console.log(`New connection ${socket.id}`);

  // Emit init with socket id for client to create Player
  socket.emit("init", { id: socket.id, players: currPlayers, coin });

  socket.on("new-player", (obj) => {
    obj.id = socket.id;
    currPlayers.push(obj);
    socket.broadcast.emit("new-player", obj);
  });

  socket.on("move-player", (dir, obj) => {
    const movingPlayer = currPlayers.find((player) => player.id === socket.id);
    if (movingPlayer) {
      movingPlayer.x = obj.x;
      movingPlayer.y = obj.y;

      socket.broadcast.emit("move-player", {
        id: socket.id,
        dir,
        posObj: { x: movingPlayer.x, y: movingPlayer.y },
      });
    }
  });

  socket.on("stop-player", (dir, obj) => {
    const stoppingPlayer = currPlayers.find(
      (player) => player.id === socket.id
    );
    if (stoppingPlayer) {
      stoppingPlayer.x = obj.x;
      stoppingPlayer.y = obj.y;

      socket.broadcast.emit("stop-player", {
        id: socket.id,
        dir,
        posObj: { x: stoppingPlayer.x, y: stoppingPlayer.y },
      });
    }
  });

  socket.on("destroy-item", ({ playerId, coinValue, coinId }) => {
    if (!destroyedCoins.includes(coinId)) {
      const scoringPlayer = currPlayers.find((obj) => obj.id === playerId);
      const sock = io.sockets.connected[scoringPlayer.id];

      scoringPlayer.score += coinValue;
      destroyedCoins.push(coinId);

      // Broadcast to all players when someone scores
      io.emit("update-player", scoringPlayer);

      // Communicate win state and broadcast losses
      if (scoringPlayer.score >= 10) {
        sock.emit("end-game", "win");
        sock.broadcast.emit("end-game", "lose");
      }

      // Generate new coin and send it to all players
      coin = generateCoin();
      io.emit("new-coin", coin);
    }
  });

  // Handle Game Reset Request
  socket.on('reset-request', () => {
    console.log('reset-request sent');
    console.log("end-game-server.js:", endGame)
    if (!endGame == '') {
      endGame == '';

    // Reset Players
      currPlayers.forEach(obj => {
        if (Number.isInteger(obj.id)) {
        //  let startCoords = defaultPlayerStart(obj.id);
          obj.x = generateStartPos(
            canvasCalcs.playFieldMinX,
            canvasCalcs.playFieldMaxX,
            5
          );
          obj.y = generateStartPos(
            canvasCalcs.playFieldMinY,
            canvasCalcs.playFieldMaxY,
            5
          );
          obj.score = 0;
        }
      })
      // Send out New Game State Info
      io.emit('new-game', currPlayers)
    }
    else {
      console.log("Reset requested but game isn't over yet");
    }
  })


  // Listen on Player Disconnecting
  socket.on("disconnect", () => {
    socket.broadcast.emit("remove-player", socket.id);
    console.log(`${socket.id} Player disconnected`);

    // Remove Disconnected Player from Active Player array
    currPlayers = currPlayers.filter((player) => player.id !== socket.id);
  });
});

module.exports = app; // For testing
