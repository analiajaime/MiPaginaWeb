const express = require("express")
const router = express.Router()
const UserModel = require('../dao/models/user.model.js')

// Ruta POST /api/users - Se genera un usuario y se almacena en MongoDB
router.post("/", async (req, res) => {
    const { username, first_name, last_name, email, password, age, role = "user" } = req.body
    const errors = {} // Objeto para almacenar errores específicos
    // Se verifica si algún campo requerido está vacío
    if (!username) {
        errors.username = "Username is required"
    }
    if (!first_name) {
        errors.first_name = "First name is required"
    }
    if (!last_name) {
        errors.last_name = "Last name is required"
    }
    if (!email) {
        errors.email = "Email address is required"
    }
    if (!password) {
        errors.password = "Password is required"
    }
    if (!age) {
        errors.age = "Age is required"
    }
    try {
        // Se verifica si el username ya está registrado
        const existingUsername = await UserModel.findOne({ username: username })
        if (existingUsername || username === "Admin") {
            // return res.status(400).send({ error: "The username is already registered" })
            errors.username = "The username is already registered"
        }

        // Se verifica si el correo electrónico ya está registrado
        const existingUserEmail = await UserModel.findOne({ email: email })
        if (existingUserEmail || email === "adminCoder@coder.com") {
            // return res.status(400).send({ error: "The email address is already registered" })
            errors.email = "The email address is already registered"
        }

        // Se valida la longitud de la contraseña
        if (password.length > 0 && password.length < 8) {
            errors.password = "Password must be at least 8 characters long"
        }

        // Se valida la edad mínima
        if (age > 0 && age < 18) {
            errors.age = "You must be at least 18 years old to register"
        }

        // Si hay errores, renderizar la página de registro con los errores
        if (Object.keys(errors).length > 0) {
            return res.render("register", { title: 'Register', errors })
        }

        // Si no hay errores, se crea un nuevo usuario
        const newUser = await UserModel.create({ username, first_name, last_name, email, password, age, role })
        req.session.user = { ...newUser._doc }
        res.render('registerSuccess', { title: 'Register Success' })
    } catch (error) {
        console.error("Error creating the user:", error)
        res.status(500).send({ error: "Internal server error" })
    }
})

module.exports = router