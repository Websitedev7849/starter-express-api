require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const db = require("./src/db")


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


app.get('/', (req, res) => {
  res.redirect("/login")
});

app.get("/login", (req,res) => {
  res.render("login")
})

app.get("/signup", (req,res) => {
  res.render("signup", {username: undefined, password: undefined, confirmPassword: undefined})
})

app.post("/signup", async (req, res) => {

  // console.log(req.body); // { username: 'Siddharth', password: '123', confirmPassword: '123' }

  // check if username is entered
  if (req.body.username == "") {
    console.log("render 1");
    res.render("signup", { username: "Not Valid", password: undefined, confirmPassword: undefined })
    return
  }

  // check if passwords are entered
  if (req.body.password == "" ||
    req.body.confirmPassword == "") {
    console.log("render 2");
    res.render("signup", {username: req.body.username, password: "Not Valid", confirmPassword: "Not Valid" })
    return
  }

  // check if both passwords are same or not
  if (req.body.password &&
    req.body.confirmPassword &&
    req.body.password !== req.body.confirmPassword) {
    console.log("render 2");
    res.render("signup", {username: req.body.username, password: "No Match", confirmPassword: "No Match" })
    return
  }
  
  // check if username already exists in database 
  if (await db.isUserAlreadyExist(req.body.username)) {
    res.render("signup", { username: "Already Exists", password: undefined, confirmPassword: undefined })
    return
  }
  
  res.redirect("/")

})

io.on('connection', (socket) => {
  console.log("userconnected");
});



server.listen(PORT, HOSTNAME,() => {
  console.log(`listening on http://${HOSTNAME}:${PORT}`);
});
