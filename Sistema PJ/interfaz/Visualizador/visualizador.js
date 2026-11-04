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

function MensajesDinamicos(chatFolderName, id_div, iniciales1, iniciales2, msjDelSistema, nombre, archivo, archivoAux, mensaje, fechaYhora){
    if(nombre != nombreSeleccionado){ // Actores Secundarios y Sistema de WhatsApp

        let divFlex2 = document.createElement("div");

        if(nombre != msjDelSistema){
            divFlex2.classList.add('flex','mb-12'); // Mensaje de usuario
        }else{
            divFlex2.classList.add('flex','justify-center','items-center'); // Mensaje del Sistema 
        }

        id_div.appendChild(divFlex2);

        let divPull2 = document.createElement("div");

        if(nombre != msjDelSistema){ // Este control hace que si no es un mensaje normal, o sea es algo como el chat esta cifrado de extremo a extremo... que no cree el icono de usuario que esta abajo del mensaje. 
            divPull2.classList.add('pull_left', 'userpic_wrap', 'w-12', 'mr-4', 'self-end');
            divFlex2.appendChild(divPull2);
            console.log("Esta entrando para crear icono"); 
        }
        
        let divUserPic2 = document.createElement("div");
        divUserPic2.classList.add('userpic', 'userpic8');
        divUserPic2.style.width = '42px';
        divUserPic2.style.height = '42px';

        divPull2.appendChild(divUserPic2);

        let divInitials2 = document.createElement("div");
        divInitials2.classList.add('initials');
        divInitials2.style.lineHeight = '42px';
        divInitials2.textContent = `${iniciales2}`;

        divUserPic2.appendChild(divInitials2);

        let divFlexCol2 = document.createElement("div");

        if(nombre != msjDelSistema){
            divFlexCol2.classList.add('flex','flex-col');
        }else{
            divFlexCol2.classList.add('flex','mb-12','justify-center','items-center','flex-col');
        }

        divFlex2.appendChild(divFlexCol2);

        let divBg_white2 = document.createElement("div");

        if(nombre != msjDelSistema){ // Acá dependiendo del mensaje, tendrá un color el mensaje o otro color. 
            divBg_white2.classList.add('bg-white','p-6','w-96','rounded-3xl','rounded-bl-none', 'shadow-sm', 'mb-2');
        }else{
            divBg_white2.classList.add('bg-slate-200','p-6','w-full','rounded-3xl', 'shadow-sm', 'mb-2'); // Color azul, o sea que no es un mensaje normal, es del sistema
        }

        divFlexCol2.appendChild(divBg_white2);

        let mb2 = document.createElement("p");
        mb2.classList.add('mb-1');

        const isLargeNumber = (element) => element.nombre === nombre;
    
        if(ArrayNameyText.findIndex(isLargeNumber) != -1){ // Acá tambien le doy valor al mensaje del sistema 

            if(ArrayNameyText[ArrayNameyText.findIndex(isLargeNumber)].texto === "") // No agrego texto, pero encuentra un nombre 
                mb2.textContent = `${nombre}`; // Nombre sin agregar info 
            else
                mb2.textContent = `${nombre}` + " - "+ ArrayNameyText[ArrayNameyText.findIndex(isLargeNumber)].texto; // Nombre agregando info. 
        }else{
            mb2.textContent = `${mensaje}`; // Mensaje del Sistema 
        }

        divBg_white2.appendChild(mb2);

        // Le creo otro small para guardar el mensaje, solo si no es el sistema
        let textGray2 = document.createElement("small");
        //textGray2.classList.add('text-gray-500','font-light');
        textGray2.classList.add('text-gray-500','font-light','overflow-hidden', 'overflow-ellipsis', 'block','text-base');


        let arrNyE = archivoAux.split('.'); 

        if(nombre != msjDelSistema){ 

            if(archivo != ""){ // Si hay archivo
                
                let punto  = ".";
                if(punto+arrNyE[1] === ".webp" || punto+arrNyE[1] === ".png" || punto+arrNyE[1] === ".jpg" || punto+arrNyE[1] === ".jpeg" || 
                punto+arrNyE[1] === ".gif" || punto+arrNyE[1] === ".tiff"){ // TODO LO QUE TENGA QUE VER CON IMAGENES

                     let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;

                    let a = document.createElement('a');
                    a.setAttribute('href', relativePath);
                    a.textContent = cleanFileName;
                 a.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Opening file via pywebview:", relativePath);

    if (pywebview && pywebview.api) {
        const pathFile =`/fuentes/${cleanFileName}`;
        pywebview.api.open_file_window(pathFile);    } else {
        console.warn("pywebview API not available, falling back to window.open");
        window.open(relativePath, '_blank');
    }
});

                    let archivoImg = document.createElement("img");
                    archivoImg.setAttribute('src', relativePath);
                    archivoImg.setAttribute('width','640');
                    archivoImg.setAttribute('height','480');
                    archivoImg.addEventListener('error', Error_Cargar,false);
                    
                    // Si anda bien, osea encuentra el archivo, hace esto. 
                    a.appendChild(archivoImg);
                    divBg_white2.appendChild(a);
                    
                    // Si no hace esto. 
                    function Error_Cargar() {
                        window.event.srcElement.style.display = "None";
                        let small = document.createElement("small");
                        let icon = document.createElement("i");
                        icon.classList.add('fa-solid','fa-circle-exclamation','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                        small.textContent = " No se encontró la Imagen  ".concat('\n');
                        divBg_white2.appendChild(small);
                        divBg_white2.appendChild(icon);
                    }
                    
                    
                    // <i class="fa-solid fa-circle-exclamation"></i>

                }else if(punto+arrNyE[1] === ".mp4" || punto+arrNyE[1] === ".mkv" || punto+arrNyE[1] === ".avi" || punto+arrNyE[1] === ".mov" || 
                punto+arrNyE[1] === ".flv" || punto+arrNyE[1] === ".divx"){ // TODO LO QUE TENGA QUE VER CON VIDEOS.
                    // <video src="video.mp4" width="640" height="480"></video>
                    let archivoVideo = document.createElement("video");
                    let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;

                    archivoVideo.setAttribute('src', relativePath);
                    archivoVideo.setAttribute('width','640');
                    archivoVideo.setAttribute('height','480');
                    archivoVideo.muted = true;
                    archivoVideo.autoplay = false;
                    archivoVideo.loop = true;
                    archivoVideo.controls = true;

                    archivoVideo.addEventListener('error', Error_Cargar,false);

                    divBg_white2.appendChild(archivoVideo);

                    function Error_Cargar() {
                        
                        let small = document.createElement("small");
                        let icon = document.createElement("i");
                        icon.classList.add('fa-solid','fa-circle-exclamation','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                        small.textContent = " No se encontró el Video  ".concat('\n');
                        divBg_white2.appendChild(small);
                        divBg_white2.appendChild(icon);
                    }


                }else if(punto+arrNyE[1] === ".mp3" || punto+arrNyE[1] === ".m4a" || punto+arrNyE[1] === ".aac" || punto+arrNyE[1] === ".wav" || punto+arrNyE[1] === ".aiff" || 
                punto+arrNyE[1] === ".wma" || punto+arrNyE[1] === ".opus" || punto+arrNyE[1] === ".ogg"){ // TODO LO QUE TENGA QUE VER CON MUSICA.
                    let archivoMusica = document.createElement("audio");
                    let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;
                    archivoMusica.setAttribute('src', relativePath);
                    // <audio src="audio.mp3" preload="none" controls></audio>
                    archivoMusica.setAttribute('preload','none');
                    archivoMusica.controls = true;
                    archivoMusica.addEventListener('error', Error_Cargar,false);

                    divBg_white2.appendChild(archivoMusica);

                    function Error_Cargar() {
                        let small = document.createElement("small");
                        let icon = document.createElement("i");
                        icon.classList.add('fa-solid','fa-circle-exclamation','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                        small.textContent = " No se encontró el archivo de Audio  ".concat('\n');
                        divBg_white2.appendChild(small);
                        divBg_white2.appendChild(icon);
                    }


                    
                }else if(punto+arrNyE[1] === ".pdf" || punto+arrNyE[1] === ".doc" || punto+arrNyE[1] === ".docx" || punto+arrNyE[1] === ".txt" || 
                punto+arrNyE[1] === ".odt" || punto+arrNyE[1] === ".xlsx" || punto+arrNyE[1] === ".pptx"){
                    // FALTA CONTROLAR SI NO FALTA EL DOCUMENTO.

                    let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;
                     let a = document.createElement('a');
                    a.setAttribute('href', relativePath);
                  a.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Opening file via pywebview:", relativePath);

    if (pywebview && pywebview.api) {
        const pathFile =`/fuentes/${cleanFileName}`;

        pywebview.api.open_file_window(pathFile);
    } else {
        console.warn("pywebview API not available, falling back to window.open");
        window.open(relativePath, '_blank');
    }
});
                     let icon = document.createElement("i");
                     icon.classList.add('fa-regular','fa-file','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                     a.appendChild(icon);
                     divBg_white2.appendChild(a);


                }else if(punto+arrNyE[1] === ".py" || punto+arrNyE[1] === ".rar" || punto+arrNyE[1] === ".zip" ||  punto+arrNyE[1] === ".html" || 
                punto+arrNyE[1] === ".tmp" || punto+arrNyE[1] === ".dat" || punto+arrNyE[1] === ".exe" || punto+arrNyE[1] === ".deb" || 
                punto+arrNyE[1] === ".vcf" || punto+arrNyE[1] === ".dmg" || punto+arrNyE[1] === ".psd" || punto+arrNyE[1] === ".sql"){
                    // <i class="fa-duotone fa-file-zipper"></i> <i class="fa-solid fa-file-lines"></i>

                    // FALTA CONTROLAR SI FALTAN ARCHIVOS.
                    let a = document.createElement("a");
                    let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;
                    a.setAttribute('href', relativePath);
                    a.textContent = cleanFileName;
                 a.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Opening file via pywebview:", relativePath);

    if (pywebview && pywebview.api) {
        const pathFile =`/fuentes/${cleanFileName}`;
        pywebview.api.open_file_window(pathFile);
    } else {
        console.warn("pywebview API not available, falling back to window.open");
        window.open(relativePath, '_blank');
    }
});
                    let icon = document.createElement("i");

                    icon.classList.add('fa-solid','fa-file-lines','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles

                    if(punto+arrNyE[1] === ".vcf"){
                        icon.classList.add('fa-solid','fa-user','fa-2x');
                        mensaje = archivo; // Si es un contacto, indico el nombre. 
                    }else{
                        icon.classList.add('fa-solid','fa-file-lines','fa-2x'); 
                    }
                    
                    a.appendChild(icon);
                    divBg_white2.appendChild(a);
                    divBg_white2.appendChild(textGray2);
                    
                }
                
            }

            let a = document.createElement("a");
            let icon = document.createElement("i");
            let erLlamada = /^null$/;
            let erLlamadaperdida = /^Llamada perdida$/;

            if(erLlamada.test(mensaje)){
                icon.classList.add('fa-solid','fa-phone','arrow-up-right','fa-2x');
                a.appendChild(icon);
                divBg_white2.appendChild(a);
                textGray2.textContent = 'Llamada'
            }else if(erLlamadaperdida.test(mensaje)){
                icon.classList.add('fa-solid','fa-phone-slash','arrow-up-right','fa-2x');
                a.appendChild(icon);
                divBg_white2.appendChild(a);
                textGray2.textContent = 'Llamada perdida'
            }else{
                textGray2.textContent = `${mensaje}`;
            }
            divBg_white2.appendChild(textGray2);

            /* textGray2.textContent = `${mensaje}`; // Esta asignación es para cualquier caso. 
            divBg_white2.appendChild(textGray2); */
        }

        // La hora la comparten tanto el que tiene el sistema como el que no tiene el sistema. 
        let textGrayHora2 = document.createElement("small");
        textGrayHora2.classList.add('text-gray-500','font-light');
        textGrayHora2.textContent = `${fechaYhora}`;

        divFlexCol2.appendChild(textGrayHora2);

    }else{

        let divFlex1 = document.createElement("div");
        divFlex1.classList.add('flex','mb-12','flex-row-reverse'); // Mensaje de usuario
        
        id_div.appendChild(divFlex1);

        let divPull1 = document.createElement("div");
        divPull1.classList.add('pull_left', 'userpic_wrap', 'w-12', 'ml-4', 'self-end');
        
        divFlex1.appendChild(divPull1);
          
        let divUserPic1 = document.createElement("div");
        divUserPic1.classList.add('userpic', 'userpic5');
        divUserPic1.style.width = '42px';
        divUserPic1.style.height = '42px';

        divPull1.appendChild(divUserPic1);

        let divInitials1 = document.createElement("div");
        divInitials1.classList.add('initials');
        divInitials1.style.lineHeight = '42px';
        divInitials1.textContent = `${iniciales1}`;

        divUserPic1.appendChild(divInitials1);

        let divFlexCol1 = document.createElement("div");
        divFlexCol1.classList.add('flex','flex-col');
        
        divFlex1.appendChild(divFlexCol1);

        let divBg_white1 = document.createElement("div");
        divBg_white1.classList.add('p-6','w-96','rounded-3xl','rounded-br-none', 'shadow-sm', 'mb-2');
        divBg_white1.style.background = '#dcf8c6';

        divFlexCol1.appendChild(divBg_white1);

        let mb1 = document.createElement("p");
        mb1.classList.add('mb-1','text-black');

        const isLargeNumber = (element) => element.nombre === nombre;
    
        if(ArrayNameyText.findIndex(isLargeNumber) != -1){ 

            if(ArrayNameyText[ArrayNameyText.findIndex(isLargeNumber)].texto === "") // No agrego texto, pero encuentra un nombre 
                mb1.textContent = `${nombre}`; // Nombre sin agregar info 
            else
                mb1.textContent =  ArrayNameyText[ArrayNameyText.findIndex(isLargeNumber)].texto; // Nombre agregando info.
        }

        divBg_white1.appendChild(mb1);

        // Le creo otro small para guardar el mensaje, solo si no es el sistema
        let textGray1 = document.createElement("small");
        //textGray1.classList.add('text-black','font-light');
        textGray1.classList.add('text-black','font-light','overflow-hidden', 'overflow-ellipsis', 'block','text-base');
        
        let arrNyE = archivoAux.split('.'); 

        if(archivo != ""){ // Si hay archivo 
            
            let punto  = ".";
            
            if(punto+arrNyE[1] === ".webp" || punto+arrNyE[1] === ".png" || punto+arrNyE[1] === ".jpg" || punto+arrNyE[1] === ".jpeg" || 
            punto+arrNyE[1] === ".gif" || punto+arrNyE[1] === ".tiff"){ // TODO LO QUE TENGA QUE VER CON IMAGENES 
                    
                // <a title="Los Tejos" href="http://www.lostejos.com"><img src="casarural.jpg" alt="Los Tejos" /></a>

                   let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;

                    let a = document.createElement('a');
                    a.setAttribute('href', relativePath);

                    a.textContent = cleanFileName;

                    // Intercept click to open in a pywebview floating window instead of navigating normally
                 a.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Opening file via pywebview:", relativePath);

    if (pywebview && pywebview.api) {
        const pathFile =`/fuentes/${cleanFileName}`;
        pywebview.api.open_file_window(pathFile);    } else {
        console.warn("pywebview API not available, falling back to window.open");
        window.open(relativePath, '_blank');
    }
});
                let archivoImg = document.createElement("img");
                
                //console.log("Lo que concateno tiene:"+arrNyE[0]+punto+arrNyE[1]);
                archivoImg.setAttribute('src',relativePath); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                archivoImg.setAttribute('width','640');
                archivoImg.setAttribute('height','480');
                archivoImg.addEventListener('error', Error_Cargar,false);
                
                // Si anda bien, osea encuentra el archivo, hace esto. 
                a.appendChild(archivoImg);
                divBg_white1.appendChild(a);
                
                // Si no hace esto. 
                function Error_Cargar() {
                    window.event.srcElement.style.display = "None";
                    let small = document.createElement("small");
                    let icon = document.createElement("i");
                    icon.classList.add('fa-solid','fa-circle-exclamation','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                    small.textContent = " No se encontró la Imagen  ".concat('\n');
                    divBg_white1.appendChild(small);
                    divBg_white1.appendChild(icon);
                }
                
                
                // <i class="fa-solid fa-circle-exclamation"></i>

            }else if(punto+arrNyE[1] === ".mp4" || punto+arrNyE[1] === ".mkv" || punto+arrNyE[1] === ".avi" || punto+arrNyE[1] === ".mov" || 
            punto+arrNyE[1] === ".flv" || punto+arrNyE[1] === ".divx"){ // TODO LO QUE TENGA QUE VER CON VIDEOS.
                // <video src="video.mp4" width="640" height="480"></video>
                let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;

                let archivoVideo = document.createElement("video");
                archivoVideo.setAttribute('src',relativePath);
                archivoVideo.setAttribute('width','640');
                archivoVideo.setAttribute('height','480');
                archivoVideo.muted = true;
                archivoVideo.autoplay = false;
                archivoVideo.loop = true;
                archivoVideo.controls = true;

                archivoVideo.addEventListener('error', Error_Cargar,false);

                divBg_white1.appendChild(archivoVideo);

                function Error_Cargar() {
                    
                    let small = document.createElement("small");
                    let icon = document.createElement("i");
                    icon.classList.add('fa-solid','fa-circle-exclamation','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                    small.textContent = " No se encontró el Video  ".concat('\n');
                    divBg_white1.appendChild(small);
                    divBg_white1.appendChild(icon);
                }


            }else if(punto+arrNyE[1] === ".mp3" || punto+arrNyE[1] === ".m4a" || punto+arrNyE[1] === ".aac" || punto+arrNyE[1] === ".wav" || punto+arrNyE[1] === ".aiff" || 
            punto+arrNyE[1] === ".wma" || punto+arrNyE[1] === ".opus" || punto+arrNyE[1] === ".ogg"){ // TODO LO QUE TENGA QUE VER CON MUSICA.
                let archivoMusica = document.createElement("audio");
                // <audio src="audio.mp3" preload="none" controls></audio>
                let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;

                archivoMusica.setAttribute('src', relativePath);
                archivoMusica.setAttribute('preload','none'); 
                archivoMusica.controls = true;
                archivoMusica.addEventListener('error', Error_Cargar,false);

                divBg_white1.appendChild(archivoMusica);

                function Error_Cargar() {
                    let small = document.createElement("small");
                    let icon = document.createElement("i");
                    icon.classList.add('fa-solid','fa-circle-exclamation','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                    small.textContent = " No se encontró el archivo de Audio  ".concat('\n');
                    divBg_white1.appendChild(small);
                    divBg_white1.appendChild(icon);
                }


                
            }else if(punto+arrNyE[1] === ".pdf" || punto+arrNyE[1] === ".doc" || punto+arrNyE[1] === ".docx" || punto+arrNyE[1] === ".txt" || 
            punto+arrNyE[1] === ".odt" || punto+arrNyE[1] === ".xlsx" || punto+arrNyE[1] === ".pptx"){
                // FALTA CONTROLAR SI NO FALTA EL DOCUMENTO. 

                       let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;

                    let a = document.createElement('a');
                    a.setAttribute('href', relativePath);

                    a.textContent = cleanFileName;

                 a.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Opening file via pywebview:", relativePath);

    if (pywebview && pywebview.api) {
        const pathFile =`/fuentes/${cleanFileName}`;
        pywebview.api.open_file_window(pathFile);    } else {
        console.warn("pywebview API not available, falling back to window.open");
        window.open(relativePath, '_blank');
    }
});
                    let icon = document.createElement("i");
                    icon.classList.add('fa-regular','fa-file','fa-2x'); // Tengo que agregarle el replace para eliminar los caracteres invsibles
                    a.appendChild(icon);
                    divBg_white1.appendChild(a);


            }else if(punto+arrNyE[1] === ".py" || punto+arrNyE[1] === ".rar" || punto+arrNyE[1] === ".zip" ||  punto+arrNyE[1] === ".html" || 
            punto+arrNyE[1] === ".tmp" || punto+arrNyE[1] === ".dat" || punto+arrNyE[1] === ".exe" || punto+arrNyE[1] === ".deb" || 
            punto+arrNyE[1] === ".vcf" || punto+arrNyE[1] === ".dmg" || punto+arrNyE[1] === ".psd" || punto+arrNyE[1] === ".sql"){
                // <i class="fa-duotone fa-file-zipper"></i> <i class="fa-solid fa-file-lines"></i>

                // FALTA CONTROLAR SI FALTAN ARCHIVOS. 

                   let cleanFileName = (arrNyE[0] + punto + arrNyE[1]).replace(/[\u{0080}-\u{FFFF}]/gu, "").trim();
                    let relativePath = `/chats_extracted/${chatFolderName}/fuentes/${cleanFileName}`;
                    let a = document.createElement('a');
                    a.setAttribute('href', relativePath);
                    a.textContent = cleanFileName;

                    // Intercept click to open in a pywebview floating window instead of navigating normally
                 a.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Opening file via pywebview:", relativePath);

    if (pywebview && pywebview.api) {
        const pathFile =`/fuentes/${cleanFileName}`;
        pywebview.api.open_file_window(pathFile);    } else {
        console.warn("pywebview API not available, falling back to window.open");
        window.open(relativePath, '_blank');
    }
});
                let icon = document.createElement("i");

                if(punto+arrNyE[1] === ".vcf"){ // Si es el contacto de una persona, le hago un icono distinto porque es importante. 
                    icon.classList.add('fa-solid','fa-user','fa-2x');
                    mensaje = archivo; 
                }else{
                    icon.classList.add('fa-solid','fa-file-lines','fa-2x'); 
                }
                a.appendChild(icon);
                divBg_white1.appendChild(a);
                divBg_white1.appendChild(textGray1);
                
            }
            
        }

        let a = document.createElement("a");
        let icon = document.createElement("i");
        let erLlamada = /^null$/;
        let erLlamadaperdida = /^Llamada perdida$/;

        if(erLlamada.test(mensaje)){
            icon.classList.add('fa-solid','fa-phone','arrow-up-right','fa-2x');
            a.appendChild(icon);
            divBg_white1.appendChild(a);
            textGray1.textContent = 'Llamada'
        }else if(erLlamadaperdida.test(mensaje)){
            icon.classList.add('fa-solid','fa-phone-slash','arrow-up-right','fa-2x');
            a.appendChild(icon);
            divBg_white1.appendChild(a);
            textGray1.textContent = 'Llamada perdida'
        }else{
            textGray1.textContent = `${mensaje}`;
        }
        divBg_white1.appendChild(textGray1);

        /* textGray1.textContent = `${mensaje}`;
        divBg_white1.appendChild(textGray1); */

        // La hora la comparten tanto el que tiene el sistema como el que no tiene el sistema. 
        let textGrayHora1 = document.createElement("small");
        textGrayHora1.classList.add('text-gray-500','font-light','self-end');
        textGrayHora1.textContent = `${fechaYhora}`;
        
        divFlexCol1.appendChild(textGrayHora1);
        
    }
}

