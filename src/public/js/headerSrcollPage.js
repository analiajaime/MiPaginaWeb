let isHeaderActive = false

const handleThemes = () => {
    const lightModeBtn = document.querySelectorAll('#themeChanger_light')
    const darkModeBtn = document.querySelectorAll('#themeChanger_dark')
    const autoModeBtn = document.querySelectorAll('#themeChanger_auto')

    // Obtener el estado actual del tema desde el localStorage
    const currentTheme = localStorage.getItem('theme') || 'auto'
    setTheme(currentTheme)

    // Asignar manejadores de eventos
    lightModeBtn.forEach((e) => { e.addEventListener('click', () => setTheme('light')) })
    darkModeBtn.forEach((e) => { e.addEventListener('click', () => setTheme('dark')) })
    autoModeBtn.forEach((e) => { e.addEventListener('click', () => setTheme('auto')) })

    function setTheme(theme) {
        // Guardar el tema actual en el localStorage
        localStorage.setItem('theme', theme)

        // Aplicar el tema
        if (theme === 'auto') {
            // Configurar el tema automáticamente según las preferencias del sistema/navegador
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
            document.documentElement.setAttribute('data-theme', prefersDarkMode ? 'dark' : 'light')
            autoModeBtn.forEach((e) => { e.classList.add('selected') })
            lightModeBtn.forEach((e) => { e.classList.remove('selected') })
            darkModeBtn.forEach((e) => { e.classList.remove('selected') })
        } else {
            document.documentElement.setAttribute('data-theme', theme)
            autoModeBtn.forEach((e) => { e.classList.remove('selected') })
            lightModeBtn.forEach((e) => { e.classList.toggle('selected', theme === 'light') })
            darkModeBtn.forEach((e) => { e.classList.toggle('selected', theme === 'dark') })
        }
    }
}

handleThemes()

const createHeaderPage = () => {
    document.getElementById("headerPage_container").innerHTML = `
    <div class="headerPage">
        <h3 class="headerPage_title">${pageTitle}</h3>
        <div class="headerPage_buttons">
            ${pageTitle === 'Community Chat' ? '' : '<a href="#header_global"><button class="goUp_btn" type="button" id="headerPage_goUpbtn">Go Up</button></a>'}
            <div class="themeChanger_container" >
                <button class="themeChanger" id="themeChanger_light" type="button">Light</button>
                <button class="themeChanger" id="themeChanger_dark" type="button">Dark</button>
                <button class="themeChanger" id="themeChanger_auto" type="button">Auto</button>
            </div>
        </div>
    </div>
    `
    handleThemes()
    animatedDiv.classList.add("active")
    animatedDiv.classList.remove("inactive")
    isHeaderActive = true
}

// Se agrega el evento para que aparezca el header
const animatedDiv = document.getElementById("headerPage_container")
const threshold = 380
const pageTitle = document.title

if (pageTitle === 'Community Chat') {
    createHeaderPage()
} else {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY

        if (scrollY >= threshold) {
            createHeaderPage()
            // Se agrega el evento para que desplace smooth hasta el header
            document.getElementById("headerPage_goUpbtn").addEventListener("click", (event) => {
                event.preventDefault()
                // Desplazamiento suave hacia el formulario
                document.getElementById("header_global").scrollIntoView({ behavior: 'smooth' })
            })
        } else {
            animatedDiv.classList.add("inactive")
            isHeaderActive = false
            setTimeout(() => {
                animatedDiv.classList.remove("active")
                document.getElementById("headerPage_container").innerHTML = `
                `
            }, 45)
        }
    })
}