let nombres = new Array();
let ArrayNameyText = new Array();
let jsonPath;
// arreglos donde se mantienen los archivos extra agregados
let multimediasAgregados = new Array();
let capturasParticipantes = new Map();
let capturasChat= new Array();
let capturasDipositivo = new Array();
// indice de las listas de archivos extras agregados
let selectedCapturaIndex=null;
let selectedMultimediaIndex = null;
let selectedParticipanteCapIndex = null;
let selectedDispositivoIndex = null;
let nombreSeleccionado;
let indexMensajes=0;
let selectedIndex = null;
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
    //limpio la lista de nombres antes de introducir nuevos
    while(listaNombresPart.hasChildNodes()){
        listaNombresPart.removeChild(listaNombresPart.firstChild);
    }
    ArrayNameyText.forEach(participante => {
                const li = document.createElement("li");
                li.className = 'list-group-item bg-slate-800 text-slate-200 border-slate-700 text-sm py-2 border-bottom';
                li.textContent = participante.texto;
                listaNombresPart.appendChild(li);
            });
    
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
function MensajesDinamicos(chatFolderName, iniciales1, iniciales2, msjDelSistema, nombre, archivo, mensaje, fechaYhora, edit) {

    const principal = (nombre == nombreSeleccionado);
    const sistema = (nombre == msjDelSistema);

    let divFlex = document.createElement("div");
    let divFlexCol = document.createElement("div");
    divFlexCol.classList.add('flex', 'flex-col');

    let divBg_white = document.createElement("div");

    if (sistema) {
        divFlex.classList.add('flex', 'justify-center', 'items-center', 'w-full', 'mb-4');
        divBg_white.classList.add('bg-slate-200', 'w-full', 'rounded-lg', 'p-2', 'text-center');

        let mb = document.createElement("p");
        mb.classList.add('mb-1', 'text-sm', 'text-gray-700');
        mb.textContent = `${mensaje}`;
        divBg_white.appendChild(mb);

    } else {

        let alineacion = principal ? 'justify-end' : 'justify-start';
        divFlex.classList.add('flex', alineacion, 'mb-12', 'w-full');

        let divPull = document.createElement("div");
        let marg = principal ? 'ml-4' : 'mr-4';
        divPull.classList.add('pull_left', 'userpic_wrap', 'w-12', marg, 'self-end');

        if (!principal) {
            divFlex.appendChild(divPull);
        }

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


        if (principal) {
            divBg_white.classList.add('p-6', 'w-96', 'rounded-3xl', 'rounded-br-none', 'shadow-sm', 'mb-2');
            divBg_white.style.background = '#dcf8c6';
        } else {
            divBg_white.classList.add('bg-white', 'p-6', 'w-96', 'rounded-3xl', 'rounded-bl-none', 'shadow-sm', 'mb-2');
        }
        let mb = document.createElement("p");
        const isLargeNumber = (element) => element.nombre === nombre;
        if(ArrayNameyText.findIndex(isLargeNumber) != -1){  // Acá tambien le doy valor al mensaje del sistema
                    mb.textContent = ArrayNameyText[ArrayNameyText.findIndex(isLargeNumber)].texto;
                    divBg_white.appendChild(mb);
            }
        if (archivo != "") {
            const arrNyE = archivo.split('.');
            let punto = ".";
            let ext = (punto + arrNyE[1]).toLowerCase();

            if ([".webp", ".png", ".jpg", ".jpeg", ".gif", ".tiff"].includes(ext)) {
                createMultimedia(chatFolderName + "/fuentes", arrNyE, "img", divBg_white);
            } else if ([".mp4", ".mkv", ".avi", ".mov", ".flv", ".divx"].includes(ext)) {
                createMultimedia(chatFolderName + "/fuentes", arrNyE, "video", divBg_white);
            } else if ([".mp3", ".m4a", ".aac", ".wav", ".aiff", ".wma", ".opus", ".ogg"].includes(ext)) {
                createMultimedia(chatFolderName + "/fuentes", arrNyE, "audio", divBg_white);
            } else {
                createMultimedia(chatFolderName + "/fuentes", arrNyE, "", divBg_white);
            }
        }

        let textGray = document.createElement("small");
        textGray.classList.add('text-black', 'font-light', 'overflow-hidden', 'overflow-ellipsis', 'block', 'text-base');

        let a = document.createElement("a");
        let icon = document.createElement("i");
        let erLlamada = /^null$/;
        let erLlamadaperdida = /^Llamada perdida$/;

        if (erLlamada.test(mensaje)) {
            icon.classList.add('fa-solid', 'fa-phone', 'arrow-up-right', 'fa-2x');
            a.appendChild(icon);
            divBg_white.appendChild(a);
            textGray.textContent = 'Llamada';
        } else if (erLlamadaperdida.test(mensaje)) {
            icon.classList.add('fa-solid', 'fa-phone-slash', 'arrow-up-right', 'fa-2x');
            a.appendChild(icon);
            divBg_white.appendChild(a);
            textGray.textContent = 'Llamada perdida';
        } else {
            textGray.textContent = `${mensaje}`;
        }
        divBg_white.appendChild(textGray);

        if (principal) {
            divFlex.appendChild(divPull);
        }
    }
    divFlex.appendChild(divFlexCol);
    divFlexCol.appendChild(divBg_white);
    let textGrayHora = document.createElement("small");
    textGrayHora.classList.add('text-black', 'font-light');
    textGrayHora.textContent = edit ? `editado ${fechaYhora}` : `${fechaYhora}`;
    divFlexCol.appendChild(textGrayHora);
    return divFlex;
}

