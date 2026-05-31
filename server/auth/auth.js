const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'wildride_secret_123';

// igual que en basket pero aqui el token va en cookie, no en header
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

// middleware que lee el token de la cookie en vez del header
const protegerRutas = (rolesPermitidos) => {
    return (req, res, next) => {
        const token = req.cookies ? req.cookies.token : null;
        if (!token) {
            return res.redirect('/auth/login');
        }
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            if (!rolesPermitidos.includes(req.user.rol)) {
                return res.status(403).render('error', { mensaje: 'No tienes permiso para acceder aquí' });
            }
            next();
        } catch (err) {
            // token expirado o invalido
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }
    };
};

module.exports = { generateToken, verifyToken, protegerRutas };