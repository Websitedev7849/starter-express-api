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

function createUser(username, password) {

    const con = getConnection()

    const sql = `INSERT INTO users(username, password) VALUES ("${username}", "${password}");`

    return new Promise(function (res, rej) {
        
        // query the connection
        con.query(sql, function (err, result) {
            if (err) rej(err);
            
            con.end()
            res(true)
          
        });
    

    })
}

function isUserValid(username, password) {
    return new Promise(async function (res, rej) {
     
        const sql = `SELECT * FROM users WHERE username="${username}" AND password="${password}";`
        const con = getConnection()

        con.query(sql, function (err, result) {
            if (err) rej(err);
                        
            // result: [
            //     RowDataPacket { id: 1, username: 'siddharth04', password: '123456' }
            // ]
            con.end()
            
            if (result.length !== 0) {
                res(true)
            }
            else{
                rej("Username or Password is Wrong")
            }
          
        });

    })
}

module.exports = {
    isUserAlreadyExist,
    createUser,
    isUserValid
}