function createMsgDate(date,msg){
            let divFlex = document.createElement("div");
            divFlex.id = "Mensaje-fecha-" + date;
            divFlex.classList.add('flex','justify-center','items-center');
            let divBg_white = document.createElement("div");
            divBg_white.classList.add('bg-slate-200', 'w-full', 'rounded-lg', 'p-2');
            let divFlexCol = document.createElement("div");
            divFlexCol.classList.add('flex', 'flex-col');
            divFlex.appendChild(divFlexCol);
            divFlexCol.appendChild(divBg_white);
            let mb = document.createElement("p");
            mb.classList.add('mb-1');
            mb.textContent = `${msg} ${date} `;
            divBg_white.appendChild(mb);
            return divFlex;
}

async function CargarMensajesFront(path, limit){
    newInfo = false;
    let id_div = document.getElementById("idContenido");
    let iniciales1 = "U1";
    let iniciales2 = "U2";
    let msjDelSistema = "SistemaDeWhatsApp";
    let prev_date=toMs("01/01/1900"); // fecha de prueba para que el primer mensaje siempre tenga etiqueta
    const fragment = document.createDocumentFragment();

    if(window.fechas.length>0){
            let flag_date= Array.from({ length: fechas.length }, () => false);
            for (let index=0; index < ArrayJSON.length; index++) {
                const nombre = ArrayJSON[index].Nombre;
                const archivo = ArrayJSON[index].NameFileWhitExtension;
                const mensaje = ArrayJSON[index].Mensaje;
                const hora = ArrayJSON[index].Hora;
                const fecha = ArrayJSON[index].Fecha;
                const edit = ArrayJSON[index].edit;
                let next = false;
                let index_date=0;
                while (!next && index_date<window.fechas.length) {
                    if (toMs(ArrayJSON[index].Fecha) >= toMs(window.fechas[index_date].start) && toMs(ArrayJSON[index].Fecha) <= toMs(window.fechas[index_date].end)) {
                        if (toMs(ArrayJSON[index].Fecha) > prev_date) {
                            if (!flag_date[index_date]) {
                                //pusheo el mensaje que diga que empezo el intervalo
                                const msgSDate = createMsgDate(window.fechas[index_date].display, "Inicio del periodo:");
                                fragment.appendChild(msgSDate);
                                flag_date[index_date] = true;
                                window.fechas[index_date].reference=msgSDate.id;
                            }
                            fragment.appendChild(createMsgDate(fecha,""));
                        }
                        fragment.appendChild(MensajesDinamicos(path, iniciales1, iniciales2, msjDelSistema, nombre, archivo, mensaje, fecha + " " + hora,edit));
                        prev_date=toMs(ArrayJSON[index].Fecha) ;
                        next=true; //No avanzo hasta que no encuentro un periodo valido para el mensaje
                        //Como los mensajes estan ordenados si no hay un periodo para este mensaje no va a existir un periodo para los demas
                        }
                        else {
                            index_date++;
                        }
                }
            }
        } else{
            for (let index=0; index < ArrayJSON.length; index++) {
                const nombre = ArrayJSON[index].Nombre;
                const archivo = ArrayJSON[index].NameFileWhitExtension;
                const mensaje = ArrayJSON[index].Mensaje;
                const hora= ArrayJSON[index].Hora;
                const fecha= ArrayJSON[index].Fecha;
                const edit = ArrayJSON[index].edit;
                if(toMs(ArrayJSON[index].Fecha) > prev_date){
                             //pushe0 el nuevo dia
                        fragment.appendChild(createMsgDate(fecha,""));
                    }
                prev_date=toMs(ArrayJSON[index].Fecha) ;
                fragment.appendChild(MensajesDinamicos(path, iniciales1, iniciales2, msjDelSistema, nombre, archivo, mensaje, fecha+" "+hora,edit));
        }}
        id_div.appendChild(fragment);
}



