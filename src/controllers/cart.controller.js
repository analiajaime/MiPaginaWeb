const UserModel = require('../models/user.model')
const TicketModel = require('../models/ticket.model')
const CartServices = require('../services/cartServices.js')
const cartServices = new CartServices()
const ProductServices = require('../services/productServices.js')
const productServices = new ProductServices()
const CartUtils = require('../utils/cartUtils.js')
const cartUtils = new CartUtils()

class CartController {
    async createCart(req, res) {
        try {
            const newCart = await cartServices.createCart()
            res.json({ newCart })
        } catch (error) {
            console.error("Error creating a new cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async getCartById(req, res) {
        const cartId = req.params.cid
        try {
            const cart = await cartServices.getCartById(cartId)
            if (!cart) {
                res.status(404).json({ error: `No cart exists with the id ${cartId}` })
            } else {
                res.json(cart.products)
            }
        } catch (error) {
            console.error("Error retrieving the cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async addProductToCart(req, res) {
        const user = req.session.user
        const cartId = user.cart
        const productId = req.params.pid
        const quantity = req.body.quantity || 1
        try {
            // Se verifica si el carrito existe en el array de carritos
            const verifyCartId = await cartServices.getCartById(cartId)
            if (!verifyCartId) {
                res.status(404).json({ error: `No cart exists with the id ${cartId}` })
                return cartId
            }

            // Se verifica si el producto existe en el array de productos
            const verifyProductId = await productServices.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            // Se verifica que la cantidad sea un número positivo
            if (typeof quantity !== 'number' || quantity <= 0) {
                res.status(404).json({ error: `Quantity (${quantity}) must be a positive number.` })
                return quantity
            }

            await cartServices.addProductToCart(cartId, productId, quantity, productServices)
            res.redirect(`/carts/${cartId}`)
        } catch (error) {
            console.error("Error adding a product to the cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async clearCart(req, res) {
        const cartId = req.params.cid
        try {
            // Se llama a la función clearCart del cartManager para eliminar todos los productos del carrito
            await cartServices.clearCart(cartId)
            // Se envía una respuesta exitosa al cliente
            res.status(200).json({ message: 'All products have deleted from cart successfully.' })
        } catch (error) {
            console.error("Error deleting products from cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async deleteProductFromCart(req, res) {
        const cartId = req.params.cid
        const productId = req.params.pid
        try {
            // Se verifica si el carrito existe en el array de carritos
            const cart = await cartServices.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            // Se verifica si el producto existe en el array de productos
            const verifyProductId = await productServices.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            // Se elimina el producto del carrito
            await cartServices.deleteProductFromCart(cartId, productId)
            res.json({ message: `Product with id ${productId} was removed from cart with id ${cartId}` })
        } catch (error) {
            console.error("Error deleting product from cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async updateProductQuantityInCart(req, res) {
        const cartId = req.params.cid
        const productId = req.params.pid
        const { quantity } = req.body
        try {
            // Se verifica si el carrito existe en el array de carritos
            const cart = await cartServices.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            // Se verifica si el producto existe en el array de productos
            const verifyProductId = await productServices.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            // Se verifica si el producto existe en el carrito
            const productToUpdate = cart.products.find(p => p.product.equals(productId))
            if (!productToUpdate) {
                res.status(404).json({ error: `A product with the id ${productId} was not found in the cart.` })
                return null
            }

            // Se verifica que la cantidad sea un número positivo
            if (typeof quantity !== 'number' || quantity <= 0) {
                res.status(404).json({ error: `Quantity (${quantity}) must be a positive number.` })
                return quantity
            }

            // Se actualiza la cantidad del producto en el carrito
            const updatedCart = await cartServices.updateProductQuantityInCart(cartId, productId, quantity)

            // Se envia una respuesta con el carrito actualizado
            res.json(updatedCart.products)
        } catch (error) {
            console.error("Error updating product quantity in cart", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async updateCart(req, res) {
        const cartId = req.params.cid
        const newProducts = req.body
        try {
            // Se verifica si el carrito existe en el array de carritos
            const cart = await cartServices.getCartById(cartId)
            if (!cart) {
                return res.status(404).json({ error: `Cart with id ${cartId} not found` })
            }

            // Se actualiza el carrito con los nuevos productos
            const updatedCart = await cartServices.updateCart(cartId, newProducts)

            res.json(updatedCart)
        } catch (error) {
            console.error("Error updating cart:", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async completePurchase(req, res) {
        const cartId = req.params.cid
        try {
            // Se obtiene el carrito y sus productos
            const cart = await cartServices.getCartById(cartId)
            const products = cart.products

            // Se inicializa un arreglo para almacenar los productos no disponibles
            const unavailableProducts = []

            // Se verifica el stock y actualizar los productos disponibles
            for (const item of products) {
                const productId = item.product
                const product = await productServices.getProductById(productId)
                if (product.stock >= item.quantity) {
                    // Si hay suficiente stock, restar la cantidad del producto
                    product.stock -= item.quantity
                    await product.save()
                } else {
                    // Si no hay suficiente stock, agregar el ID del producto al arreglo de no disponibles
                    unavailableProducts.push(productId)
                }
            }

            const userWithCart = await UserModel.findOne({ cart: cartId })

            // Crear un ticket con los datos de la compra
            const ticket = new TicketModel({
                code: cartUtils.generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: cartUtils.calculateTotal(cart.products),
                purchaser: userWithCart._id
            })
            await ticket.save()

            // Se elimina del carrito los productosue sí se compraron
            cart.products = cart.products.filter(item => unavailableProducts.some(productId => productId.equals(item.product)))

            // Se guarda el carrito actualizado en la base de datos
            await cart.save()

            // res.status(200).json({ unavailableProducts })
            res.status(200).json({ ticket })
        } catch (error) {
            console.error("Error processing purchase:", error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

module.exports = CartController