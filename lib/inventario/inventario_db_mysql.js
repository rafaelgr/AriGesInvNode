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
        sql += util.format(" FROM %s.sartic AS art", config.database_ariges);
        sql += util.format(" LEFT JOIN %s.sarti3 AS ar3 ON ar3.codartic = art.codartic", config.database_ariges);
        sql += util.format(" LEFT JOIN %s.salmac AS alm ON alm.codartic = art.codartic", config.database_ariges);
        sql += util.format(" LEFT JOIN %s.salmpr AS alp ON alp.codalmac = alm.codalmac", config.database_ariges);
        sql += util.format(" LEFT JOIN %s.tiposiva AS piva ON piva.codigiva = art.codigiva", config.database_conta);
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

module.exports.SetInventario = function(codartic, codalmac, stock, cantidad, importe, codigope, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            callback(err);
            return;
        }
        // SetShinve
        sql = util.format("INSERT IGNORE INTO %s.shinve(codartic, codalmac, fechainv, horainve, existenc)", config.database_ariges);
        sql += util.format(" SELECT codartic, codalmac, fechainv, horainve, stockinv FROM %s.salmac", config.database_ariges);
        sql += " WHERE codartic = ? AND codalmac = ?";
        sql = mysql.format(sql, [codartic, codalmac]);
        connection.query(sql, function(err, reg) {
            if (err) {
                return connection.rollback(function() {
                    callback(err);
                });
            }
            // SetSmoval
            var diferencia = cantidad - stock;
            var tipomovi = 1;
            if (diferencia < 0) {
                diferencia = -diferencia;
                tipomovi = 0;
            }
            sql = util.format("INSERT INTO %s.smoval (codartic, codalmac, fechamov, horamovi, tipomovi, detamovi, impormov, codigope, letraser, document, numlinea, cantidad)", config.database_ariges);
            sql += " VALUES( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? )";
            sql = mysql.format(sql, [codartic, codalmac, new Date(), new Date(), tipomovi, 'DFI', (diferencia * importe), codigope, '', 'LECTOR', 1, diferencia]);
            connection.query(sql, function(err, reg) {
                if (err) {
                    return connection.rollback(function() {
                        callback(err);
                    });
                }
                // SetSalmac
                sql = util.format("UPDATE %s.salmac SET", config.database_ariges);
                sql += " canstock = ?, statusin=0, stockinv=?, fechainv=?, horainve=?";
                sql += " WHERE codartic = ? AND codalmac = ?"
                sql = mysql.format(sql, [cantidad, cantidad, new Date(), new Date(), codartic, codalmac]);
                connection.query(sql, function(err, reg) {
                    if (err) {
                        return connection.rollback(function() {
                            callback(err);
                        });
                    }
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                callback(err);
                            });
                        }
                        callback(null, "*");
                    });
                });
            });
        });

    });

};