// Evento Agregar Información 
let btnAgregar = document.getElementById("BtnAgregar");
let listaNombresPart = document.getElementById("listaParticipantes");

btnAgregar.addEventListener("click",() =>{
    newInfo=true;
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
             while(listaNombresPart.hasChildNodes()){
                listaNombresPart.removeChild(listaNombresPart.firstChild);
            }
            ArrayNameyText.forEach(participante => {
                const li = document.createElement("li");
                li.className = 'list-group-item bg-slate-800 text-slate-200 border-slate-700 text-sm py-2 border-bottom';
                li.textContent = participante.texto;
                listaNombresPart.appendChild(li);
            });
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No ha aportado información!',
            })
        }

    }
    InputText.value = "";
});

// funcion para selecciona y parsear un txt o archivo comprimido.
async function open_file() {
    const result = await callBackPromise('open_file');
    let ArrayParaNombres = result.json;
    ArrayNameyText = [];
    nombres=[];
    console.log("nombre "+nombres + "array "+ ArrayNameyText);
    nombres = GuardarNombres(ArrayParaNombres);
        console.log("nombre "+nombres + "array "+ ArrayNameyText);
    ArrayJSON = result.json;
    jsonPath = result.path;
    //renuevo los datos del contenedor
    CargarNombresFront(nombres);
    nombreSeleccionado = nombres[0];
      recargarMensajes(100);
          const editor= document.getElementById("textEditor");
        editor.value = "";
        result.txt.forEach((line)=>{
        editor.value +=  line;
    });
}

async function save_txt(){
    txt = document.getElementById("textEditor").value;
    const result = await callBackPromise('save_txt',txt);
       let ArrayParaNombres = result.json;
    ArrayNameyText = [];
    nombres=[];
    console.log("nombre "+nombres + "array "+ ArrayNameyText);
    nombres = GuardarNombres(ArrayParaNombres);
    ArrayJSON = result.json;
    CargarNombresFront(nombres);
    recargarMensajes(100);
}

document.getElementById("saveBtn").addEventListener('click', () => {
    save_txt();
});




document.getElementById('enableEditCheckbox').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const textEditor = document.getElementById('textEditor');
    const saveBtn = document.getElementById('saveBtn');

    let confirmacion = true;

    if (isChecked && textEditor.disabled) {
        confirmacion = confirm("Los cambios al txt deben realizarse únicamente para corregir errores de la generación.");
    }

    if (confirmacion) {
        textEditor.disabled = !isChecked;
        saveBtn.disabled = !isChecked;
        saveBtn.style.opacity = isChecked ? '1' : '0.6';
        saveBtn.style.cursor = isChecked ? 'pointer' : 'not-allowed';

        if (isChecked) {
            textEditor.focus();
        }
    } else {
        e.target.checked = false;
    }
});

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
        fecha_reporte: document.getElementById('inputFechaReporte').value,
        requiriente: document.getElementById("inputRequiriente").value
    };

    const perito = {
        nombre: document.getElementById('inputNombrePerito').value,
        apellido: document.getElementById('inputApellidoPerito').value,
        dependencia: document.getElementById('inputDependenciaPerito').value
    };

    const aportante = {
        nombre: document.getElementById('inputNombreAportante').value,
        apellido: document.getElementById('inputApellidoAportante').value,
        dni: document.getElementById('inputDNIAportante').value,
        telefono: document.getElementById("inputTelefonoAportante").value
    };

    const dispositivo = {
        marca: document.getElementById('inputMarcaDispositivo').value,
        modelo: document.getElementById('inputModeloDispositivo').value,
        imei: document.getElementById('inputImeiDispositivo').value
    };
    const descriptcion = document.getElementById("inputDescripcionMultimedia").value;
    //vuelvo a cargar los mensajes
    if(newInfo){
     let id = document.getElementById("idContenido");
     while(id.firstChild) {
        id.removeChild(id.firstChild);
    }
     await CargarMensajesFront(jsonPath,400);
    }
    let divChat = document.getElementById("idContenido").innerHTML;

    let res = await callBackPromise('gen_repo',perito,aportante,dispositivo,datosFormulario,Object.fromEntries(capturasParticipantes),multimediasAgregados,capturasChat,nombres,window.fechas,divChat,descriptcion,capturasDipositivo);
}

