require('dotenv').config()

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const db = require("./src/db")
const { verifyJWT } = require("./middlewares/checkUserValidity")

const router = require("./routes/RouteHandler")

const HOSTNAME = "localhost"
const PORT = 3000

app.use( express.json() );
app.use( bodyParser.json() );  
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static('public'))
app.set("view engine", "ejs")
app.set("views", "views")
app.use(cookieParser());


app.get('/', (req, res) => {
  res.redirect("/home")
});

app.use(router)


const homeSocket = io.of("/home")
homeSocket.use(async (socket,next) => {
  const jwt = socket.request._query["jwt_token"];
  try {
    const decodedToken = await verifyJWT(jwt);
    console.log(decodedToken);
    next()
  } catch (error) {
    console.log(error);
    io.of("/home").in(socket.id).emit("new_msg", {msg: "user_not_valid"})
  }
  
})


homeSocket.on('connection', (socket) => {
  socket.on("user-connected", async (username, userID) => {


    try {

      // create ActiveUsers Table in DB
      await db.registerActiveUser(userID, socket.id)

      // join a room name after its socket id
      socket.join(socket.id)
      console.log(`User ${username} userID: ${userID} connected with socket id : ${socket.id}`);

    } catch (error) {

      // if user id is already present in ActiveUsers Table
      if (error.code === 'ER_DUP_ENTRY') {
        io.of("/home").in(socket.id).emit("new_msg", {msg: "already_logged_in"})
      }
      else{
        io.of("/home").in(socket.id).emit("new_msg", {msg: "something_went_wrong"})
      }
     
    }

    socket.on("connect-to-user", async (socketID) => {
      console.log("connect-to-user", socketID);
      // io.sockets.in(socketID).emit("conn_req", {msg: `${username} wants to connect.`})
      io.of("/home").in(socketID).emit("conn_req", {msg: `${username} wants to connect.`})
    })

    socket.on("disconnect", () => {
      console.log(`user ${username} disconnected with id ${socket.id}`);

      try {
        db.deRegisterActiveUser(userID)
      } catch (error) {
        console.log(error);
      }

    })
  })

});


server.listen(PORT, HOSTNAME,() => {
  console.log(`listening on http://${HOSTNAME}:${PORT}`);
});
