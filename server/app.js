//Librerías 
const express = require('express');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const path = require('path');

//Enrutadores
const caballos = require('./routes/caballos');
const auth = require('./routes/auth');
const admin = require('./routes/admin');

//Conexión con la BD
mongoose.connect('mongodb://127.0.0.1:27017/wildride')
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Error MongoDB:', err));

//Servidor Express
let app = express();

//Configuramos motor Nunjucks (ruta absoluta para que funcione desde cualquier directorio)
nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app
});

//Asignación del motor de plantillas
app.set('view engine', 'njk');

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); //para PUT y DELETE desde formularios html
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

//Enrutadores
app.use('/caballos', caballos);
app.use('/admin', admin);

// Puesta en marcha del servidor
app.listen(8080);