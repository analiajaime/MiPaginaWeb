const express = require('express')
const router = express.Router()
const ProductModel = require("../dao/models/products.model.js")

module.exports = (productManager, cartManager) => {
    // Ruta para la vista home.handlebars
    router.get('/', async (req, res) => {
        try {
            if (!req.session.login) {
                return res.redirect('/login')
            }
            const products = await productManager.getProducts() // Se obtiene la lista de productos
            res.render('home', { title: 'Home', products }) // Se pasa la lista de productos a la vista
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta para la vista realTimeProducts.handlebars
    router.get('/realtimeproducts', async (req, res) => {
        try {
            res.render('realTimeProducts', { title: 'Real Time Products' })
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta para la vista chat.handlebars
    router.get('/chat', async (req, res) => {
        try {
            res.render('chat', { title: 'Community Chat' })
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta para la vista product.handlebars
    router.get('/products', async (req, res) => {
        const page = req.query.page || 1
        const limit = 5

        try {
            const productsList = await ProductModel.paginate({}, { limit, page })

            const productsFinalResult = productsList.docs.map(product => {
                const { id, ...rest } = product.toObject()
                return rest
            })

            res.render('products', {
                title: 'Products List',
                products: productsFinalResult,
                hasPrevPage: productsList.hasPrevPage,
                hasNextPage: productsList.hasNextPage,
                prevPage: productsList.prevPage,
                nextPage: productsList.nextPage,
                currentPage: productsList.page,
                totalPages: productsList.totalPages,
                user: req.session.user
            })
        } catch (error) {
            console.log("Error en la paginacion ", error)
            res.status(500).send("Error fatal en el server")
        }
    })

    // Ruta para la vista productDetail.handlebars
    router.get('/products/:productId', async (req, res) => {
        try {
            const productId = req.params.productId
            const product = await productManager.getProductById(productId) // se obtiene el producto por su ID
            res.render('productDetail', { title: 'Product Detail', product }) // Se renderiza la vista 'productDetails' con los detalles del producto
        } catch (error) {
            console.error('Error getting product details:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta para la vista cart.handlebars
    router.get('/carts/:cid', async (req, res) => {
        const cartId = req.params.cid
        try {
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                console.error(`No cart exist with the ID ${cartId}`)
                return cart
            }

            // Se renderiza la vista de carrito con los productos asociados
            res.render('cart', { cartId, products: cart.products, title: 'Cart' })
        } catch (error) {
            console.error("Error retrieving cart:", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    // Ruta para la vista login.handlebars
    router.get('/login', (req, res) => {
        // Si el usuario ya está loggeado se le redirigirá a la pagina de productos
        if (req.session.login) {
            return res.redirect('/products')
        }
        // Verificar si hay errores en la sesión
        const errors = req.session.errors || []
        delete req.session.errors // Eliminar los errores de la sesión después de usarlos
        res.render('login', { title: 'Login', errors })
    })

    // Ruta para la vista register.handlebars
    router.get('/register', (req, res) => {
        // Si el usuario ya está loggeado se le redirigirá a la pagina de su perfil
        if (req.session.login) {
            return res.redirect('/profile')
        }
        res.render('register', { title: 'Register' })
    })

    // Ruta para la vista profile.handlebars
    router.get('/profile', (req, res) => {
        // Si el usuario no está loggeado, se deberá loggear
        if (!req.session.login) {
            return res.redirect('/login')
        }
        res.render('profile', { user: req.session.user, title: 'Profile' })
    })

    return router
}
