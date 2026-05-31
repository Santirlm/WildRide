//librerias
const express = require('express');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');

//enrutadores
const caballos = require('./routes/caballos');
const auth = require('./routes/auth');
const admin = require('./routes/admin');

//middleware de auth
const { protegerRutas } = require('./auth/auth');

//conexion mongodb
mongoose.connect('mongodb://127.0.0.1:27017/wildride')
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Error MongoDB:', err));

let app = express();

//nunjucks con ruta absoluta
nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk');

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser()); //para leer las cookies con el token
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

// pasa el usuario a todas las vistas
// asi en base.njk podemos hacer {% if user.rol == 'admin' %}
app.use((req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const { verifyToken } = require('./auth/auth');
            req.user = verifyToken(token);
        }
    } catch (err) {
        req.user = null;
    }
    res.locals.user = req.user || null;
    next();
});

//rutas
app.use('/auth', auth);
app.use('/caballos', caballos);
app.use('/admin', protegerRutas(['admin']), admin); 

app.listen(8080, () => console.log('Servidor en http://localhost:8080'));