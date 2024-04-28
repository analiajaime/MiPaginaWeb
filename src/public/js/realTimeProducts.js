const socket = io()

socket.on("products", (data) => {
    renderProducts(data)
})

// Función para renderizar la tabla de productos:
const renderProducts = (products) => {
    const containerProducts = document.getElementById("container_realTimeProducts")
    containerProducts.innerHTML = ""

    products.forEach(product => {
        const productCard = document.createElement("div")
        productCard.classList.add("productCard")
        // Se renderiza cada card
        productCard.innerHTML = `
            ${product.status ? '<span class="productCard_available">AVAILABLE</span>' : '<span class="productCard_notAvailable">NOT AVAILABLE</span>'}
            <h3>${product.title}</h3>
            <img class="productCard_img" src = "../assets/images/store/${product.thumbnails}" alt="${product.title}"></img>
            <div class="productCard_info">
                <div class="productCard_info_text">
                    <h4>From $${parseFloat(product.price).toFixed(2)}</h4>
                </div>
                <a id="scrollToForm"><button class="productCard_buttonHover" id="btn_update">Update</button></a>
            </div>
            `
        containerProducts.appendChild(productCard)

        // Se agrega el evento para actualizar el producto
        productCard.querySelector("#btn_update").addEventListener("click", () => {
            handleEditProduct(product)
        })
        // se agrega el evento para que desplace smooth hasta el formulario
        document.querySelectorAll('#scrollToForm').forEach(e => {
            e.addEventListener('click', function (event) {
                event.preventDefault()
                // Obtener el elemento al que se quiere desplazar
                const targetElement = document.querySelector('#scrolledToForm')
                // Verificar si el header está activo
                if (isHeaderActive) {
                    // Calcular la posición actual del targetElement
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY
                    // Desplazamiento suave hacia el formulario con un offset de -53px
                    window.scrollTo({
                        top: targetPosition + (-53),
                        behavior: 'smooth'
                    })
                } else {
                    // Desplazamiento suave hacia el formulario sin ajuste de scroll
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    })
                }
            })
        })
    })
}

// Se traen los datos del array de inputs, para hacer cada input.
fetch('/jsons/productsForm-inputs.json')
    .then(response => response.json())
    .then(data => {
        const containerFormInputs = document.querySelector('.container_formInputs')
        containerFormInputs.innerHTML = ""

        data.forEach((input) => {
            const inputForm = document.createElement("div")
            inputForm.classList.add("productsForm_input_container_total")

            let content
            if (!input.dataValue) {
                content = `
                    <div class="productsForm_input_container">
                        <input class=${input.class.input} id=${input.id} type=${input.type} placeholder="" autoComplete="off">
                        <span class=${input.class.span}>${input.text}</span>
                    </div>`
            } else {
                content = `
                    <div class="container_formOptions">
                        <div class=${input.class} id=${input.id.one} data-value=${input.dataValue.one}>${input.text.one}</div>
                        <div class=${input.class} id=${input.id.two} data-value=${input.dataValue.two}>${input.text.two}</div>
                    </div>`
            }

            inputForm.innerHTML = content
            containerFormInputs.appendChild(inputForm)
            document.querySelectorAll(".statusOption").forEach(e => { e.addEventListener("click", selectStatus()) })
        })
    })
    .catch(error => console.error('Error fetching JSON:', error))

// Se le pasa el 'data-value' al id 'status' y agrega/elimina la clase 'active'
const selectStatus = () => {
    const statusElement = document.getElementById("status")

    document.querySelectorAll(".statusOption").forEach(element => {
        element.addEventListener("click", () => {
            const value = element.getAttribute('data-value')

            // Elimina la clase 'active' de todos los elementos
            document.querySelectorAll(".statusOption").forEach(el => {
                el.classList.remove("active")
            })

            // Agrega la clase 'active' al elemento clickeado
            element.classList.add("active")

            // Establece el 'data-value' al elemento con id 'status'
            statusElement.setAttribute("data-value", value)
        })
    })
}

// Variable para almacenar el producto seleccionado para su edición
let selectedProduct = null

// Función para manejar la actualización o adheción de un producto
const handleProductForm = () => {
    if (!selectedProduct) {
        // Si no hay un producto seleccionado, se agrega uno nuevo
        socket.emit("addProduct", getProductData())
        clearFieldsForm()
    } else {
        // Si hay un producto seleccionado, se actualiza en lugar de agregar
        socket.emit("updateProduct", { productId: selectedProduct._id, updatedProduct: getProductData() })
        clearFieldsForm()
    }

    // Se limpia el producto seleccionado después de la operación
    selectedProduct = null
}

