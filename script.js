// LOGIN
function registrar(){

    let user = nuevoUsuario.value;
    let pass = nuevaClave.value;
    let msg = document.getElementById("mensaje");

    if(!user || !pass){

        msg.innerText =
            "Completa todos los campos";

        msg.className = "error";

        return;
    }

    if(localStorage.getItem(user)){

        msg.innerText =
            "El usuario ya existe";

        msg.className = "error";

        return;
    }

    localStorage.setItem(user, pass);

    msg.innerText =
        "Cuenta creada correctamente";

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

        msg.innerText =
            "Completa todos los campos";

        msg.className = "error";

        return;
    }

    if(localStorage.getItem(user) === pass){

        msg.innerText =
            "Acceso correcto...";

        msg.className = "success";

        setTimeout(()=>{

            localStorage.setItem(
                "usuarioActivo",
                user
            );

            location = "index.html";

        },1000);

    } else {

        msg.innerText =
            "Usuario o contraseña incorrectos";

        msg.className = "error";
    }
}

function cerrarSesion(){

    localStorage.removeItem(
        "usuarioActivo"
    );

    location = "login.html";
}

// ==========================================
// BIBLIOTECA DINÁMICA
// ==========================================

const biblioteca = {};

const bibliotecaCSV =
"https://docs.google.com/spreadsheets/d/1rTS-hBOO0EuYaERYEos1IGGesvJBjATbpo75keTBHZ0/export?format=csv";

// MÁXIMO LIBROS VISIBLES
const LIMITE_LIBROS = 8;

// ==========================================
// PORTADA BIBLIOLUX SVG
// ==========================================

const PORTADA_LIBRO = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600'>

<rect width='100%' height='100%' fill='%23111111'/>

<rect x='20' y='20'
width='360'
height='560'
rx='20'
fill='%23181818'
stroke='%23333333'
stroke-width='2'/>

<text x='50%'
y='42%'
dominant-baseline='middle'
text-anchor='middle'
fill='white'
font-size='42'
font-family='Arial'
font-weight='bold'>

BiblioLux

</text>

<line x1='90'
y1='320'
x2='310'
y2='320'
stroke='%23666666'
stroke-width='2'/>

<text x='50%'
y='58%'
dominant-baseline='middle'
text-anchor='middle'
fill='%23bbbbbb'
font-size='22'
font-family='Arial'>

Conocimiento sin límites

</text>

</svg>`;

// ==========================================
// CARGAR GOOGLE SHEETS
// ==========================================

async function cargarBibliotecaRemota(){

    try{

        const respuesta =
            await fetch(
                bibliotecaCSV
            );

        const texto =
            await respuesta.text();

        const filas =
            texto
            .split("\n")
            .slice(1);

        filas.forEach(fila=>{

            const columnas =
                fila.split(",");

            const nombre =
                columnas[0]
                ?.replace(/"/g,"")
                .trim();

            let categoria =
                columnas[1]
                ?.replace(/"/g,"")
                .trim();

            const archivo =
                columnas[2]
                ?.replace(/"/g,"")
                .trim();

            const tipo =
                columnas[3]
                ?.replace(/"/g,"")
                .trim();

            if(
                !nombre ||
                !archivo
            ) return;

            // LIMPIAR CATEGORÍAS
            if(
                !categoria ||
                categoria.includes("http") ||
                categoria.length > 40
            ){

                categoria = "General";
            }

            // CREAR CATEGORÍA
            if(
                !biblioteca[categoria]
            ){

                biblioteca[categoria] = [];
            }

            // AGREGAR LIBRO
            biblioteca[categoria]
            .push({

                nombre,
                archivo,

                imagen:
                    PORTADA_LIBRO,

                tipo
            });

        });

    }catch(error){

        console.error(
            "Error cargando Google Sheets:",
            error
        );
    }
}

// ==========================================
// CONVERTIR LINK DRIVE
// ==========================================

function obtenerUrlDriveDirecta(url){

    if(!url) return url;

    if(
        !url.includes(
            'drive.google.com'
        )
    ){

        return url;
    }

    if(
        url.includes('/uc?') ||
        url.includes(
            'export=download'
        )
    ){

        return url;
    }

    const driveIdPatterns = [

        /\/file\/d\/([a-zA-Z0-9_-]{20,})/,

        /[?&]id=([a-zA-Z0-9_-]{20,})/,

        /\/open\?id=([a-zA-Z0-9_-]{20,})/
    ];

    for(
        const pattern
        of driveIdPatterns
    ){

        const match =
            url.match(pattern);

        if(match){

            return
`https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    }

    return url;
}

