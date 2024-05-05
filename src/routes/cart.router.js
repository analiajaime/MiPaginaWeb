const express = require('express')
const router = express.Router()

module.exports = (cartManager, productManager) => {
    router.post('/', async (req, res) => {
        try {
            const newCart = await cartManager.createCart()
            res.json({ newCart })
        } catch (error) {
            console.error("Error creating a new cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    router.get('/:cid', async (req, res) => {
        const cartId = req.params.cid
        try {
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                res.status(404).json({ error: `No cart exists with the id ${cartId}` })
            } else {
                res.json(cart.products)
            }
        } catch (error) {
            console.error("Error retrieving the cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    router.post('/:cid/product/:pid', async (req, res) => {
        const cartId = req.params.cid
        const productId = req.params.pid
        const quantity = req.body.quantity || 1
        try {
            const verifyCartId = await cartManager.getCartById(cartId)
            if (!verifyCartId) {
                res.status(404).json({ error: `No cart exists with the id ${cartId}` })
                return cartId
            }

            const verifyProductId = await productManager.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            if (typeof quantity !== 'number' || quantity <= 0) {
                res.status(404).json({ error: `Quantity (${quantity}) must be a positive number.` })
                return quantity
            }

            const updateCart = await cartManager.addProductToCart(cartId, productId, quantity, productManager)
            res.json(updateCart.products)
        } catch (error) {
            console.error("Error adding a product to the cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    router.delete('/:cid', async (req, res) => {
        const cartId = req.params.cid
        try {
            await cartManager.clearCart(cartId)
            res.status(200).json({ message: 'All products deleted from cart successfully.' })
        } catch (error) {
            console.error("Error deleting products from cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    router.delete('/:cid/product/:pid', async (req, res) => {
        const cartId = req.params.cid
        const productId = req.params.pid
        try {
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            const verifyProductId = await productManager.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            await cartManager.deleteProductFromCart(cartId, productId)
            res.json({ message: `Product with id ${productId} removed from cart with id ${cartId}` })
        } catch (error) {
            console.error("Error deleting product from cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    router.put('/:cid/product/:pid', async (req, res) => {
        const cartId = req.params.cid
        const productId = req.params.pid
        const { quantity } = req.body
        try {
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            const verifyProductId = await productManager.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            const productToUpdate = cart.products.find(p => p.product.equals(productId))
            if (!productToUpdate) {
                res.status(404).json({ error: `A product with the id ${productId} was not found in the cart.` })
                return null
            }

            if (typeof quantity !== 'number' || quantity <= 0) {
                res.status(404).json({ error: `Quantity (${quantity}) must be a positive number.` })
                return quantity
            }

            const updatedCart = await cartManager.updateProductQuantityInCart(cartId, productId, quantity)

            res.json(updatedCart)
        } catch (error) {
            console.error("Error updating product quantity in cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    router.put('/:cid', async (req, res) => {
        const cartId = req.params.cid
        const newProducts = req.body.products
        try {
            const cart = await cartManager.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            const updatedCart = await cartManager.updateCart(cartId, newProducts)

            res.json(updatedCart)
        } catch (error) {
            console.error("Error updating cart:", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    return router
}