// Función para obtener los datos del formulario y enviarlo
const getProductData = () => {
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
        price: !selectedProduct ? document.getElementById("price").value : parseFloat(document.getElementById("price").value),
        thumbnail: document.getElementById("thumbnail").value,
        code: document.getElementById("code").value,
        stock: !selectedProduct ? document.getElementById("stock").value : parseInt(document.getElementById("stock").value),
        status: !selectedProduct ? document.getElementById("status").getAttribute("data-value") : document.getElementById("status").getAttribute("data-value") === "true"
    }
    return product
}

// Función para cargar los datos del producto seleccionado al formulario
const loadProductDataForEditing = (product) => {
    document.getElementById("title").value = product.title
    document.getElementById("description").value = product.description
    document.getElementById("category").value = product.category
    document.getElementById("price").value = product.price
    document.getElementById("thumbnail").value = product.thumbnail
    document.getElementById("code").value = product.code
    document.getElementById("stock").value = product.stock
    document.getElementById("status").setAttribute("data-value", product.status)

    // Se asigna el producto seleccionado
    selectedProduct = product
    // Se selecciona el status del producto
    handleStatusTrueOrFalse()
    // Se muestra el boton para eliminar el producto
    handleDeleteBnt()
}

// Funcion para cargar el status del producto seleccionado al formulario
const handleStatusTrueOrFalse = () => {
    document.querySelectorAll(".statusOption").forEach(element => {
        const statusElement = document.getElementById("status")
        const statusValue = statusElement.getAttribute("data-value")
        const value = element.getAttribute('data-value')
        if (value === statusValue) {
            // Se elimina la clase 'active' de todos los elementos
            document.querySelectorAll(".statusOption").forEach(el => {
                el.classList.remove("active")
            })
            // Se agrega la clase 'active' al elemento con el mismo 'data-value'
            element.classList.add("active")
        }
    })
}

// Función para mostrar el boton "delete" cuando un producto está seleccionado
const handleDeleteBnt = () => {
    const btnDelete = document.querySelector(".container_formBnt-delete")
    const modal = document.querySelector(".container_modal")

    if (selectedProduct) {
        btnDelete.innerHTML = `
            <h3>Or delete it</h3>
            <button type="button" id="btn_delete">Delete</button>
        `
        modal.innerHTML = `
            <div class="modal_text">
                <h4>Delete ${selectedProduct.title}?</h4>
                <span>The product will be deleted definitely.</span>
            </div>
            <div class="modal_options_container">
                <button type="button" id="btnModal_cancel">Cancel</button>
                <button type="button" id="btnModal_delete">Delete</button>
            </div>
        `

        // Agregamos el evento para mostrar el modal (la confirmación del 'delete')
        document.getElementById("btn_delete").addEventListener("click", () => { showModal() })

        // Agregamos el evento para cerrar el modal
        document.getElementById("btnModal_cancel").addEventListener("click", () => { handleModal() })

        // Agregamos el evento para eliminar el producto
        document.getElementById("btnModal_delete").addEventListener("click", () => {
            console.log("product deleted:", selectedProduct)
            deleteProduct(selectedProduct._id)
            clearFieldsForm()
        })
    } else {
        btnDelete.innerHTML = `
        `
        modal.innerHTML = `
        `
    }
}

// Se presoina el boton "update" del producto
const handleEditProduct = (product) => {
    // Se personaliza el comportamiento del formulario
    loadProductDataForEditing(product)
    document.getElementById("form_title").innerText = `Update ${product.title}`
}

// Se limpian y resetean los campos del formulario
const clearFieldsForm = () => {
    document.getElementById("form_title").innerText = "Add a product"
    document.getElementById("form_products").reset()
    document.getElementById("status").removeAttribute("data-value")
    document.querySelectorAll(".statusOption").forEach(e => { e.classList.remove("active") })
    selectedProduct = null
    handleDeleteBnt()
}

document.getElementById("form_clearBtn").addEventListener("click", clearFieldsForm)

// Se envia el formulario
document.getElementById("form_submitBtn").addEventListener("click", handleProductForm)

// Función para mostrar el modal (la confirmación del 'delete')
const showModal = () => {
    document.querySelector(".background_modal").classList.toggle("active")
    document.querySelector(".container_modal").classList.toggle("active")
    document.body.style.overflow = "hidden"
}

// Función para el boton 'Cancel' del modal - se sierra
const handleModal = () => {
    document.querySelector(".background_modal").classList.remove("active")
    document.querySelector(".container_modal").classList.remove("active")
    document.body.style.overflow = ""
}

// Función para el boton 'Delete' del modal - se elimina el producto seleccionado
const deleteProduct = (_id) => {
    document.querySelector(".background_modal").classList.remove("active")
    document.querySelector(".container_modal").classList.remove("active")
    document.body.style.overflow = ""
    socket.emit("deleteProduct", _id)
}