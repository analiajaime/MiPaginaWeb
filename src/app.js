require('./database.js')
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const expressHandlebars = require('express-handlebars')
const ProductManager = require('./dao/db/productManager-db.js')
const CartManager = require('./dao/db/cartManager-db.js')
const MessageModel = require('./dao/models/messages.model.js')
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const PORT = 8080

const productManager = new ProductManager()
const cartManager = new CartManager()

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb+srv://analiajaime:AmadeuS01@cluster0.tinq6s3.mongodb.net/e-commerce?retryWrites=true&w=majority", ttl: 600 }),
        cookie: {
            maxAge: 60000
        }
    })) 

    // Handlebars
    const hbs = expressHandlebars.create({
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
    })

    app.engine('handlebars', hbs.engine)
    app.set('view engine', 'handlebars')
    app.set("views", "./src/views")

// Routing
app.use("/", require("./routes/views.router")(productManager, cartManager))

// Rutas de productos
app.use('/api/products', require('./routes/products.router')(productManager))

// Rutas de carritos
app.use('/api/carts', require('./routes/cart.router')(cartManager, productManager))

// Rutas de usuarios
app.use('/api/users', require('./routes/users.router'))

// Rutas de sesiones
app.use('/api/sessions', require('./routes/sessions.router'))

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('./src/public'))

// Se configura Socket.IO para escuchar conexiones
io.on('connection', async (socket) => {
    console.log('User connected')

    // Se emite la lista de productos al cliente cuando se conecta
    socket.emit("products", await productManager.getProducts())

    // Se escucha eventos del cliente para agregar productos
    socket.on("addProduct", async (newProduct) => {
        // Se agrega el nuevo producto y emitir la lista actualizada a todos los clientes
        await productManager.addProduct(newProduct)
        io.emit("products", await productManager.getProducts())
    })

    // Se escucha eventos del cliente para actualziar productos
    socket.on("updateProduct", async ({ productId, updatedProduct }) => {
        await productManager.updateProduct(productId, updatedProduct)
        io.emit("products", await productManager.getProducts())
    })

    // Se escucha eventos del cliente para borrar productos
    socket.on("deleteProduct", async (productId) => {
        // Se borra el producto y emitir la lista actualizada a todos los clientes
        await productManager.deleteProduct(productId)
        io.emit("products", await productManager.getProducts())
    })

    // Chat en tiempo real
    socket.on("message", async data => {
        // Guardo el mensaje en MongoDB
        await MessageModel.create(data)

        // Obtengo los mensajes de MongoDB y se los paso al cliente
        const messages = await MessageModel.find()
        console.log(messages)
        io.sockets.emit("message", messages)
    })
})

// Error 404

app.use((req, res, next) => {
    res.status(404).render("404", { title: "404 Not Found"
    })
    next()
})

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
  