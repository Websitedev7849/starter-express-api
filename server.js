const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const HOSTNAME = "localhost"
const PORT = 3000

app.use(express.static('public'))
app.set("view engine", "ejs")
app.set("views", "views")


app.get('/', (req, res) => {
  res.redirect("/login")
});

app.get("/login", (req,res) => {
  res.render("login")
})

app.get("/signup", (req,res) => {
  res.render("signup")
})

io.on('connection', (socket) => {
  console.log("userconnected");
});



server.listen(PORT, HOSTNAME,() => {
  console.log(`listening on ${HOSTNAME}:${PORT}`);
});