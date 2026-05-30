const mongoose = require('mongoose');

let comentarioSchema = new mongoose.Schema({
    caballo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'caballos',
        required: true
    },
    nick: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
        trim: true
    },
    texto: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 500,
        trim: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

let Comentario = mongoose.model('comentarios', comentarioSchema);
module.exports = Comentario;