// ==========================================
// CARGAR LIBROS
// ==========================================

function cargarLibros(){

    let c =
        document.getElementById(
            "contenedorCategorias"
        );

    if(!c) return;

    c.innerHTML = "";

    for(let cat in biblioteca){

        let libros =
            biblioteca[cat];

        if(
            !libros ||
            libros.length === 0
        ) continue;

        let fila =
`
<h2>${cat}</h2>
<div class="fila">
`;

        // SOLO 8 LIBROS
        libros
        .slice(0, LIMITE_LIBROS)
        .forEach(libro=>{

            const enlace =
                obtenerUrlDriveDirecta(
                    libro.archivo
                );

            fila +=
`
<div class="libro">

    <img
        loading="lazy"
        src="${libro.imagen}"
        alt="${libro.nombre}"
    >

    <div class="info-libro">

        <p>${libro.nombre}</p>

        <a href="${enlace}"
           target="_blank"
           rel="noreferrer noopener">

           Descargar

        </a>

    </div>

</div>
`;
        });

        fila += `</div>`;

        // BOTÓN VER MÁS
        if(
            libros.length >
            LIMITE_LIBROS
        ){

            fila +=
`
<div class="ver-mas-container">

<button
class="ver-mas-btn"
onclick="mostrarMasLibros('${cat}')">

Ver más libros

</button>

</div>
`;
        }

        c.innerHTML += fila;
    }

    if(c.innerHTML.trim() === ""){

        c.innerHTML =
`
<div class="empty-state">

<p>
No hay libros disponibles.
</p>

</div>
`;
    }
}

// ==========================================
// MOSTRAR MÁS LIBROS
// ==========================================

function mostrarMasLibros(categoria){

    const contenedor =
        document.getElementById(
            "contenedorCategorias"
        );

    contenedor.innerHTML = "";

    for(let cat in biblioteca){

        let libros =
            biblioteca[cat];

        let fila =
`
<h2>${cat}</h2>
<div class="fila">
`;

        // MOSTRAR TODOS
        let librosMostrar =
            cat === categoria
            ? libros
            : libros.slice(
                0,
                LIMITE_LIBROS
            );

        librosMostrar
        .forEach(libro=>{

            const enlace =
                obtenerUrlDriveDirecta(
                    libro.archivo
                );

            fila +=
`
<div class="libro">

<img
loading="lazy"
src="${libro.imagen}"
alt="${libro.nombre}"
>

<div class="info-libro">

<p>${libro.nombre}</p>

<a href="${enlace}"
target="_blank">

Descargar

</a>

</div>

</div>
`;
        });

        fila += `</div>`;

        contenedor.innerHTML += fila;
    }
}

// ==========================================
// INICIAR
// ==========================================

async function initBiblioteca(){

    await cargarBibliotecaRemota();

    cargarLibros();
}

window.onload = initBiblioteca;

// ==========================================
// BUSCADOR
// ==========================================

function buscarLibro(){

    let t =
        buscador.value
        .toLowerCase();

    document
    .querySelectorAll(".libro")
    .forEach(l=>{

        l.style.display =
            l.innerText
            .toLowerCase()
            .includes(t)

            ? "block"
            : "none";
    });
}

// ==========================================
// REVEAL SCROLL
// ==========================================

window.addEventListener(
    "scroll",
    ()=>{

    document
    .querySelectorAll(".reveal")
    .forEach(el=>{

        if(
            el.getBoundingClientRect()
            .top
            <
            window.innerHeight - 50
        ){

            el.classList.add(
                "active"
            );
        }
    });
});