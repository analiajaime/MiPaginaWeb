const mongoose = require("mongoose")

// Se conecta a la BD
mongoose.connect("mongodb+srv://analiajaime:AmadeuS01@cluster0.tinq6s3.mongodb.net/e-commerce?retryWrites=true&w=majority")
    .then(() => console.log("Connection to database successful"))
    .catch((error) => console.log("Error establishing connection to database: linea6", error))

    