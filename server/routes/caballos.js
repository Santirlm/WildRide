const express = require('express');
const router = express.Router();
const Caballo = require('../models/caballo');

// GET /caballos — listado con búsqueda, filtros y ordenación
router.get('/', async (req, res) => {
    try {
        const { nombre, sexo, edad, premioMin, orden } = req.query;

        // ── Construir filtro para MongoDB ──
        let filtro = {};

        // Búsqueda por nombre (insensible a mayúsculas)
        if (nombre) {
            filtro.nombre = { $regex: nombre, $options: 'i' };
        }

        // Filtro por sexo (puede venir uno o varios: ?sexo=yegua&sexo=semental)
        if (sexo) {
            const sexoArray = Array.isArray(sexo) ? sexo : [sexo];
            filtro.sexo = { $in: sexoArray };
        }

        // Filtro por rango de edad
        if (edad) {
            const edadArray = Array.isArray(edad) ? edad : [edad];
            let condicionesEdad = [];
            if (edadArray.includes('2-3')) condicionesEdad.push({ edad: { $gte: 2, $lte: 3 } });
            if (edadArray.includes('4-5')) condicionesEdad.push({ edad: { $gte: 4, $lte: 5 } });
            if (edadArray.includes('6+'))  condicionesEdad.push({ edad: { $gte: 6 } });
            if (condicionesEdad.length > 0) filtro.$or = condicionesEdad;
        }

        // Filtro por premio mínimo
        if (premioMin) {
            filtro.premio = { $gte: Number(premioMin) };
        }

        // ── Ordenación ──
        let ordenMongo = {};
        switch (orden) {
            case 'premio_asc':  ordenMongo = { premio: 1 };  break;
            case 'premio_desc': ordenMongo = { premio: -1 }; break;
            case 'edad_asc':    ordenMongo = { edad: 1 };    break;
            default:            ordenMongo = { nombre: 1 };  // A-Z por defecto
        }

        const caballos = await Caballo.find(filtro).sort(ordenMongo);

        // ── Renderizar vista ──
        res.render('caballos_listado.njk', {
            caballos,
            paginaActual: 'caballos',
            filtros: {
                nombre:   nombre   || '',
                sexo:     Array.isArray(sexo) ? sexo : (sexo ? [sexo] : []),
                edad:     Array.isArray(edad) ? edad : (edad ? [edad] : []),
                premioMin: premioMin || '',
                orden:    orden    || 'nombre'
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { mensaje: 'Error interno del servidor' });
    }
});

// GET /caballos/:id — detalle de un caballo
router.get('/:id', async (req, res) => {
    try {
        const caballo = await Caballo.findById(req.params.id);
        if (!caballo) return res.status(404).render('error.njk', { mensaje: 'Caballo no encontrado' });

        res.render('caballos_detalle.njk', { caballo, paginaActual: 'caballos' });
    } catch (err) {
        res.status(500).render('error.njk', { mensaje: 'Error interno del servidor' });
    }
});

module.exports = router;