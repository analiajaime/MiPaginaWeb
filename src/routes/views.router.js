const express = require('express')
const router = express.Router()
const ProductModel = require("../dao/models/products.model.js")

module.exports = (productManager, cartManager) => {
    
    
    router.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts() 
            res.render('home', { title: 'Home', products }) 
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    
    router.get('/realtimeproducts', async (req, res) => {
        try {
            res.render('realTimeProducts', { title: 'Real Time Products' })
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    
    router.get('/chat', async (req, res) => {
        try {
            res.render('chat', { title: 'Community Chat' })
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    
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
                totalPages: productsList.totalPages
            })
        } catch (error) {
            console.log("Error en la paginacion ", error)
            res.status(500).send("Error fatal en el server")
        }
    })

    router.get('/products/:productId', async (req, res) => {
        try {
            const productId = req.params.productId
            const product = await productManager.getProductById(productId) 
            res.render('productDetail', { title: 'Product Detail', product }) 
        } catch (error) {
            console.error('Error getting product details:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    router.get('/carts/:cid', async (req, res) => {
        const cartId = req.params.cid
        try {
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                console.error(`No cart exist with the ID ${cartId}`)
                return cart
            }

            
            res.render('cart', { cartId, products: cart.products, title: 'Cart' })
        } catch (error) {
            console.error("Error retrieving cart:", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    return router
}
