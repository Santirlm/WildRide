const express = require('express');
const router = express.Router();
const Caballo = require('../models/caballo');
const multer = require('multer');

//configuracion de multer para subida de imagenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// GET /admin — listado de todos los caballos
router.get('/', async (req, res) => {
    try {
        const caballos = await Caballo.find().sort('nombre');
        const msg = req.query.msg || null; //para los mensajes de exito/error
        res.render('admin_listado', { caballos, msg, paginaActual: 'admin' });
    } catch (err) {
        res.status(500).render('admin_listado', { caballos: [], msg: 'error', paginaActual: 'admin' });
    }
});

// GET /admin/nuevo — formulario para crear un caballo nuevo
router.get('/nuevo', (req, res) => {
    res.render('admin_form', { caballo: null, accion: 'crear', paginaActual: 'admin' });
});

// GET /admin/editar/:id — formulario relleno con los datos del caballo
router.get('/editar/:id', async (req, res) => {
    try {
        const caballo = await Caballo.findById(req.params.id);
        if (!caballo) return res.redirect('/admin?msg=error');
        res.render('admin_form', { caballo, accion: 'editar', paginaActual: 'admin' });
    } catch (err) {
        res.redirect('/admin?msg=error');
    }
});

module.exports = router;

// POST /admin — crear caballo nuevo
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const imagen = req.file ? '/uploads/' + req.file.filename : '';
        const nuevoCaballo = new Caballo({ ...req.body, imagen });
        await nuevoCaballo.save();
        res.redirect('/admin?msg=ok');
    } catch (err) {
        res.redirect('/admin?msg=error');
    }
});

// PUT /admin/:id — actualizar un caballo existente
router.put('/:id', upload.single('imagen'), async (req, res) => {
    try {
        const datos = { ...req.body };
        //si se sube nueva imagen la usamos, si no dejamos la que habia
        if (req.file) datos.imagen = '/uploads/' + req.file.filename;

        await Caballo.findByIdAndUpdate(req.params.id, datos);
        res.redirect('/admin?msg=ok');
    } catch (err) {
        res.redirect('/admin?msg=error');
    }
});

// DELETE /admin/:id — eliminar un caballo
router.delete('/:id', async (req, res) => {
    try {
        await Caballo.findByIdAndDelete(req.params.id);
        res.redirect('/admin?msg=ok');
    } catch (err) {
        res.redirect('/admin?msg=error');
    }
});