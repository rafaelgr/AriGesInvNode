var express = require('express');
var router = express.Router();
var inventarioDb = require("./inventario_db_mysql");

//
router.post('/GetArticuloEan', function(req, res){
	var ean = req.body.ean;
	if (!ean){
		res.status(400).send('Parámetros incorrectos.');
	}
	inventarioDb.GetArticuloEan(ean, function(err, regs){
		if (err){
			res.status(500).send(err.message);
		}else{
			var articulo = null;
			if (regs && regs.length > 0) {
				articulo = regs[0];
			}
			res.json(articulo);
		}
	});
});

//
router.post('/GetArticulosEan', function(req, res){
	var ean = req.body.ean;
	if (!ean){
		res.status(400).send('Parámetros incorrectos.');
	}
	inventarioDb.GetArticuloEan(ean, function(err, regs){
		if (err){
			res.status(500).send(err.message);
		}else{
			var articulos = null;
			if (regs && regs.length > 0) {
				articulos = regs;
			}			
			res.json(articulos);
		}
	});
});



//
module.exports = router;