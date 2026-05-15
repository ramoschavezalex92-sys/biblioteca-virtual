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

// PORTADA SVG ULTRA LIGERA
const PORTADA_LIBRO = `
data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'>

<defs>
<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
<stop offset='0%' stop-color='%23050505'/>
<stop offset='100%' stop-color='%23141414'/>
</linearGradient>
</defs>

<rect width='100%' height='100%' fill='url(%23g)'/>

<circle cx='150' cy='120' r='45'
fill='none'
stroke='white'
stroke-width='2'
opacity='0.9'/>

<path d='M150 75 L162 108 L197 108 L168 128 L180 162 L150 142 L120 162 L132 128 L103 108 L138 108 Z'
fill='white'
opacity='0.9'/>

<text
x='50%'
y='250'
fill='white'
font-size='34'
font-family='Arial'
font-weight='bold'
text-anchor='middle'>
BiblioLux
</text>

<text
x='50%'
y='290'
fill='%23cccccc'
font-size='16'
font-family='Arial'
text-anchor='middle'>
Conocimiento sin límites
</text>

</svg>
`;

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

            // ==========================================
            // LIMPIEZA INTELIGENTE DE CATEGORÍAS
            // ==========================================

            if(!categoria){

                categoria = "General";
            }

            // ELIMINAR LINKS
            if(
                categoria.includes("http") ||
                categoria.includes("drive.google")
            ){

                categoria = "General";
            }

            // ELIMINAR IDs EXTRAÑOS
            if(
                categoria.length > 25 ||
                categoria.includes("_") ||
                categoria.includes("=") ||
                categoria.includes("?")
            ){

                categoria = "General";
            }

            // LIMPIAR NÚMEROS Y SÍMBOLOS
            categoria = categoria
                .replace(/[0-9]/g, "")
                .replace(/[-_]/g, " ")
                .trim();

            // FORMATO BONITO
            categoria =
                categoria.charAt(0).toUpperCase() +
                categoria.slice(1).toLowerCase();

            // SI QUEDA VACÍA
            if(categoria.length < 3){

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

// ==========================================
// PARTÍCULAS OPTIMIZADAS
// ==========================================

const canvas = document.getElementById("particles");

if(canvas){

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for(let i=0;i<25;i++){

        particles.push({

            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height,
            size:Math.random()*1.2,
            speedX:(Math.random()-0.5)*0.15,
            speedY:(Math.random()-0.5)*0.15
        });
    }

    function animar(){

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        particles.forEach(p=>{

            p.x+=p.speedX;
            p.y+=p.speedY;

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI*2
            );

            ctx.fillStyle =
                "rgba(200,200,200,0.12)";

            ctx.fill();
        });

        requestAnimationFrame(animar);
    }

    animar();
}