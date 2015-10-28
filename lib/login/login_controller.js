var express = require('express');
var router = express.Router();
var loginDb = require("./login_db_mysql");

//
router.post('/GetLogin', function(req, res){
	var login = req.body.login;
	var password = req.body.password;
	if (!login || !password){
		res.status(400).send('Parámetros incorrectos.');
	}
	loginDb.GetLogin(login, password, function(err, reg){
		if (err){
			res.status(500).send(err.message);
		}else{
			res.json(reg);
		}
	});
});


//
module.exports = router;