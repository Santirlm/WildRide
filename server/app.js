//Librerías 
const express = require('express');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');

//Enrutadores
const caballos = require('./routes/caballos');
const auth = require('./routes/auth');

//Conexión con la BD
mongoose.connect('mongodb://127.0.0.1:27017/wildride')
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Error MongoDB:', err));

//Servidor Express
let app = express();

//Configuramos motor Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

//Asignación del motor de plantillas
app.set('view engine', 'njk');

// Middleware para peticiones POST y PUT
// Middleware para estilos Bootstrap
// Enrutadores para cada grupo de rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

app.use('/caballos', caballos);

// Puesta en marcha del servidor
app.listen(8080);