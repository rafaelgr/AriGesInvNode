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



module.exports.GetArticuloEan = function(ean, callback) {
    usuario = null;
    pool.getConnection(function(err, connection) {
        if (err) {
            callback(err);
            return;
        }
        sql = "SELECT";
        sql += " art.codartic AS CodigoArticulo,";
        sql += " COALESCE(ar3.codigoea,'') AS CodigoEan,";
        sql += " COALESCE(alm.statusin, 0) AS 'Status',";
        sql += " art.nomartic AS NombreArticulo,";
        sql += " art.codigiva AS CodigoIva,";
        sql += " piva.porceiva AS PorceIva,";
        sql += " art.preciove AS PrecioSinIva,";
        sql += " FORMAT((art.preciove + (art.preciove * piva.porceiva) /100),4) AS PrecioConIva,";
        sql += " COALESCE(art.preciomp,0) AS PrecioMp,";
        sql += " COALESCE(art.precioma,0) AS PrecioMa,";
        sql += " COALESCE(art.preciouc,0) AS PrecioUc,";
        sql += " COALESCE(art.preciost,0) AS PrecioSt,";
        sql += " alm.codalmac AS CodigoAlmacen,";
        sql += " alp.nomalmac AS NombreAlmacen,";
        sql += " alm.canstock AS Stock";
        sql += " FROM ariges99.sartic AS art";
        sql += " LEFT JOIN ariges99.sarti3 AS ar3 ON ar3.codartic = art.codartic";
        sql += " LEFT JOIN ariges99.salmac AS alm ON alm.codartic = art.codartic";
        sql += " LEFT JOIN ariges99.salmpr AS alp ON alp.codalmac = alm.codalmac";
        sql += " LEFT JOIN conta1.tiposiva AS piva ON piva.codigiva = art.codigiva";
        sql += " WHERE ar3.codigoea = ?";
        sql = mysql.format(sql, [ean]);
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
            callback(null, regs);
        });
    });
};
