const UserModel = require('../models/user.model.js')
const passport = require("passport")
const { isValidPassword } = require("../utils/hashBcrypt.js")
const configObject = require("../config/config.js")
const { admin_username, admin_email, admin_password, admin_data, admin_role } = configObject

class SessionController {
    async loginUser(req, res, next) {
        const { email, password } = req.body
        const errors = {}

        const adminUser = {
            username: admin_username,
            first_name: admin_data,
            last_name: admin_data,
            age: admin_data,
            email: admin_email,
            password: admin_password,
            role: admin_role
        }

        if (email === adminUser.email && password === adminUser.password) {
            req.session.login = true
            req.session.user = { ...adminUser }
            res.redirect('/products')
            return
        }

        const user = await UserModel.findOne({ email: email })
        if (user) {
            // Se verifica si el email y la contraseña son validos para iniciar sesión
            if (user.email !== email || !isValidPassword(password, user)) {
                errors.email = "The email address or password are incorrect"
                errors.password = "The email address or password are incorrect"
            }
        } else {
            errors.email = "User not found"
            errors.password = "User not found"
        }

        // Se verifica si hay algun error presente
        if (Object.keys(errors).length > 0) {
            return res.json({ errors })
        }

        next()
    }

    handleUserLogin(req, res, next) {
        passport.authenticate("login", {
            failureRedirect: "/api/sessions/failedlogin"
        })(req, res, next)
    }

    async renderLoginSuccess(req, res) {
        try {
            req.session.user = {
                username: req.user.username,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                age: req.user.age,
                role: req.user.role,
                cart: req.user.cart
            }
            req.session.login = true
            res.redirect("/products")

        } catch (error) {
            res.status(500).send({ error: "Error in login" })
        }
    }

    async renderFailedLogin(req, res) {
        res.render('failedLogin', { title: "Failed Login" })
    }

    async authenticateGithub(req, res) {
        return passport.authenticate("github", { scope: ["user:email"] })(req, res)
    }

    async githubCallback(req, res) {
        return passport.authenticate("github", {
            failureRedirect: "/login",
        })(req, res, () => {
            req.session.user = req.user
            req.session.login = true
            res.redirect("/products")
        })
    }

    current(req, res) {
        if (!req.session.user) {
            return res.json({ message: 'User not found' })
        }
        res.json(req.session.user)
    }

    logout(req, res) {
        if (req.session.login) {
            req.session.destroy()
        }
        res.redirect("/login")
    }
}

module.exports = SessionController