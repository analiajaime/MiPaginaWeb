const socket = require("socket.io")
const ProductServices = require("../services/productServices.js")
const productServices = new ProductServices()
const MessageModel = require("../models/messages.model.js")

class SocketManager {
    constructor(server) {
        this.io = socket(server)
        this.initSocketEvents()
    }

    async initSocketEvents() {
        // Se configura Socket.IO para escuchar conexiones
        this.io.on('connection', async (socket) => {
            console.log('A user connected')

            // Se emite la lista de productos al cliente cuando se conecta
            socket.emit("products", await productServices.getProducts())

            // Se escucha eventos del cliente para agregar productos
            socket.on("addProduct", async (newProduct) => {
                // Se agrega el nuevo producto y emitir la lista actualizada a todos los clientes
                await productServices.addProduct(newProduct)
                this.io.emit("products", await productServices.getProducts())
            })

            // Se escucha eventos del cliente para actualziar productos
            socket.on("updateProduct", async ({ productId, updatedProduct }) => {
                await productServices.updateProduct(productId, updatedProduct)
                this.io.emit("products", await productServices.getProducts())
            })

            // Se escucha eventos del cliente para borrar productos
            socket.on("deleteProduct", async (productId) => {
                // Se borra el producto y emitir la lista actualizada a todos los clientes
                await productServices.deleteProduct(productId)
                this.io.emit("products", await productServices.getProducts())
            })

            // Se emite la lista de mensajes al cliente cuando se conecta
            socket.emit("message", await MessageModel.find())

            // Se envian y reciben mensajes en el chat
            socket.on("message", async data => {
                // Guardo el mensaje en MongoDB
                await MessageModel.create(data)

                // Obtengo los mensajes de MongoDB y se los paso al cliente
                const messages = await MessageModel.find()
                this.io.sockets.emit("message", messages)
            })
        })
    }
}

module.exports = SocketManager