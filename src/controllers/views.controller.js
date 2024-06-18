const ProductModel = require("../models/products.model.js")
const ProductServices = require("../services/productServices.js")
const productServices = new ProductServices()
const CartServices = require("../services/cartServices.js")
const cartServices = new CartServices()

class ViewsController {
    async renderHome(req, res) {
        if (req.session.user && req.session.user.role === 'admin') {
            return res.redirect('/realtimeproducts')
        }
        try {
            res.render('home', { title: 'Home' })
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async renderAdminPage(req, res) {
        try {
            // Si el usuario no está loggeado se le redirigirá a la pagina de 'Home'
            if (!req.session.login) {
                return res.redirect('/')
            }
            // Si el usuario es el Administrador tendrá acceso a la pagina 'Real Time Products'
            if (req.session.user.role === 'admin') {
                res.render('realTimeProducts', { title: 'Admin Hub' })
            } else {
                return res.redirect('/')
            }
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async renderStore(req, res) {
        if (req.session.user && req.session.user.role === 'admin') {
            return res.redirect('/')
        }

        const page = req.query.page || 1
        const limit = 9

        try {
            const productsList = await ProductModel.paginate({ status: true }, { limit, page })

            const productsFinalResult = productsList.docs.map(product => {
                const { id, ...rest } = product.toObject()
                return rest
            })

            res.render('products', {
                title: 'iStore',
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
            console.log("Error on the pagination:", error)
            res.status(500).send("Error fatal en el server")
        }
    }

    async renderProductDetail(req, res) {
        if (req.session.user && req.session.user.role === 'admin') {
            return res.redirect('/')
        }
        try {
            const productId = req.params.productId
            const product = await productServices.getProductById(productId) // se obtiene el producto por su ID
            res.render('productDetail', { title: 'Product Detail', product }) // Se renderiza la vista 'productDetails' con los detalles del producto
        } catch (error) {
            console.error('Error getting product details:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async renderChat(req, res) {
        try {
            // Si el usuario no está loggeado se le redirigirá a la pagina de 'Login'
            if (!req.session.login) {
                return res.redirect('/login')
            }
            res.render('chat', { title: 'Community Chat' })
        } catch (error) {
            console.error('Error getting products:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async renderAccount(req, res) {
        // Si el usuario no está loggeado, se deberá loggear
        if (!req.session.login) {
            return res.redirect('/login')
        }
        res.render('account', { title: 'Your Account' })
    }

    async renderCartGuest(req, res) {
        // Se verifica si el usuario está loggeado
        if (!req.session.user) {
            // Si el usuario no está autenticado, renderizar la vista del carrito para invitados
            return res.render('guestCart', { title: 'Guest Cart' })
        }
        if (req.session.user && req.session.user.role === 'admin') {
            return res.redirect('/')
        } else {
            return res.redirect(`/carts/${req.session.user.cart}`)
        }
    }

    async renderUserCart(req, res) {
        const cartId = req.params.cid
        try {
            if (!req.session.user) {
                return res.redirect('/cart/guest')
            }
            if (req.session.user && req.session.user.role === 'admin') {
                return res.redirect('/')
            } else {
                // Se verifica si el carrito existe en el array de carritos
                const cart = await cartServices.getCartById(cartId)
                if (!cart) {
                    console.error(`No cart exist with the ID ${cartId}`)
                    return cart
                }

                let totalPurchase = 0

                const productsInCart = cart.products.map(item => {
                    const product = item.product.toObject()
                    const quantity = item.quantity
                    const totalPrice = product.price * quantity

                    totalPurchase += totalPrice

                    return {
                        product: { ...product, totalPrice },
                        quantity,
                        cartId
                    }
                })

                // Se renderiza la vista de carrito con los productos asociados
                return res.render('cart', { cartId, products: productsInCart, totalPurchase, title: 'Cart' })
            }
        } catch (error) {
            console.error("Error retrieving cart:", error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async renderLogin(req, res) {
        // Si el usuario ya está loggeado se le redirigirá a la pagina de 'Home'
        if (req.session.login) {
            return res.redirect('/')
        }
        res.render('login', { title: 'Login' })
    }

    async renderRegister(req, res) {
        // Si el usuario ya está loggeado se le redirigirá a la pagina 'Home'
        if (req.session.login) {
            return res.redirect('/')
        }
        res.render('register', { title: 'Register' })
    }
}

module.exports = ViewsController