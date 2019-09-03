//=======================================
// ariges_inv_node (index.js)
// API y Servidor aplicación de inventario
// para el programa AriGes.
//========================================
// Author: Rafael Garcia (rafa@myariadna.com)
// 2015 [License CC-BY-NC-4.0]

// required modules
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

// read app parameters (host and port for the API)
var config = require('./config.json');


// gestores de rutas
var login_router = require('./lib/login/login_controller');
var inventario_router = require('./lib/inventario/inventario_controller');


// starting express
var app = express();
// to parse body content
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// using cors for cross class
app.use(cors());

// servidor html estático
app.use(express.static(__dirname+"/public"));

// mounting routes
var router = express.Router();

// -- common to all routes
router.use(function(req, res, next) {
    // go on (by now)
    next();
});

// -- general GET (to know if the server is up and runnig)
router.get('/', function(req, res) {
    res.json('AriGesInv API / SERVER -- runnig');
});

// -- registering routes
app.use('/api', router);
app.use('/api/login', login_router);
app.use('/api/inventario', inventario_router);


// -- start server
app.listen(config.apiPort);

// -- console message
console.log('ARIGES INVENTARIO API / SERVER on port: ' + config.apiPort);

