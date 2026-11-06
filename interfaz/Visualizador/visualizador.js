let nombres = new Array();
let ArrayNameyText = new Array();
let jsonPath;
// arreglos donde se mantienen los archivos extra agregados
let multimediasAgregados = new Array();
let capturasParticipantes = new Map();
let capturasChat= new Array();
// indice de las listas de archivos extras agregados
let selectedCapturaIndex=null;
let selectedMultimediaIndex = null;
let selectedParticipanteCapIndex = null;
let nombreSeleccionado;
let indexMensajes=0;

function callBackPromise(method, ...args) {

    return new Promise((resolve, reject) => {

        if (!api || typeof api[method] !== "function") {
            reject(new Error("API no disponible"));
            return;
        }

        api[method](...args, resolve);

    });

}

document.getElementById("Nombres_Personas").addEventListener("change", (event) => {
    nombreSeleccionado = document.getElementById("Nombres_Personas").options[document.getElementById("Nombres_Personas").selectedIndex].value;
    if(!nombreSeleccionado){
            nombreSeleccionado = document.getElementById("Nombres_Personas").options[0].value;
    }
});
function GuardarNombres(Array_JSON){
    let primeraVez = 0;
    let arrayNombres = new Array();
    let nombre;

    // Make sure Array_JSON is valid before looping
    if (!Array.isArray(Array_JSON)) {
        return [];
    }

    for (let index = 0; index < Array_JSON.length; index++) {
        // FIX: Use Array_JSON instead of ArrayJSON
        let item = Array_JSON[index];
        if (item && item.Nombre) {
            nombre = item.Nombre; // or Array_JSON[index].Nombre

            if(nombre != "SistemaDeWhatsApp"){
                if(primeraVez === 0){
                    arrayNombres.push(nombre);
                    primeraVez = 1;
                }else{
                    if(!arrayNombres.includes(nombre)){
                        arrayNombres.push(nombre);
                    }
                }
            }
        }
    }
    return arrayNombres; 
}

function CargarNombresFront(nombres){

    for (let index = 0; index < nombres.length; index++) {
                    
        let objNameYText = {
            nombre:"",
            texto:""
        }
        objNameYText.nombre = nombres[index];
        objNameYText.texto = nombres[index];
        // Falta el texto 
        ArrayNameyText.push(objNameYText);
        
    }

    const $nombresSelect = document.querySelector("#Nombres_Personas");
    
    const indice = $nombresSelect.selectedIndex;

    if(indice != -1){ // Ya existen elementos, elimino y luego abajo se creán 
        for (let i = $nombresSelect.options.length; i >= 0; i--) { // Este for es por si se habre otro chat en el html, sin actualizar. Por eso es que lo debo sacar lo viejo 
            $nombresSelect.remove(i);
        }
    }

    // Si no existen elementos, se crean... 
    for (let index = 0; index < nombres.length; index++) {
        const option = document.createElement('option');
        option.textContent = `${nombres[index]}`;
        $nombresSelect.appendChild(option);
    }
    const sinactor = document.createElement('option');
    sinactor.textContent = "Sin actor Principal";
    $nombresSelect.appendChild(sinactor);
    
}

function toMs(dateStr) {
    // desarmamos el string por los '-' los descartamos y lo transformamos en un array
    let cleanDate = dateStr.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim();
    let parts = cleanDate.split("/");
    let newStr;

    if(parts[2].length === 4){
        newStr = parts[2].substring(2, parts[2].length);
        console.log("El nuevo string tiene: "+newStr);
        return new Date(newStr, parts[1] - 1, parts[0]).getTime();
    }

    return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
}

