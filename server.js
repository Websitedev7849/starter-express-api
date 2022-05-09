require('dotenv').config()

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const db = require("./src/db")
const { checkUserValidity } = require("./middlewares/checkUserValidity")


const HOSTNAME = "localhost"
const PORT = 3000
const MAX_AGE = 5 * 60 * 60 * 1000 // 5 Hours

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

app.get("/login", (req,res) => {

  // render if redirected from /signup
  // url = ../login?accountsignup=true
  if (req.query.accountsignup) {
    res.render("login", {accountCreated: true, error: undefined})
    return
  }

  res.render("login", {accountCreated: undefined, error: undefined})
})

app.post("/login", async (req,res) => {
  
  try {

    const {id, username} = await db.isUserValid(req.body.username, req.body.password)
    
    // generate JWT for user
    const JWT = jwt.sign( {id, username} , process.env.JWT_SECRET_KEY, {
      expiresIn: "5h"
    })

    res.cookie("jwt", JWT, {
      maxAge: MAX_AGE
    }).redirect("/home")

  } catch (error) {

    if (error == "Username or Password is Wrong") {
      res.render("login", {accountCreated: undefined, error: error})      
    }
    else {
      res.render("login", {accountCreated: undefined, error: "Something went wrong"})   
    }
  }

})

app.get("/home", checkUserValidity, (req, res) => {
  res.render("home")
})

app.get("/signup", (req,res) => {
  res.render("signup", {username: undefined, password: undefined, confirmPassword: undefined, error: undefined})
})

app.post("/signup", async (req, res) => {

  // console.log(req.body); // { username: 'Siddharth', password: '123', confirmPassword: '123' }

  // check if username is entered
  if (req.body.username == "") {
    res.render("signup", { username: "Not Valid", password: undefined, confirmPassword: undefined, error: undefined })
    return
  }

  // check if passwords are entered
  if (req.body.password == "" ||
    req.body.confirmPassword == "") {
    res.render("signup", {username: req.body.username, password: "Not Valid", confirmPassword: "Not Valid", error: undefined   })
    return
  }

  // check if both passwords are same or not
  if (req.body.password &&
    req.body.confirmPassword &&
    req.body.password !== req.body.confirmPassword) {
    res.render("signup", {username: req.body.username, password: "No Match", confirmPassword: "No Match", error: undefined  })
    return
  }
  
  // check if username already exists in database 
  if (await db.isUserAlreadyExist(req.body.username)) {
    res.render("signup", { username: "Already Exists", password: undefined, confirmPassword: undefined, error: undefined  })
    return
  }
  
  try {
    // register user in database
    const { id, username } = await db.createUser(req.body.username, req.body.password)

    // generate JWT for user
    const JWT = jwt.sign({id, username}, process.env.JWT_SECRET_KEY, {
      expiresIn: "5h"
    })

    res.cookie("jwt", JWT, {
      maxAge: MAX_AGE
    }).redirect("/home")


  } catch (error) {
    console.log(error);
    res.status(500).render("signup", { username: undefined, password: undefined, confirmPassword: undefined, error: "Something went wrong"  })
  }

})

app.post("/isUserActive", checkUserValidity ,async (req, res) => {
  const {username} = req.body;
  try {
    const socketInfo = await db.isUserActive(username)
    // socketInfo = [
    //   RowDataPacket {
    //     id: 'dc2fb90d3e748e12caea',
    //     username: 'Dean_Winchester',
    //     socketID: 'QpLLr3tGk_ENi22WAAAD'
    //   }
    // ]


    if (socketInfo.length == 0) { // if user is not online
      res.status(404).send({
        id: "",
        username: username,
        socketID: ""
      })
    }

    else {
      res.status(200).send(socketInfo[0])
    }

  } catch (error) {
    console.log(error);
    res.end(error)
  }
})

io.on('connection', (socket) => {
  socket.on("user-connected", async (username, userID) => {

    console.log(`User ${username} userID: ${userID} connected with socket id : ${socket.id}`);

    try {

      // create ActiveUsers Table in DB
      await db.registerActiveUser(userID, socket.id)

      // join a room name after its socket id
      socket.join(socket.id)
    } catch (error) {

      // if user id is already present in ActiveUsers Table
      if (error.code === 'ER_DUP_ENTRY') {
        io.sockets.in(socket.id).emit("new_msg", {msg: "already_logged_in"})
      }
      else{
        io.sockets.in(socket.id).emit("new_msg", {msg: "something_went_wrong"})
      }
     
    }

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
