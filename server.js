const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const HOSTNAME = "localhost"
const PORT = 3000

app.use(express.static('public'))
// app.use("view engine", "ejs")

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

app.get("/home", (req,res) => {
  app.render("/home.html")
})

io.on('connection', (socket) => {
  console.log("userconnected");
});



server.listen(PORT, HOSTNAME,() => {
  console.log(`listening on ${HOSTNAME}:${PORT}`);
});