var express = require('express');
var router = express.Router();
var inventarioDb = require("./inventario_db_mysql");

//
router.post('/GetArticuloEan', function(req, res){
	var ean = req.body.ean;
	if (!ean){
		return res.status(400).send('Parámetros incorrectos.');
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
		return res.status(400).send('Parámetros incorrectos.');
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
router.post('/SetInventario', function(req, res){
	var codartic = req.body.codartic;
	var codalmac = req.body.codalmac;
	var stock = req.body.stock;
	var cantidad = req.body.cantidad;
	var importe = req.body.importe;
	var codigope = req.body.codigope;
	if (!codartic || !codalmac || !cantidad  || !codigope){
		return res.status(400).send('Parámetros incorrectos.');
	}
	inventarioDb.SetInventario(codartic, codalmac, stock, cantidad, importe, codigope, function(err, reg){
		if (err){
			res.status(500).send(err.message);
		}else{
			res.json(reg);
		}
	});
});



//
module.exports = router;