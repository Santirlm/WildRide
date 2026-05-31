const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'wildride_secret_123';

// generar token con los datos del user
const generateToken = (user) => {
    const payload = {
        id: user._id,
        login: user.login,
        rol: user.rol
    };
    return jwt.sign(payload, secret, { expiresIn: '2h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, secret);
};

// protege las rutas segun el rol, si no hay token manda al login
const protegerRutas = (rolesPermitidos) => {
    return (req, res, next) => {
        const token = req.cookies ? req.cookies.token : null;
        if (!token) return res.redirect('/auth/login');

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            if (!rolesPermitidos.includes(req.user.rol)) {
                return res.status(403).render('error', { mensaje: 'No tienes permiso para acceder aquí' });
            }
            next();
        } catch (err) {
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }
    };
};

module.exports = { generateToken, verifyToken, protegerRutas };