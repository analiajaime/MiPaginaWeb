const passport = require("passport")
const local = require("passport-local")
const GitHubStrategy = require("passport-github2")

// Traemos el UserModel y las funciones de bcrypt
const UserModel = require("../dao/models/user.model.js")
const GithubserModel = require("../dao/models/githubUser.model.js")
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js")

const LocalStrategy = local.Strategy

const initializePassport = () => {

    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "username"
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age, role = "user" } = req.body
        try {
            let user = await UserModel.findOne({ email })
            if (user) {
                return done(null, false)
            }
            let newUser = {
                username,
                first_name,
                last_name,
                email,
                password: createHash(password),
                age,
                role
            }

            let result = await UserModel.create(newUser)
            return done(null, result)
        } catch (error) {
            return done(error)
        }
    }))

    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            const user = await UserModel.findOne({ email })
            if (!user) {
                console.log("User not found")
                return done(null, false)
            }
            if (!isValidPassword(password, user)) {
                console.log("Invalid password")
                return done(null, false)
            }
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({ _id: id })
        done(null, user)
    })

    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.Iv23lix4tnOtrYlsoRMH",
        clientSecret: "b708f56db332eaf35e68d349c63cce236107c830",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        console.log("Profile: ", profile)
        try {
            let user = await GithubserModel.findOne({ email: profile._json.email })

            let nameComponents = profile._json.name.split(" ")
            let firstName = nameComponents[0]
            let lastName = nameComponents.length > 1 ? nameComponents[nameComponents.length - 1] : ""

            if (!user) {
                let newUser = {
                    username: profile._json.login,
                    first_name: firstName,
                    last_name: lastName,
                    email: profile._json.email,
                    password: "",
                    age: "",
                    role: "user"
                }
                let result = await GithubserModel.create(newUser)
                done(null, result)
            } else {
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
    }))
}

module.exports = initializePassport