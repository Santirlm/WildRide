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
        

        // Filtros vacíos por defecto para que la plantilla no falle
        const filtros = {
            nombre: req.query.nombre || '' ,
            sexo: req.query.sexo ? [].concat(req.query.sexo) : [],
            edad: req.query.edad ? [].concat(req.query.edad) : [],
            premioMin: req.query.premioMin || '',
            orden: req.query.orden || 'nombre'
        };

        let query = {};

        // Filtro por nombre (usando expresión regular para que busque "contiene" y sea insensible a mayúsculas)
        if (filtros.nombre) {
            query.nombre = { $regex: filtros.nombre, $options: 'i' };
        }

        // Filtro por sexo (usamos $in porque puede ser un array con varios sexos elegidos)
        if (filtros.sexo.length > 0) {
            query.sexo = { $in: filtros.sexo };
        }

        // Filtro por edad
        if (filtros.edad.length > 0) {
            query.edad = { $in: filtros.edad.map(Number) }; // Convertimos a número por si vienen como texto
        }

        // Filtro por premio mínimo ($gte significa "mayor o igual que")
        if (filtros.premioMin) {
            query.premio = { $gte: Number(filtros.premioMin) };
        }

        // 3. Ejecutamos la búsqueda en la Base de Datos aplicando la query y el orden
        // .sort() se encarga de ordenar (ej: 'nombre' o '-nombre' si fuera descendente)
        const caballos = await Caballo.find(query).sort(filtros.orden);

        // 4. Renderizamos la vista de Nunjucks
        if (caballos.length === 0) {
            // Pasamos un array vacío o un mensaje a la vista, es mejor que un 404 en JSON
            return res.render('caballos_listado', { result: [], mensaje: "No se encontraron caballos con esos filtros" });
        }

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