function createMultimedia(chatFolderName, arrNyE, type,container) {
    const cleanFileName = (arrNyE[0] + "." + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
    const relativePath = `/chats_extracted/${chatFolderName}/${cleanFileName}`;
    const a = document.createElement('a');
    a.textContent = cleanFileName;
    a.classList.add('text-blue-600', 'underline', 'flex', 'items-center', 'gap-2', 'my-1');

    a.addEventListener('click', function (event) {
        event.preventDefault();
        if ( api) {
            const pathFile = `/fuentes/${cleanFileName}`;
            callBackPromise('open_file_window',pathFile);
        }
        }
    );
    if (type) {
        const multi = document.createElement(type);
        multi.setAttribute('src', relativePath);

        switch (type) {
            case "img":
                multi.setAttribute('loading','lazy');
                multi.setAttribute('width', '640');
                multi.setAttribute('height', '480');
                multi.classList.add('rounded-lg', 'object-cover', 'max-w-full', 'h-auto');
                break;
            case "video":
                multi.setAttribute('loading','lazy');
                multi.setAttribute('width', '640');
                multi.setAttribute('height', '480');
                multi.setAttribute('preload', 'none');
                multi.controls = true;
                multi.classList.add('max-w-full', 'rounded-lg');
                break;
            case "audio":
                multi.setAttribute('preload', 'none');
                multi.controls = true;
                multi.classList.add('w-full');
                break;
        }

        multi.addEventListener('error', function () {
            container.innerHTML = '';
            let small = document.createElement("small");
            let icon = document.createElement("i");
            icon.classList.add('fa-solid', 'fa-circle-exclamation', 'fa-2x');
            small.textContent = " No se encontró el archivo multimedia ";
            container.appendChild(icon);
            container.appendChild(small);
        }, false);
        container.appendChild(a);
        container.appendChild(multi);
        return;
    }
    const icon = document.createElement("i");
    icon.classList.add('fa-regular', 'fa-file', 'fa-2x');
    a.prepend(icon);

}

function MensajesDinamicos(chatFolderName, iniciales1, iniciales2, msjDelSistema, nombre, archivo, mensaje, fechaYhora){

        const principal = (nombre == nombreSeleccionado)
        const sistema =    (nombre == msjDelSistema)
        let divFlex = document.createElement("div");
        let divPull = document.createElement("div");
        if(!sistema){
            let alineacion = principal ? 'justify-end' : 'justify-start';
            divFlex.classList.add('flex', alineacion, 'mb-12', 'w-full');
            divPull.classList.add('pull_left', 'userpic_wrap', 'w-12', 'mr-4', 'self-end');
            if(!principal){
            divFlex.appendChild(divPull);}
            let marg = principal ? 'ml-4' : 'mr-4';
            divPull.classList.add('pull_left', 'userpic_wrap', 'w-12', marg, 'self-end');
            divFlex.appendChild(divPull);
            let divUserPic = document.createElement("div");
            let pic = principal ? 'userpic5' : 'userpic8';
            divUserPic.classList.add('userpic', pic);
            divUserPic.style.width = '42px';
            divUserPic.style.height = '42px';
            let divInitials = document.createElement("div");
            divInitials.classList.add('initials');
            divInitials.style.lineHeight = '42px';
            divInitials.textContent = principal ? `${iniciales1}` : `${iniciales2}`;
            divUserPic.appendChild(divInitials);
            divPull.appendChild(divUserPic);

        }else{
            divFlex.classList.add('flex','justify-center','items-center'); // Mensaje del Sistema
        }
        let divFlexCol = document.createElement("div");
        divFlexCol.classList.add('flex', 'flex-col');
        divFlex.appendChild(divFlexCol);
        let divBg_white = document.createElement("div");

        if (sistema) {
              divBg_white.classList.add('bg-slate-200', 'w-full');
         } else if (principal) {
            divBg_white.classList.add('p-6','w-96','rounded-3xl','rounded-br-none', 'shadow-sm', 'mb-2');
            divBg_white.style.background = '#dcf8c6';
          } else {
            divBg_white.classList.add('bg-white','p-6','w-96','rounded-3xl','rounded-bl-none', 'shadow-sm', 'mb-2');
        }

        divFlex.appendChild(divFlexCol);
        divFlexCol.appendChild(divBg_white);
        let mb = document.createElement("p");
        mb.classList.add('mb-1');
        const isLargeNumber = (element) => element.nombre === nombre;
        if(ArrayNameyText.findIndex(isLargeNumber) != -1){ // Acá tambien le doy valor al mensaje del sistema
                mb.textContent = ArrayNameyText[ArrayNameyText.findIndex(isLargeNumber)].texto;
        }else{
            mb.textContent = `${mensaje}`; // Mensaje del Sistema
        }
        divBg_white.appendChild(mb);

        // Le creo otro small para guardar el mensaje, solo si no es el sistema
        const textGray = document.createElement("small");
        //textGray2.classList.add('text-gray-500','font-light');
        textGray.classList.add('text-gray-500','font-light','overflow-hidden', 'overflow-ellipsis', 'block','text-base');
        if(!sistema){
            if(archivo != ""){ // Si hay archivo

                const arrNyE = archivo.split('.');
                let punto  = ".";

                if(punto+arrNyE[1] === ".webp" || punto+arrNyE[1] === ".png" || punto+arrNyE[1] === ".jpg" || punto+arrNyE[1] === ".jpeg" ||
                punto+arrNyE[1] === ".gif" || punto+arrNyE[1] === ".tiff"){ // TODO LO QUE TENGA QUE VER CON IMAGENES
                    createMultimedia(chatFolderName+"/fuentes",arrNyE,"img",divBg_white);

                }else if(punto+arrNyE[1] === ".mp4" || punto+arrNyE[1] === ".mkv" || punto+arrNyE[1] === ".avi" || punto+arrNyE[1] === ".mov" ||
                punto+arrNyE[1] === ".flv" || punto+arrNyE[1] === ".divx"){ // TODO LO QUE TENGA QUE VER CON VIDEOS.

                    createMultimedia(chatFolderName+"/fuentes",arrNyE,"video",divBg_white);

                }else if(punto+arrNyE[1] === ".mp3" || punto+arrNyE[1] === ".m4a" || punto+arrNyE[1] === ".aac" || punto+arrNyE[1] === ".wav" || punto+arrNyE[1] === ".aiff" ||
                punto+arrNyE[1] === ".wma" || punto+arrNyE[1] === ".opus" || punto+arrNyE[1] === ".ogg"){ // TODO LO QUE TENGA QUE VER CON MUSICA.
                    createMultimedia(chatFolderName+"/fuentes",arrNyE,"audio",divBg_white);

                }else if(punto+arrNyE[1] === ".pdf" || punto+arrNyE[1] === ".doc" || punto+arrNyE[1] === ".docx" || punto+arrNyE[1] === ".txt" ||
                punto+arrNyE[1] === ".odt" || punto+arrNyE[1] === ".xlsx" || punto+arrNyE[1] === ".pptx"){
                    // FALTA CONTROLAR SI NO FALTA EL DOCUMENTO.
                    createMultimedia(chatFolderName+"/fuentes",arrNyE,"",divBg_white);

                }else if(punto+arrNyE[1] === ".py" || punto+arrNyE[1] === ".rar" || punto+arrNyE[1] === ".zip" ||  punto+arrNyE[1] === ".html" ||
                punto+arrNyE[1] === ".tmp" || punto+arrNyE[1] === ".dat" || punto+arrNyE[1] === ".exe" || punto+arrNyE[1] === ".deb" ||
                punto+arrNyE[1] === ".vcf" || punto+arrNyE[1] === ".dmg" || punto+arrNyE[1] === ".psd" || punto+arrNyE[1] === ".sql"){

                     createMultimedia(chatFolderName+"/fuentes",arrNyE,"",divBg_white);
                }

            }}
            let a = document.createElement("a");
            let icon = document.createElement("i");
            let erLlamada = /^null$/;
            let erLlamadaperdida = /^Llamada perdida$/;

            if(erLlamada.test(mensaje)){
                icon.classList.add('fa-solid','fa-phone','arrow-up-right','fa-2x');
                a.appendChild(icon);
                divBg_white.appendChild(a);
                textGray.textContent = 'Llamada'
            }else if(erLlamadaperdida.test(mensaje)){
                icon.classList.add('fa-solid','fa-phone-slash','arrow-up-right','fa-2x');
                a.appendChild(icon);
                divBg_white.appendChild(a);
                textGray.textContent = 'Llamada perdida'
            }else{
                textGray.textContent = `${mensaje}`;
            }
            divBg_white.appendChild(textGray);
        // La hora la comparten tanto el que tiene el sistema como el que no tiene el sistema.
        let textGrayHora = document.createElement("small");
        textGrayHora.classList.add('text-gray-500','font-light');
        textGrayHora.textContent = `${fechaYhora}`;
        divFlexCol.appendChild(textGrayHora);
        if(principal){
            divFlex.appendChild(divPull);
        }
        return divFlex;
}


async function CargarMensajesFront(path, limit){
    let id_div = document.getElementById("idContenido");
    let iniciales1 = "U1";
    let iniciales2 = "U2";
    let msjDelSistema = "SistemaDeWhatsApp";
    let index;
    let index_max;
    let method = "appendChild";
     if (limit < 0) {
         index = Math.max(0, indexMensajes + limit);
         index_max = Math.abs(limit);
    }
     else{
         index_max = limit;
         index=indexMensajes;
     }
    const messages_l = [];
     let x=0;
    for (; index < ArrayJSON.length; index++) {
        const nombre = ArrayJSON[index].Nombre;
        const archivo = ArrayJSON[index].NameFileWhitExtension;
        const mensaje = ArrayJSON[index].Mensaje;
        const fechaYhora = ArrayJSON[index].Fecha +" "+ArrayJSON[index].Hora;
        if(window.fechas.length>0){
            const isWithinAnyInterval = window.fechas.some(interval =>
        toMs( ArrayJSON[index].Fecha) >= toMs(interval.start) && toMs( ArrayJSON[index].Fecha) <= toMs(interval.end)
        );
        if (isWithinAnyInterval) {
            messages_l.push(MensajesDinamicos(path, iniciales1, iniciales2, msjDelSistema, nombre, archivo, mensaje, fechaYhora));
            x++;
        }
        }else{
            messages_l.push(MensajesDinamicos(path, iniciales1, iniciales2, msjDelSistema, nombre, archivo, mensaje, fechaYhora,));
            x++;
        }
}
    const fragment = document.createDocumentFragment();
/*    if (limit < 0) {
        messages_l.reverse().forEach(element => {
            fragment.appendChild(element);
        });
        id_div.prepend(fragment);
    } else {
        messages_l.forEach(element => {
            fragment.appendChild(element);
        });
        id_div.appendChild(fragment);
        indexMensajes = index;
    }*/
       messages_l.forEach(element => {
            fragment.appendChild(element);
        });
        id_div.appendChild(fragment);

}



// Evento Agregar Información 
let btnAgregar = document.getElementById("BtnAgregar");
let textArea = document.getElementById("contenidoTextArea");
textArea.value = "";
btnAgregar.addEventListener("click",() =>{

    let InputText = document.getElementById("InputTexto");
    const $nombresSelect = document.querySelector("#Nombres_Personas");
    const indice = $nombresSelect.selectedIndex;

    if(indice === ArrayNameyText.length){ // Es decir que seleccionaron el actor Principal. 
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No es posible aportar información si no hay autor',
        })

    }else{

        if(InputText.value != ""){
            ArrayNameyText[indice].texto = ArrayNameyText[indice].nombre+ " - " + InputText.value;
            textArea.value = textArea.value + ArrayNameyText[indice].nombre + " - " +ArrayNameyText[indice].texto + "\n";
            console.log(ArrayNameyText);
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No ha aportado información!',
            })
        }

    }
    InputText.value = "";

    console.log(ArrayNameyText);
        
});

