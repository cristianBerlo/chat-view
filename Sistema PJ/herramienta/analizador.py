from pathlib import Path
from zipfile import ZipFile
import antlr4
import os
import webview
import hashlib
from grammar.chatWhatsappLexer import chatWhatsappLexer
from grammar.chatWhatsappParser import chatWhatsappParser
from grammar.chatWhatsappParserVisitor import chatWhatsappParserVisitor
from report import generateReport
from flask import Flask, send_from_directory
from datetime import datetime
import shutil

import sys
import os
from pathlib import Path

def resource_path(relative_path):
    if getattr(sys, '_MEIPASS', False):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(__file__).resolve().parent.parent

    return base_path / relative_path

INTERFAZ_DIR = resource_path("interfaz/Visualizador")
HERRAMIENTA_DIR = resource_path("herramienta")

def hashFiles(files,base, org,algorithm='sha256'):
    hashes = []
    if files is None:
        files = []
    for name in files:
        path = Path(base)  / name
        print(path)
        try:
            with open(path, 'rb') as file:
                hash = hashlib.file_digest(file, algorithm).hexdigest()
            hashes.append({"hash":hash,"name":name, "org":org})
        except FileNotFoundError:
            print(f"Error: The file was not found at path.")
        except PermissionError:
            print(f"Error: You do not have permission to access.")
    return  hashes

def date_comp(date, dates, format='%d/%m/%y'):
    if isinstance(date, str):
        f_target = datetime.strptime(date, format)
    else:
        f_target = date

    for d in dates:
        f_start = datetime.strptime(d['start'], format)
        f_end = datetime.strptime(d['end'], format)
        if f_start <= f_target <= f_end:
            return True

    return False

#Funcion para extrar zip
def extraer_zip(zip_path, project_root=None):

    if project_root is None:
        project_root = Path(__file__).parent / "chats_extracted"

    chat_name = zip_path.stem
    chat_dir = project_root / chat_name
    fuentes_dir = chat_dir / "fuentes"
    nombre_txt = zip_path.name.replace(".zip", ".txt")
    # Creo los directorios en caso de que no existan
    chat_dir.mkdir(parents=True, exist_ok=True)
    fuentes_dir.mkdir(parents=True, exist_ok=True)
    #Extraigo los archivos
    with ZipFile(zip_path, 'r') as zip:
        if nombre_txt not in zip.namelist():
            nombre_txt="_chat.txt"
        zip.extract(nombre_txt, chat_dir)
        zip.extractall(fuentes_dir)
    zip.close()
    return {"dir":chat_dir,"file":str(chat_dir / nombre_txt)}

def analizar_txt(chat, dates, lexer_class, parser_class, visitor_class, dir):
    # (txt de un chat, intervalos de tiempo) -> ( json con mensajes dentro de alguno de los intervalos)
    # ademas de estos intervalos tambien se pide el lexer parser y visitor a usar
    # de esta forma si en algun momento se expanden las gramaticas solo cambiaria con que se llaman
    file = antlr4.FileStream(chat,encoding='utf-8')
    lexer = lexer_class(file)
    stream = antlr4.CommonTokenStream(lexer)
    parser = parser_class(stream)
    parse_tree = parser.chat()
    visitor = visitor_class()
    res = visitor.visit(parse_tree)
    json = res.get("json", [])
    txt = res.get("txt", [])
    kfile = []
    if dates:
        kjson = []
        with open(chat, "w") as f:
            for txt_msg, json_msg in zip(txt,json):
                if date_comp(json_msg.get("Fecha"),dates):
                    f.write(txt_msg)
                    kjson.append(json_msg)
                    if json_msg.get("NameFileWhitExtension"):
                        kfile.append( json_msg.get("NameFileWhitExtension"))
        fuentes_dir = Path(dir) / "fuentes"
        for file in fuentes_dir.iterdir():
            if file.is_file() and file.name not in kfile:
                try:
                    file.unlink()
                except Exception as e:
                    print(f"No se pudo eliminar {file.name}: {e}")
        return kjson
    else:
        for json_msg in  json:
            if json_msg.get("NameFileWhitExtension"):
                kfile.append(json_msg.get("NameFileWhitExtension"))
    return {"json":json,"file":kfile}


