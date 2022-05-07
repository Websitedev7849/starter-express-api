const jwt = require("jsonwebtoken")

module.exports.checkUserValidity = function (req, res, next) {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect("/login")
            }
            else {
                // console.log(decodedToken);
                res.locals.username = decodedToken.username
                res.locals.userID = decodedToken.id
                next()
            }
        })
    }
    else {
        res.redirect("/login")
    }

    
}