// funcion para selecciona y parsear un txt o archivo comprimido.
async function open_file() {
    const result = await callBackPromise('open_file');
    let ArrayParaNombres = result.json;
    nombres = GuardarNombres(ArrayParaNombres);
    ArrayJSON = result.json;
    jsonPath = result.path;
    CargarNombresFront(nombres)
    if(!nombreSeleccionado){
            nombreSeleccionado = nombres[0];
    }
    let id = document.getElementById("idContenido");
     while(id.firstChild) {
        id.removeChild(id.firstChild);
    }
        indexMensajes=0;
        CargarMensajesFront(jsonPath,400);
}


function recargarMensajes(lim){
    indexMensajes = 0;
    let id = document.getElementById("idContenido");
     while(id.firstChild) {
        id.removeChild(id.firstChild);
    }
        CargarMensajesFront(jsonPath,lim);
}

document.getElementById('tab-informe').addEventListener('click', () => {

    renderList("scrollParticipantes", ArrayNameyText.map(obj => Object.values(obj)[1]), selectedIndex, (nombreParticipante, index) => {
        selectedIndex = index;

        if (!capturasParticipantes.has(nombreParticipante)) {
            capturasParticipantes.set(nombreParticipante, []);
        }
        selectedCapturaIndex = null;

        renderList("scrollCapturasParticipantes", capturasParticipantes.get(nombreParticipante), selectedCapturaIndex, (capItem, capIndex) => {
            selectedCapturaIndex = capIndex;
        });
    });
}

);

