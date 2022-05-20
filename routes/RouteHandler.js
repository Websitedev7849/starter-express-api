const jwt = require("jsonwebtoken");
const db = require("../src/db")

const express = require("express");
const router = express.Router();


const {checkUserValidity} = require("../middlewares/checkUserValidity")
const MAX_AGE = 5 * 60 * 60 * 1000 // 5 Hours

router.get("/login", (req,res) => {

    // render if redirected from /signup
    // url = ../login?accountsignup=true
    if (req.query.accountsignup) {
      res.render("login", {accountCreated: true, error: undefined})
      return
    }
  
    res.render("login", {accountCreated: undefined, error: undefined})
})
  
router.post("/login", async (req,res) => {
    
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
      console.log(error);
      res.render("login", {accountCreated: undefined, error: "Something went wrong"})   
    }
  }
  
})
  
router.get("/home", checkUserValidity, (req, res) => {
  res.render("home")
})
  
router.get("/signup", (req,res) => {
  res.render("signup", {username: undefined, password: undefined, confirmPassword: undefined, error: undefined})
})
  
router.post("/signup", async (req, res) => {
  
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
  
router.post("/isUserActive", checkUserValidity ,async (req, res) => {
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

module.exports = router