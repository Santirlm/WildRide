const express = require('express');
const router = express.Router();
const Caballo = require('../models/caballo');
const Comentario = require('../models/comentario');
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
        const filtros = {
            nombre: req.query.nombre || '',
            sexo: req.query.sexo ? [].concat(req.query.sexo) : [],
            edad: req.query.edad ? [].concat(req.query.edad) : [],
            premioMin: req.query.premioMin || '',
            orden: req.query.orden || 'nombre'
        };

        let query = {};

        if (filtros.nombre) {
            query.nombre = { $regex: filtros.nombre, $options: 'i' };
        }
        if (filtros.sexo.length > 0) {
            query.sexo = { $in: filtros.sexo };
        }
       // Sustituye este bloque en tu router
        if (filtros.edad.length > 0) {
            const edades = [];

            filtros.edad.forEach(rango => {
                if (rango === '2-3') 
                    edades.push(2, 3);
                if (rango === '4-5') 
                    edades.push(4, 5);
                if (rango === '6+')
                { 
                    query.edad = { $gte: 6 };
                }
            });

            query.edad = { $in: edades };
        }
        if (filtros.premioMin) {
            query.premio = { $gte: Number(filtros.premioMin) };
        }

        const ordenMap = {
            'nombre':      { nombre: 1 },
            'premio_asc':  { premio: 1 },
            'premio_desc': { premio: -1 },
            'edad_asc':    { edad: 1 }
        };
        const sortObj = ordenMap[filtros.orden] || { nombre: 1 };

        const caballos = await Caballo.find(query).sort(sortObj);

        // siempre pasamos filtros aunque no haya resultados
        res.render('caballos_listado', { caballos, filtros, paginaActual: 'caballos' });

    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor", result: null });
    }
});

// GET /caballos/:id — ficha detalle con comentarios y recomendaciones
router.get('/:id', async (req, res) => {
    try {
        const caballo = await Caballo.findById(req.params.id);
        if (!caballo) return res.status(404).render('error', { mensaje: 'Caballo no encontrado' });

        // comentarios ordenados de más reciente a más antiguo
        const comentarios = await Comentario.find({ caballo: req.params.id }).sort({ fecha: -1 });

        // 3 recomendaciones aleatorias (distintas al actual)
        const recomendaciones = await Caballo.aggregate([
            { $match: { _id: { $ne: caballo._id } } },
            { $sample: { size: 3 } }
        ]);

        const msgComentario = req.query.msgComentario || null;

        res.render('caballos_ficha', { caballo, comentarios, recomendaciones, msgComentario, paginaActual: 'caballos' });
    } catch (err) {
        res.status(500).render('error', { mensaje: 'Error interno del servidor' });
    }
});

// POST /caballos/:id/comentario — añadir comentario
router.post('/:id/comentario', async (req, res) => {
    try {
        const { nick, texto } = req.body;

        if (!nick || !texto) {
            return res.redirect(`/caballos/${req.params.id}?msgComentario=error`);
        }

        const nuevoComentario = new Comentario({
            caballo: req.params.id,
            nick: nick.trim(),
            texto: texto.trim()
        });
        await nuevoComentario.save();

        res.redirect(`/caballos/${req.params.id}?msgComentario=ok`);
    } catch (err) {
        res.redirect(`/caballos/${req.params.id}?msgComentario=error`);
    }
});

// POST /caballos — insertar caballo (ruta de Mireya, la dejamos igual)
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, raza, sexo, jinete, premio } = req.body;

        if (!nombre || !raza || !sexo || !jinete || !premio) {
            return res.status(400).json({ error: "Faltan campos", result: null });
        }

        const imagen = req.file ? '/uploads/' + req.file.filename : null;
        const newHorse = new Caballo({ ...req.body, imagen });
        await newHorse.save();

        res.status(201).json({ error: null, result: newHorse });
    } catch (err) {
        res.status(500).json({ error: "Error interno", result: null });
    }
});

module.exports = router;