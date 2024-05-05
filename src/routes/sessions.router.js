const express = require("express")
const router = express.Router()
const UserModel = require('../dao/models/user.model.js')

router.post("/login", async (req, res) => {
    const { email, password } = req.body
    if (!email && !password) {
        req.session.errors = { email: "Email address and password are required", password: "Email address and password are required" }
        return res.redirect("/login")
    }
    if (!email) {
        req.session.errors = { email: "Email address is required" }
        return res.redirect("/login")
    }
    if (!password) {
        req.session.errors = { password: "Password is required" }
        return res.redirect("/login")
    }
    const adminUser = {
        username: "Admin",
        first_name: "Private",
        last_name: "Private",
        age: "Private",
        email: "adminCoder@coder.com",
        password: "adminCod3r123",
        role: "admin"
    }
    try {
        const user = await UserModel.findOne({ email: email })

        if (email === adminUser.email && password === adminUser.password) {
            req.session.login = true
            req.session.user = { ...adminUser }
            res.redirect('/products')
            return
        }

        if (user) {
            if (user.email === email && user.password === password) {
                req.session.login = true
                req.session.user = {
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    age: user.age,
                    role: user.role
                }
                res.redirect("/products")
            } else {
                req.session.errors = { email: "The email address or password are incorrect", password: "The email address or password are incorrect" }
                res.redirect("/login")
            }
        } else {
            req.session.errors = { email: "User not found", password: "User not found" }
            res.redirect("/login")
        }
    } catch (error) {
        res.status(500).send({ error: "Error in login" })
    }
})

router.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.destroy()
    }
    res.redirect("/login")
})

module.exports = router