async function generarReporte(event){
    event.preventDefault();
const datosFormulario = {
        pex: document.getElementById('inputPEX').value,
        fecha_reporte: document.getElementById('inputFechaReporte').value
    };

    const perito = {
        nombre: document.getElementById('inputNombrePerito').value,
        apellido: document.getElementById('inputApellidoPerito').value,
        dependencia: document.getElementById('inputDependenciaPerito').value
    };

    const aportante = {
        nombre: document.getElementById('inputNombreAportante').value,
        apellido: document.getElementById('inputApellidoAportante').value,
        dni: document.getElementById('inputDNIAportante').value
    };

    const dispositivo = {
        marca: document.getElementById('inputMarcaDispositivo').value,
        modelo: document.getElementById('inputModeloDispositivo').value,
        imei: document.getElementById('inputImeiDispositivo').value
    };

    let divChat = document.getElementById("idContenido").innerHTML;
    let res = await callBackPromise('gen_repo',perito,aportante,dispositivo,datosFormulario,Object.fromEntries(capturasParticipantes),multimediasAgregados,capturasChat,nombres,window.fechas,divChat);
}

async function exportarChat(){
    let divChat = document.getElementById("idContenido").innerHTML;
    let res = await callBackPromise('export_chat',window.fechas,divChat);
}