class Api:

    def __init__(self):
        self._window = None
        self.selected_chat = None
        self.dir = None
        self.files= None

    def open_file_window(self, relative_path):
        absolute_path = os.path.join(self.dir, relative_path.lstrip("/"))
        url_path = f"file://{absolute_path}"
        secondary_window = webview.create_window(
            title="File Viewer",
            url=url_path,
            width=800,
            height=600
        )

    def open_file(self):  #
        file_types = (
            'Compressed Files (*.zip;*.tar;*.gz;*.rar;*.7z)',
            'TXT (*.txt)',
            'All files (*.*)'
        )

        result = self._window.create_file_dialog(
            webview.FileDialog.OPEN,
            allow_multiple=False,
            file_types=file_types
        )

        path_str = result[0] if isinstance(result, (list, tuple)) else result
        path = Path(path_str)

        compressed_extensions = {'.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz'}

        if path.suffix.lower() in compressed_extensions:
            try:
                with open(path_str, 'rb') as f:
                    res = extraer_zip(Path(path_str))
                    self.selected_chat = res.get("file")
                    self.dir = res.get("dir")
                    return {"res": True}
                    # Si me encuentro con un zip lo extraigo y retorno los datos del .txt
            except FileNotFoundError:
                print("error al abrir el archivo")
                return {"res":False}

        self.selected_chat = path_str
        return {"res": True}

    def start_analyzer(self,mode, dates):
        if mode == "whatsapp":
            res = analizar_txt(self.selected_chat, dates, chatWhatsappLexer, chatWhatsappParser, chatWhatsappParserVisitor,self.dir)
            self.files = res.get("file")
            return {"json": res.get("json"),
                    "path": self.dir.name}

        return None

    #metodo para agregar una imagen a la lista
    def add_cap(self,target):
        file_types = ('Image Files (*.bmp;*.jpg;*.gif;*.PNG;*.JPEG)',
                      'All files (*.*)')
        result = self._window.create_file_dialog(
            webview.FileDialog.OPEN,
            allow_multiple=True,
            file_types=file_types
        )
        print(result)

    def add_other(self, mode,loc):
        file_types = []
        if mode == "img":
            file_types.append('Image files (*.png;*.jpg;*.jpeg;*.webp)')
        file_types.append('All files (*.*)')
        file_types = tuple(file_types)
        result = self._window.create_file_dialog(
            webview.FileDialog.OPEN,
            allow_multiple=True,
            file_types=file_types
        )
        copied_files = []
        if result:
            dest_dir = Path(self.dir / loc )
            dest_dir.mkdir(parents=True, exist_ok=True)
            for file_path in result:
                src_path = Path(file_path)
                shutil.copy(src_path, dest_dir)
                copied_files.append(src_path.name)
        return {"files": copied_files}

    def del_other(self,file,loc):
        file_path = Path(self.dir / loc / file)
        try:
            file_path.unlink()
            return {"res": True}
        except Exception as e:
            return {"res": False}

    def gen_repo(self,perito,aportante,dispositivo,datos_formulario,mapa_participantes, lista_multimedia,lista_chat,array_nombres):
        lista_hashes_multimedias_chat = hashFiles(self.files, self.dir / "fuentes","Multimedia chat")
        lista_hashes_multimedias_chat += hashFiles(lista_multimedia, self.dir / "adicionales","Multimedias agregados")
        lista_hashes_multimedias_chat += hashFiles(lista_chat, self.dir / "capturas_chat","Capturas chat")
        for nombre in array_nombres:
            lista_hashes_multimedias_chat += hashFiles(mapa_participantes.get(nombre), self.dir / f"capturas_{nombre}", "Capturas " + nombre)
            generateReport(perito, aportante, dispositivo, lista_hashes_multimedias_chat, lista_multimedia, lista_chat, array_nombres, mapa_participantes, self.dir , datos_formulario)
        return {"hashes":lista_hashes_multimedias_chat}

app = Flask(__name__)
@app.route("/")
def visualizador():
    return send_from_directory(INTERFAZ_DIR, "visualizador.html")


@app.route("/visualizador/<path:filename>")
def serve_ui_assets(filename):
    return send_from_directory(INTERFAZ_DIR, filename)


@app.route("/<path:filename>")
def serve_chats(filename):
    return send_from_directory(HERRAMIENTA_DIR, filename)

if __name__ == '__main__':
    api = Api()
    window = webview.create_window(
        'Herramienta',
        app,
        js_api=api,
        min_size=(600, 450)
    )
    api._window = window
    webview.start(
        debug=False
    )