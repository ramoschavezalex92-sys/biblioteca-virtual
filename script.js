// LOGIN
function registrar(){
    let user = nuevoUsuario.value;
    let pass = nuevaClave.value;
    let msg = document.getElementById("mensaje");

    if(!user || !pass){
        msg.innerText = "Completa todos los campos";
        msg.className = "error";
        return;
    }

    if(localStorage.getItem(user)){
        msg.innerText = "El usuario ya existe";
        msg.className = "error";
        return;
    }

    localStorage.setItem(user, pass);

    msg.innerText = "Cuenta creada correctamente";
    msg.className = "success";

    setTimeout(()=>{
        location = "login.html";
    },1000);
}

function login(){
    let user = usuario.value;
    let pass = clave.value;
    let msg = document.getElementById("mensaje");

    if(!user || !pass){
        msg.innerText = "Completa todos los campos";
        msg.className = "error";
        return;
    }

    if(localStorage.getItem(user) === pass){
        msg.innerText = "Acceso correcto...";
        msg.className = "success";

        setTimeout(()=>{
            localStorage.setItem("usuarioActivo", user);
            location = "index.html";
        },1000);

    } else {
        msg.innerText = "Usuario o contraseña incorrectos";
        msg.className = "error";
    }
}

function cerrarSesion(){
    localStorage.removeItem("usuarioActivo");
    location="login.html";
}

// LIBROS
const biblioteca = {
    "Ciencia":[
        {nombre:"Física", archivo:"libros/fisica.pdf", imagen:"https://covers.openlibrary.org/b/id/8235080-L.jpg"},
        {nombre:"Química", archivo:"libros/quimica.pdf", imagen:"https://covers.openlibrary.org/b/id/240726-L.jpg"}
    ],
    "Tecnología":[
        {nombre:"Programación", archivo:"libros/programacion.pdf", imagen:"https://covers.openlibrary.org/b/id/10523338-L.jpg"}
    ]
};

// Si tienes un archivo JSON público con la lista de libros, pon aquí su URL.
// El JSON debe tener la forma { "Ciencia": [{ nombre, archivo, imagen }, ... ], "Tecnología": [...] }
const bibliotecaRemotaUrl = "";

function agregarLibro(categoria, nombre, archivo, imagen){
    if(!biblioteca[categoria]){
        biblioteca[categoria] = [];
    }
    biblioteca[categoria].push({nombre, archivo, imagen});
}

async function cargarBibliotecaRemota(){
    if(!bibliotecaRemotaUrl) return;
    try {
        const respuesta = await fetch(bibliotecaRemotaUrl);
        if(!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();

        if(datos && typeof datos === 'object'){
            for(const categoria in datos){
                const libros = Array.isArray(datos[categoria]) ? datos[categoria] : [];
                if(!biblioteca[categoria]) biblioteca[categoria] = [];
                biblioteca[categoria] = biblioteca[categoria].concat(libros);
            }
        }
    } catch(error){
        console.warn('No se pudo cargar la biblioteca remota:', error);
    }
}

function obtenerUrlDriveDirecta(url){
    if(!url) return url;

    if(!url.includes('drive.google.com')){
        return url;
    }

    if(url.includes('/uc?') || url.includes('export=download')){
        return url;
    }

    const driveIdPatterns = [
        /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
        /[?&]id=([a-zA-Z0-9_-]{20,})/,
        /\/open\?id=([a-zA-Z0-9_-]{20,})/
    ];

    for(const pattern of driveIdPatterns){
        const match = url.match(pattern);
        if(match){
            return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    }

    return url;
}

// Ejemplo para agregar más libros desde el mismo archivo JS:
// agregarLibro('Historia', 'Historia Universal', 'libros/historia.pdf', 'https://covers.openlibrary.org/b/id/123456-L.jpg');
// agregarLibro('Ciencia', 'Astronomía', 'https://drive.google.com/file/d/FILE_ID/view?usp=sharing', 'https://covers.openlibrary.org/b/id/654321-L.jpg');

function cargarLibros(){
    let c = document.getElementById("contenedorCategorias");
    if(!c) return;

    c.innerHTML = "";

    for(let cat in biblioteca){
        let libros = biblioteca[cat];
        if(!libros || libros.length === 0) continue;

        let fila = `<h2>${cat}</h2><div class="fila">`;

        libros.forEach(libro=>{
            const enlace = libro.archivo ? obtenerUrlDriveDirecta(libro.archivo) : '#';
            const esLocal = enlace && !/^https?:\/\//.test(enlace);
            const downloadAttr = esLocal ? 'download' : '';
            const targetAttr = esLocal ? '_self' : '_blank';

            fila += `
            <div class="libro">
                <img src="${libro.imagen}" alt="Portada ${libro.nombre}">
                <div class="info-libro">
                    <p>${libro.nombre}</p>
                    <a href="${enlace}" ${downloadAttr} target="${targetAttr}" rel="noreferrer noopener">Descargar</a>
                </div>
            </div>`;
        });

        fila += `</div>`;
        c.innerHTML += fila;
    }

    if(c.innerHTML.trim() === ""){
        c.innerHTML = `<div class="empty-state"><p>No hay libros disponibles aún. Agrega archivos PDF dentro de la carpeta <strong>libros/</strong>, usa enlaces públicos de Google Drive, o configura un manifiesto JSON público y pon su URL en <strong>bibliotecaRemotaUrl</strong> en <strong>script.js</strong>.</p></div>`;
    }
}

async function initBiblioteca(){
    await cargarBibliotecaRemota();
    cargarLibros();
}

window.onload = initBiblioteca;

// BUSCAR
function buscarLibro(){
    let t = buscador.value.toLowerCase();
    document.querySelectorAll(".libro").forEach(l=>{
        l.style.display = l.innerText.toLowerCase().includes(t)?"block":"none";
    });
}
window.addEventListener("scroll",()=>{
    document.querySelectorAll(".reveal").forEach(el=>{
        if(el.getBoundingClientRect().top < window.innerHeight-50){
            el.classList.add("active");
        }
    });
});
const canvas = document.getElementById("particles");

if(canvas){
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for(let i=0;i<60;i++){
        particles.push({
            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height,
            size:Math.random()*1.5,
            speedX:(Math.random()-0.5)*0.2,
            speedY:(Math.random()-0.5)*0.2
        });
    }

    function animar(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        particles.forEach(p=>{
            p.x+=p.speedX;
            p.y+=p.speedY;

            ctx.beginPath();
            ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fillStyle="rgba(200,200,200,0.15)";
            ctx.fill();
        });

        requestAnimationFrame(animar);
    }

    animar();
}
// Variables para interpolación suave del glow
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
const glowSmoothing = 0.15; // 0-1: menor = más suave

document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Función para animar el glow con seguimiento suave
function animateGlow() {
    let glow = document.getElementById("glow");
    if(glow) {
        // Interpolación: acerca gradualmente la posición del glow al mouse
        glowX += (mouseX - glowX) * glowSmoothing;
        glowY += (mouseY - glowY) * glowSmoothing;
        
        glow.style.left = glowX + "px";
        glow.style.top = glowY + "px";
    }
    requestAnimationFrame(animateGlow);
}

animateGlow();