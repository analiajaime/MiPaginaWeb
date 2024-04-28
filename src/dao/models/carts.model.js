const mongoose = require("mongoose")

// Se crea el schema y el model de carritos
const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]
})

cartSchema.pre("findOne", function (next) {
    this.populate('products.product')
    next()
})

const CartModel = mongoose.model("carts", cartSchema)

module.exports = CartModel