function CargarMensajesFront(path){
    let id_div = document.getElementById("idContenido");
    let iniciales1 = "U1";
    let iniciales2 = "U2";
    let msjDelSistema = "SistemaDeWhatsApp";
    for (let index = 0; index < ArrayJSON.length; index++) {

        let nombre = ArrayJSON[index].Nombre;
        let archivo = ArrayJSON[index].NameFileWhitExtension;
        let archivoAux = ArrayJSON[index].NameFileWhitExtension;
        let mensaje = ArrayJSON[index].Mensaje;
        let fechaYhora = ArrayJSON[index].Fecha +" "+ArrayJSON[index].Hora;

        MensajesDinamicos(path,id_div,iniciales1,iniciales2,msjDelSistema,nombre,archivo,archivoAux,mensaje,fechaYhora);
}
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

function open_file() {
    const result = pywebview.api.open_file()
   document.getElementById('formBtn').disabled =     result.res;
    document.getElementById('participantesBtn').disabled =     result.res;
    document.getElementById('mostrar').disabled     = result.res;
    document.getElementById('Comenzar').disabled     = result.res;
}

async function  start_analysis() {
    const app = document.getElementById("app");
    const selection = app.value;
    const result =  await pywebview.api.start_analyzer(selection, window.fechas);
    let ArrayParaNombres = result.json;
    nombres = GuardarNombres(ArrayParaNombres);
    ArrayJSON = result.json;
    jsonPath = result.path;
    CargarNombresFront(nombres)
    if(!nombreSeleccionado){
            nombreSeleccionado = document.getElementById("Nombres_Personas").options[0].value;
    }
    Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Analisis finalizado',
        })
}

function recargarMensajes(){
    let id = document.getElementById("idContenido");
     while(id.firstChild) {
        id.removeChild(id.firstChild);
    }
        CargarMensajesFront(jsonPath);
}

document.getElementById('formBtn').addEventListener('click', () => {

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

    let res = await pywebview.api.gen_repo(perito,aportante,dispositivo,datosFormulario,Object.fromEntries(capturasParticipantes),multimediasAgregados,capturasChat,nombres);
}
async function agregarArrayDesdeArchivo(scrollId,array,onIndexChange,mode, loc){
 let res = await pywebview.api.add_other(mode, loc);
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
    const res = await pywebview.api.del_other(file, loc);
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