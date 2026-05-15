const express = require('express');
const router = express.Router();
const Caballo = require('../models/caballo');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// GET /caballos — listado con búsqueda, filtros y ordenación
router.get('/', async (req, res) => {
    try {
        const caballos = await Caballo.find();

        // Filtros vacíos por defecto para que la plantilla no falle
        const filtros = {
            nombre: req.query.nombre || '',
            sexo: req.query.sexo ? [].concat(req.query.sexo) : [],
            edad: req.query.edad ? [].concat(req.query.edad) : [],
            premioMin: req.query.premioMin || '',
            orden: req.query.orden || 'nombre'
        };

        res.render('caballos_listado.njk', { caballos, filtros });
    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor", result: null });
    }
});
//Filtros



// GET /caballos/:id — detalle de un caballo
router.get('/:id', async (req, res) => {
    try {
        const caballo = await Caballo.findById(req.params.id);
        if (!caballo) return res.status(404).render('error.njk', { mensaje: 'Caballo no encontrado' });

        res.render('caballos_ficha.njk', { caballo, paginaActual: 'caballos' });
    } catch (err) {
        res.status(500).render('error.njk', { mensaje: 'Error interno del servidor' });
    }
});


//Insertar caballos
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, raza, sexo, jinete, premio } = req.body;

        if (!nombre || !raza || !sexo || !jinete || !premio) {
            return res.status(400).json({ error: "Faltan campos", result: null });
        }

        // Si se subió imagen, guarda la ruta; si no, null
        const imagen = req.file ? '/uploads/' + req.file.filename : null;

        const newHorse = new Caballo({ ...req.body, imagen });
        await newHorse.save();

        res.status(201).json({ error: null, result: newHorse });
    } catch (err) {
        res.status(500).json({ error: "Error interno", result: null });
    }
});

module.exports = router;