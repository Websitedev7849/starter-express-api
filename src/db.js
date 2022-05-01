const mysql = require('mysql');

function getConnection() {
    return mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });
}


function isUserAlreadyExist(username) {

    const con = getConnection()

    const sql = `SELECT * FROM users WHERE username = '${username}'`

    return new Promise(function (res, rej) {
        
        // query the connection
        con.query(sql, function (err, result) {
            if (err) throw err;
            
          //   end connection
            con.end()

            // resolve false if record exists
            if (result.length == 0) {
                res(false)
            }
            
            // resolve true if record does not exists
            res(true)
        });
    

    })
}

module.exports = {isUserAlreadyExist}