async function agregarArrayDesdeArchivo(scrollId,array,onIndexChange,mode, loc){
 let res = await callBackPromise('add_other',mode, loc);
 if(res.files.length>0){
 array.push(...res.files);
 const nuevoIndex = array.length - 1;
 onIndexChange(nuevoIndex);
   renderList(scrollId, array, nuevoIndex, (item, index) => {
                    onIndexChange(index);
                });
 }
}

async function eliminarLista(scrollId,array,onIndexChange,indexToRemove, loc){
    const file = array[indexToRemove];
    const res = await callBackPromise('del_other',file, loc);
     if(res.res){
         array.splice(indexToRemove, 1)
    const nuevoIndex = array.length > 0 ? Math.min(indexToRemove, array.length - 1) : null;
         onIndexChange(nuevoIndex);
    renderList(scrollId, array, nuevoIndex, (item, index) => {
            onIndexChange(index);
            }
        );
     }
}


document.getElementById('agregarMultimediaBtn').addEventListener('click',() => {
    agregarArrayDesdeArchivo('scrollMultimedia', multimediasAgregados, (nuevoIndex) => {
        selectedMultimediaIndex = nuevoIndex;
    },"", "adicionales");
});


document.getElementById('agregarCapturaBtn').addEventListener('click',() => {
    const nombre=ArrayNameyText[selectedIndex].nombre;
    if (!capturasParticipantes.has(nombre)) {
        capturasParticipantes.set(nombre, []);
    }
    agregarArrayDesdeArchivo('scrollCapturasParticipantes', capturasParticipantes.get(nombre), (nuevoIndex) => {
        selectedParticipanteCapIndex = nuevoIndex;
    },"img", "capturas_"+nombre);
        console.log(capturasParticipantes);
}
);

