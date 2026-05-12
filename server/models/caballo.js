const mongoose = require('mongoose');

let caballoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        minlength: 2,
        maxlenght: 35,
        trim: true
    },
    raza: {
        type: String,
        required: true,
        minlength: 2,
        maxlenght: 20,
    },
    edad: {
        type: Number,
        min: 1,
    },
    sexo: {
        type: String,
        required: true,
        enum: ['yegua', 'capón', 'semental']
    },
    imagen: {
        type: String,
        default: ''
    },
    descripcion: {
        type: String,
        maxlenght: 200
    },
    jinete: {
        type: String,
        required: true
    },
    // especialidad: {
    //     type: String,
    //     enum: ['doma', 'exhibición', 'salto', 'otros']
    // }
    premio: {
        type: Number,
        required: true
    },
    victorias: 
    { 
        type: Number, 
        default: 0, 
        min: 0 
    }
});

let Caballo = mongoose.model('caballos', caballoSchema);
module.exports = Caballo;