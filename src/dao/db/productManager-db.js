const ProductModel = require("../models/products.model.js")

class ProductManager {
    async addProduct({ title, description, category, price, code, stock, status, thumbnails }) {
        try {
            // Se valida que todos los campos sean obligatorios
            if (!title || !description || !category || !price || !code || !stock || status == undefined || status == null) {
                console.log("All fields are mandatory.")
                return
            }

            // Se valida que no se repita el campo "code"
            const productExists = await ProductModel.findOne({ code: code })

            if (productExists) {
                console.log("A product with that code already exists.")
                return
            }

            const newProduct = new ProductModel({
                title,
                description,
                category,
                price,
                code,
                stock,
                status,
                thumbnails: thumbnails || []
            })

            await newProduct.save()

        } catch (error) {
            console.log("Error adding the product:", error)
            throw error
        }
    }

    async getProducts() {
        try {
            const products = await ProductModel.find()
            return products
        } catch (error) {
            console.log("Error getting the products", error)
        }
    }

    async getProductById(id) {
        try {
            const foundProduct = await ProductModel.findById(id)

            if (!foundProduct) {
                console.log(`A product with the id ${id} was not found.`)
                return null
            }

            console.log("Product found:", foundProduct)
            return foundProduct
        } catch (error) {
            console.log("Error getting a product by id")
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const productToUpdate = await ProductModel.findByIdAndUpdate(id, updatedProduct)

            if (!productToUpdate) {
                console.log(`A product with the id ${id} was not found.`)
                return null
            }

            console.log("Product updated:", updatedProduct)
            return productToUpdate
        } catch (error) {
            console.log("Error updating the product", error)
        }
    }

    async deleteProduct(id) {
        try {
            const productToDelete = await ProductModel.findByIdAndDelete(id)

            if (!productToDelete) {
                console.log(`A product with the id ${id} was not found.`)
                return null
            }

            console.log("Product deleted:", productToDelete)
        } catch (error) {
            console.log("Error deleting the product", error)
            throw error
        }
    }
    async getProductsLimit(limit) {
        const products = await ProductModel.find()
        if (limit) {
            return products.slice(0, limit)
        }
        return products
    }
}

module.exports = ProductManager