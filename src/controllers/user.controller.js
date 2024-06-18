const UserModel = require('../models/user.model.js')
const passport = require("passport")

class UserController {
    async registerUser(req, res, next) {
        const { username, email } = req.body
        const errors = {}

        // Se valida si el username ya está registrado
        const existingUsername = await UserModel.findOne({ username: username })
        if (existingUsername || username === "Admin") {
            errors.username = "The username is already registered"
        }

        // Se valida si el correo electrónico ya está registrado
        const existingUserEmail = await UserModel.findOne({ email: email })
        if (existingUserEmail || email === "adminCoder@coder.com") {
            errors.email = "The email address is already registered"
        }

        // Se verifica si hay algun error presente
        if (Object.keys(errors).length > 0) {
            return res.json({ errors })
        }

        next()
    }

    handleUserRegistration(req, res, next) {
        passport.authenticate("register", {
            failureRedirect: "/api/users/failedregister"
        })(req, res, next)
    }

    async renderRegisterSuccess(req, res) {
        req.session.user = {
            username: req.user.username,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            role: req.user.role,
            cart: req.user.cart
        }
        res.render("registerSuccess", { title: 'Register Success' })
    }

    renderFailedRegister(req, res) {
        res.render("failedRegister", { title: 'Failed Register' })
    }
}

module.exports = UserController