document.getElementById('agregarCapturaChatBtn').addEventListener('click',() => {
    agregarArrayDesdeArchivo('scrollCapturasChat', capturasChat, (nuevoIndex) => {
        selectedCapturaIndex = nuevoIndex;
    },"img", "capturas_chat");
});

document.getElementById('eliminarMultimediaBtn').addEventListener('click', () => {
    eliminarLista('scrollMultimedia', multimediasAgregados, (nuevoIndex) => {
        selectedMultimediaIndex = nuevoIndex;
    },selectedMultimediaIndex,"adicionales");
});


document.getElementById('eliminarCapturaChatBtn').addEventListener('click', () => {
    console.log(selectedCapturaIndex  );
    console.log(capturasChat[selectedCapturaIndex]);
    eliminarLista('scrollCapturasChat', capturasChat, (nuevoIndex) => {
        selectedCapturaIndex = nuevoIndex;
    },selectedCapturaIndex,"capturas_chat");

});

document.getElementById('eliminarCapturaBtn').addEventListener('click', () => {
    const nombre=ArrayNameyText[selectedIndex].nombre;
    if (!capturasParticipantes.has(nombre)) {
        capturasParticipantes.set(nombre, []);
    }else{
    eliminarLista('scrollCapturasParticipantes', capturasParticipantes.get(nombre), (nuevoIndex) => {
        selectedParticipanteCapIndex = nuevoIndex;
    },selectedParticipanteCapIndex,"capturas_"+nombre);
    }
});

function cleanN(nodo) {
    const videos = nodo.querySelectorAll('video');
    videos.forEach(v => {
        v.pause();
        v.src = "";
        v.load();
    });

    const audios = nodo.querySelectorAll('audio');
    audios.forEach(a => {
        a.pause();
        a.src = "";
        a.load();
    });

    const imagenes = nodo.querySelectorAll('img');
    imagenes.forEach(img => {
        img.src = "";
    });
}
/*
const div_cont_chat = document.getElementById("idContenido");
let isLoading  = false;

div_cont_chat.addEventListener("scroll", async () => {
    if (isLoading) return;
    const top = div_cont_chat.scrollTop <= 50;
    const bot = div_cont_chat.scrollTop + div_cont_chat.clientHeight >= div_cont_chat.scrollHeight - 50;

    if (bot) {
        isLoading = true;
        const scrollHeightB = div_cont_chat.scrollHeight;
        const scrollTopB = div_cont_chat.scrollTop;
        await CargarMensajesFront(jsonPath, 100);
        div_cont_chat.scrollTop = scrollTopB + (div_cont_chat.scrollHeight - scrollHeightB);
        for (let x = 0; div_cont_chat.firstChild && x < 100; x++) {
            const child = div_cont_chat.firstChild;
            cleanN(child);
            div_cont_chat.removeChild(child);
        }
        isLoading = false;
    }
    if (top) {
        isLoading = true;
        for (let x = 0; div_cont_chat.firstChild && x < 100; x++) {
            const child = div_cont_chat.firstChild;
            cleanN(child);
            div_cont_chat.removeChild(child);
            await CargarMensajesFront(jsonPath, -200);
            isLoading = false;
        }
    }
});*/



