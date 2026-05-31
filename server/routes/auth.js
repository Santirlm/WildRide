const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const { generateToken } = require('../auth/auth');

// GET /auth/login — formulario de login
router.get('/login', (req, res) => {
    const error = req.query.error || null;
    res.render('login', { error, paginaActual: 'login' });
});

// POST /auth/login — procesar login
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.redirect('/auth/login?error=Rellena todos los campos');
        }

        const user = await User.findOne({ login });
        if (!user) {
            return res.redirect('/auth/login?error=Usuario o contraseña incorrectos');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/auth/login?error=Usuario o contraseña incorrectos');
        }

        const token = generateToken(user);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000
        });

        res.redirect('/caballos');

    } catch (err) {
        res.redirect('/auth/login?error=Error interno del servidor');
    }
});

// GET /auth/logout — cerrar sesion
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/caballos');
});

// GET /auth/register — formulario de registro
router.get('/register', (req, res) => {
    const error = req.query.error || null;
    const ok = req.query.ok || null;
    res.render('register', { error, ok, paginaActual: 'login' });
});

// POST /auth/register-form — procesar registro desde formulario html
router.post('/register-form', async (req, res) => {
    try {
        const { login, password, rol } = req.body;

        if (!login || !password || !rol) {
            return res.redirect('/auth/register?error=Rellena todos los campos');
        }

        const existe = await User.findOne({ login });
        if (existe) {
            return res.redirect('/auth/register?error=Ese usuario ya existe');
        }

        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({ login, password: hash, rol });
        await newUser.save();

        res.redirect('/auth/register?ok=1');

    } catch (err) {
        res.redirect('/auth/register?error=Error interno del servidor');
    }
});

// POST /auth/register — api json
router.post('/register', async (req, res) => {
    try {
        const { login, password, rol } = req.body;

        if (!login || !password || !rol) {
            return res.status(400).json({ error: "Faltan campos", result: null });
        }

        const existe = await User.findOne({ login });
        if (existe) {
            return res.status(400).json({ error: "Usuario ya registrado", result: null });
        }

        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({ login, password: hash, rol });
        await newUser.save();

        res.status(201).json({ error: null, result: "Usuario creado" });

    } catch (err) {
        res.status(500).json({ error: "Error interno", result: null });
    }
});

module.exports = router;