async function exportarChat(){
    //vuelvo a cargar los mensajes
    if(newInfo){
         let id = document.getElementById("idContenido");
     while(id.firstChild) {
        id.removeChild(id.firstChild);
    }
    await CargarMensajesFront(jsonPath,400);}
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
document.getElementById('agregarCapturaDispositivoBtn').addEventListener('click',() => {
    agregarArrayDesdeArchivo('scrollCapturasDispositivo', capturasDipositivo, (nuevoIndex) => {
        selectedDispositivoIndex = nuevoIndex;
    },"img", "capturas_dispositivo");
});

document.getElementById('eliminarCapturaDispositivoBtn').addEventListener('click', () => {
    eliminarLista('scrollCapturasDispositivo', capturasDipositivo, (nuevoIndex) => {
        selectedDispositivoIndex = nuevoIndex;
    },selectedDispositivoIndex,"capturas_dispositivo");
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
(() => {
  const container = document.getElementById('content-conversacion');
  const inputEl = document.getElementById('tabSearchInput');
  const counterEl = document.getElementById('tabSearchCounter');
  const prevBtn = document.getElementById('tabSearchPrev');
  const nextBtn = document.getElementById('tabSearchNext');

  if (!container || !inputEl || !counterEl || !prevBtn || !nextBtn) return;

  let marks = [];
  let currentIndex = -1;

  function clearHighlights() {
    const existingMarks = container.querySelectorAll('mark.chat-search-hit');
    existingMarks.forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });

    marks = [];
    currentIndex = -1;
  }

  function updateCounter() {
    counterEl.textContent = marks.length ? `${currentIndex + 1}/${marks.length}` : '0/0';
  }

  function focusMatch(index, { scroll = true } = {}) {
    if (!marks.length) {
      currentIndex = -1;
      updateCounter();
      return;
    }

    if (currentIndex >= 0 && marks[currentIndex]) {
      marks[currentIndex].classList.remove('is-current');
    }

    currentIndex = ((index % marks.length) + marks.length) % marks.length;
    const targetMark = marks[currentIndex];
    targetMark.classList.add('is-current');
    updateCounter();

    if (scroll) {
      targetMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // shouldFocus: false al escribir para no sacar el foco del input de búsqueda
  function performSearch({ shouldFocus = false } = {}) {
    clearHighlights();

    const query = inputEl.value.trim();
    if (!query) {
      updateCounter();
      return;
    }

    const queryLower = query.toLocaleLowerCase();
    const queryLen = query.length;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (
          parent.closest('script, style, noscript, textarea, input, select, mark.chat-search-hit')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      const textLower = text.toLocaleLowerCase();

      let startPos = 0;
      let matchIndex = textLower.indexOf(queryLower, startPos);
      if (matchIndex === -1) return;

      const fragment = document.createDocumentFragment();

      while (matchIndex !== -1) {
        if (matchIndex > startPos) {
          fragment.appendChild(document.createTextNode(text.slice(startPos, matchIndex)));
        }

        const mark = document.createElement('mark');
        mark.className = 'chat-search-hit';
        mark.textContent = text.slice(matchIndex, matchIndex + queryLen);
        fragment.appendChild(mark);
        marks.push(mark);

        startPos = matchIndex + queryLen;
        matchIndex = textLower.indexOf(queryLower, startPos);
      }

      if (startPos < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(startPos)));
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    if (marks.length > 0) {
      currentIndex = 0;
      marks[0].classList.add('is-current');
      updateCounter();
      if (shouldFocus) {
        focusMatch(0, { scroll: true });
      }
    } else {
      updateCounter();
    }
  }

  function stepMatch(delta) {
    if (!marks.length) {
      performSearch({ shouldFocus: true });
      return;
    }
    focusMatch(currentIndex + delta, { scroll: true });
  }

  inputEl.addEventListener('input', () => {
    performSearch({ shouldFocus: false });
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!marks.length) {
        performSearch({ shouldFocus: true });
      } else {
        stepMatch(e.shiftKey ? -1 : 1);
      }
    } else if (e.key === 'Escape') {
      inputEl.value = '';
      performSearch({ shouldFocus: false });
    }
  });

  nextBtn.addEventListener('click', () => stepMatch(1));
  prevBtn.addEventListener('click', () => stepMatch(-1));
})();