const CartModel = require("../models/carts.model.js")

class CartManager {
    async createCart() {
        try {
            const newCart = new CartModel({ products: [] })
            await newCart.save()
            return newCart
        } catch (error) {
            console.log("Error creating a cart", error)
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await CartModel.findById(cartId)
            if (!cart) {
                console.log(`No cart exist with the id ${cartId}`)
                return null
            }

            return cart
        } catch (error) {
            console.log("Error retrieving the cart by id", error)
        }
    }

    async addProductToCart(cartId, productId, quantity = 1, productManager) {
        try {
            // Se verifica si el carrito existe en el array de carritos
            const cart = await this.getCartById(cartId)
            if (!cart) {
                console.error(`No cart exists with the id ${cartId}`)
                return cartId
            }

            // Se verifica si el producto existe en el array de productos
            const product = await productManager.getProductById(productId)
            if (!product) {
                console.error(`A product with the id ${productId} was not found.`)
                return productId
            }

            // Se verifica que la cantidad sea un número positivo
            if (typeof quantity !== 'number' || quantity <= 0) {
                console.error(`Quantity (${quantity}) must be a positive number.`)
                return quantity
            }

            // Se verifica si el producto ya existe en el carrito y, sino, se agrega.
            const productExist = cart.products.find(p => p.product.equals(productId))
            if (productExist) {
                productExist.quantity += quantity
            } else {
                cart.products.push({ product: productId, quantity })
            }

            // Se marca la propiedad "products" como modificada antes de guardar
            cart.markModified("products")

            await cart.save()
            return cart

        } catch (error) {
            console.log("Error adding a product to the cart", error)
        }
    }

    async clearCart(cartId) {
        try {
            // Se verifica si el carrito existe en el array de carritos
            const cart = await CartModel.findById(cartId).lean().exec()
            if (!cart) {
                console.error(`No cart exists with the id ${cartId}`)
                return cartId
            }

            // Se vacia el array de productos del carrito
            cart.products = []
            await CartModel.findByIdAndUpdate(cartId, { products: cart.products }).exec()
        } catch (error) {
            console.error("Error clearing the cart", error)
            throw error
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            // Se verifica si el producto existe en el array de productos
            const verifyProductId = await productManager.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            // Se busca el carrito por su ID y se actualiza el array de productos
            const updatedCart = await CartModel.findByIdAndUpdate(
                cartId,
                { $pull: { products: { product: productId } } }, // Se utiliza $pull para eliminar el producto del array
                { new: true } // Nos devuelve el carrito actualizado después de la operación
            )

            if (!updatedCart) {
                console.error(`No cart exists with the id ${cartId}`)
                return null
            }

            return updatedCart
        } catch (error) {
            console.error("Error deleting product from cart", error)
            throw error
        }
    }

    async updateProductQuantityInCart(cartId, productId, newQuantity) {
        try {
            // Se verifica si el carrito existe en el array de carritos
            const cart = await this.getCartById(cartId)
            if (!cart) {
                console.error(`No cart exists with the id ${cartId}`)
                return null
            }

            // Se verifica si el producto existe en el array de productos
            const verifyProductId = await productManager.getProductById(productId)
            if (!verifyProductId) {
                res.status(404).json({ error: `A product with the id ${productId} was not found.` })
                return productId
            }

            // Se verifica si el producto existe en el carrito
            const productToUpdate = cart.products.find(p => p.product.equals(productId))
            if (!productToUpdate) {
                console.error(`A product with the id ${productId} was not found in the cart.`)
                return null
            }

            // Se verifica que la nueva cantidad sea un número positivo
            if (typeof newQuantity !== 'number' || newQuantity <= 0) {
                console.error(`Quantity (${newQuantity}) must be a positive number.`)
                return newQuantity
            }

            // Se actualiza la cantidad del producto
            productToUpdate.quantity = newQuantity

            // Se guardan los cambios
            await cart.save()
            return cart
        } catch (error) {
            console.error("Error updating product quantity in cart", error)
            throw error
        }
    }

    async updateCart(cartId, newProducts) {
        try {
            const updatedCart = await CartModel.findByIdAndUpdate(cartId, { products: newProducts }, { new: true })
            return updatedCart
        } catch (error) {
            console.error("Error updating cart:", error)
            throw error
        }
    }
}

module.exports = CartManager