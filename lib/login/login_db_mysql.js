// login_db_mysql
// Manejo del login de acceso a la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var util = require("util"); // librería de utilidades de node

//  leer la configurción de MySQL
var config = require("../../configMySQL.json");
var sql = "";

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port
});



module.exports.GetLogin = function(login, password, callback) {
    usuario = null;
    pool.getConnection(function(err, connection) {
        if (err) {
            callback(err);
            return;
        }
        sql = "SELECT codusu AS CodUsu, nomusu AS NomUsu, u.login AS login, u.passwordpropio AS PasswordPropio, st.codtraba AS CodTraba"
        sql += util.format(" FROM %s.usuarios AS u", config.database_usuarios);
        sql += util.format(" LEFT JOIN %s.straba AS st ON st.login = u.login", config.database_ariges);
        sql += " WHERE u.login = ? and u.passwordpropio = ?"
        sql = mysql.format(sql, [login, password]);
        connection.query(sql, function(err, regs) {
            connection.release();
            if (err) {
                callback(err, null);
                return;
            }
            if (regs.length == 0) {
                callback(null, null);
                return;
            }
            callback(null, regs[0]);
        });
    });
};
