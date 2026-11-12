import threading
from zipfile import ZipFile, ZIP_DEFLATED
import antlr4
import hashlib
from flask import Flask, send_from_directory
from grammar.chatWhatsappLexer import chatWhatsappLexer
from grammar.chatWhatsappParser import chatWhatsappParser
from grammar.chatWhatsappParserVisitor import chatWhatsappParserVisitor
from report import generateReport
from report import funExportar
from datetime import datetime
import shutil
import sys
import os
from pathlib import Path
from PyQt6.QtCore import QObject, QUrl, pyqtSlot,QFile, QTextStream
from PyQt6.QtWidgets import QApplication, QFileDialog, QMainWindow, QMessageBox, QWidget, QVBoxLayout
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtGui import QKeySequence, QShortcut


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


def create_zip(selection, directory_path=None, file=None):

    zip_path = selection[0] if isinstance(selection, (list, tuple)) else selection
    zip_path = os.path.splitext(zip_path)[0]

    with ZipFile(zip_path, 'w') as zipf:
        for file_path in directory_path.rglob('*'):
            if any(part.startswith('.') for part in file_path.relative_to(directory_path).parts):
                continue
            if file_path.is_file():
                arcname = file_path.relative_to(directory_path.parent)
                zipf.write(file_path, arcname)
        if file:
            zipf.write(file, file.name)


class Api(QObject):
    def __init__(self, main_window):
        super().__init__()
        self._window = main_window
        self.selected_chat = None
        self.dir = None
        self.zip = None


    @pyqtSlot(str)
    def open_file_window(self, relative_path):
        absolute_path = Path(self.dir) / relative_path.lstrip("/")
        secondary_window = QMainWindow(self._window)
        secondary_window.setWindowTitle("File Viewer")
        secondary_window.resize(800, 600)

        # Create a central widget and layout
        central_widget = QWidget(secondary_window)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)

        # Create the web view and add it to the layout
        web_view = QWebEngineView(central_widget)
        web_view.load(QUrl.fromLocalFile(str(absolute_path.resolve())))
        layout.addWidget(web_view)

        secondary_window.setCentralWidget(central_widget)
        secondary_window.show()

        # Keep a reference to prevent garbage collection
        if not hasattr(self, "_secondary_windows"):
            self._secondary_windows = []
        self._secondary_windows.append(secondary_window)

    @pyqtSlot(result='QVariant')
    def open_file(self,lexer_class=chatWhatsappLexer, parser_class=chatWhatsappParser, visitor_class=chatWhatsappParserVisitor):  #

        file_types = (
            "Compressed Files (*.zip *.tar *.gz *.rar *.7z);;"
            "TXT (*.txt);;"
            "JSON (*.json);;"
            "All files (*.*)"
        )
        path_str, _ = QFileDialog.getOpenFileName(
            self._window, "Open File", "", file_types
        )
        if not path_str:
            return {"res": False}

        path = Path(path_str)
        compressed_extensions = {'.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz'}

        if path.suffix.lower() in compressed_extensions:
            try:
                with open(path_str, 'rb') as f:
                    res = extraer_zip(path)
                    self.selected_chat = res.get("file")
                    self.dir = res.get("dir")
                    self.zip  = hashFiles([path.name],path.parent, "Archivo comprido del chat")
                    #guardo el hash del zip abierto
                    # Si me encuentro con un zip lo extraigo y retorno los datos del .txt
            except FileNotFoundError:
                print("error al abrir el archivo")
                return {"res":False}
        else:
            try:

                with open(path_str, 'rb') as f:
                    file_path_obj = Path(f.name)
                    self.selected_chat = file_path_obj.name
                    self.dir = file_path_obj.parent

            except FileNotFoundError:
                print("error al abrir el archivo")
                return {"res": False}

        # Parseo el archivo seleccionado  para generar el json
        file = antlr4.FileStream(self.selected_chat, encoding='utf-8')
        lexer = lexer_class(file)
        stream = antlr4.CommonTokenStream(lexer)
        parser = parser_class(stream)
        parse_tree = parser.chat()
        visitor = visitor_class()
        res = visitor.visit(parse_tree)
        json = res.get("json")
        return {"json":json, "res": True,   "path": self.dir.name}


    #metodo para agregar una imagen a la lista
    @pyqtSlot(str)
    def add_cap(self, target):
        file_types = "Image Files (*.bmp *.jpg *.gif *.PNG *.JPEG);;All files (*.*)"
        result, _ = QFileDialog.getOpenFileNames(
            self._window, "Agregar Imágenes", "", file_types
        )

    @pyqtSlot(str,str, result='QVariant')
    def add_other(self, mode, loc):
        file_types = ""
        if mode == "img":
            file_types = "Image files (*.png *.jpg *.jpeg *.webp);;All files (*.*)"
        else:
            file_types = "All files (*.*)"
        result, _ = QFileDialog.getOpenFileNames(self._window, "Agregar Archivos", "", file_types)
        copied_files = []
        if result and self.dir:
            dest_dir = Path(self.dir / loc)
            dest_dir.mkdir(parents=True, exist_ok=True)
            for file_path in result:
                src_path = Path(file_path)
                shutil.copy(src_path, dest_dir)
                copied_files.append(src_path.name)
        return {"files": copied_files}

    @pyqtSlot(str, str, result='QVariant')
    def del_other(self, file, loc):
        if not self.dir:
            return {"res": False}
        file_path = Path(self.dir / loc / file)
        try:
            file_path.unlink()
            return {"res": True}
        except Exception as e:
            return {"res": False}

    #Metodo para la generacion del reporte
    @pyqtSlot('QVariantMap', 'QVariantMap', 'QVariantMap', 'QVariant', 'QVariant', 'QVariant', 'QVariant', 'QVariant', 'QVariant', str,str,'QVariant', result='QVariant')
    def gen_repo(self,perito,aportante,dispositivo,datos_formulario,mapa_participantes, lista_multimedia,lista_chat,array_nombres,dates,html,desc,array_dis,lexer_class=chatWhatsappLexer, parser_class=chatWhatsappParser, visitor_class=chatWhatsappParserVisitor):
        # Parseo nuevamente el file para poder generar el txt filtrado y el json filtrado
        file = antlr4.FileStream(self.selected_chat, encoding='utf-8')
        lexer = lexer_class(file)
        stream = antlr4.CommonTokenStream(lexer)
        parser = parser_class(stream)
        parse_tree = parser.chat()
        visitor = visitor_class()
        res = visitor.visit(parse_tree)
        json = res.get("json", [])
        txt = res.get("txt", [])
        kfile = []
        # cuando voy a generar parseo nuevamente el file, lo hago para poder generar el json y txt podados.
        #  evaluo mensaje a mensaje para determinar que archivos son conservados
        if dates:
            kjson = []
            with open(self.selected_chat, "w") as f:
                for txt_msg, json_msg in zip(txt, json):
                    if date_comp(json_msg.get("Fecha"), dates):
                        #escribo el txt filtrado
                        f.write(txt_msg)
                        kjson.append(json_msg)
                        if json_msg.get("NameFileWhitExtension"):
                            kfile.append(json_msg.get("NameFileWhitExtension"))
            fuentes_dir = Path(self.dir) / "fuentes"
            for file in fuentes_dir.iterdir():
                if file.is_file() and file.name not in kfile:
                    try:
                        #elimino los archivos que no estan presententes en el json filtrado
                        file.unlink()
                    except Exception as e:
                        print(f"No se pudo eliminar {file.name}: {e}")
        else:
            for json_msg in json:
                if json_msg.get("NameFileWhitExtension"):
                    kfile.append(json_msg.get("NameFileWhitExtension"))
        lista_hashes_multimedias_chat = []
        #Calculo los hashes de todos los archivos alcanzados y los agregados
        lista_hashes_multimedias_chat += self.zip # or en caso de que la entrada haya sido un .txt en lugar de un comprimido
        lista_hashes_multimedias_chat += hashFiles([Path(self.selected_chat).name],self.dir,"Txt del chat")
        lista_hashes_multimedias_chat += hashFiles(kfile, self.dir / "fuentes","Multimedia chat")
        lista_hashes_multimedias_chat += hashFiles(lista_multimedia, self.dir / "adicionales","Multimedias agregados")
        lista_hashes_multimedias_chat += hashFiles(lista_chat, self.dir / "capturas_chat","Capturas chat")
        lista_hashes_multimedias_chat += hashFiles(array_dis, self.dir / "capturas_dispositivo","Capturas dispositivo")
        for nombre in array_nombres:
            lista_hashes_multimedias_chat += hashFiles(mapa_participantes.get(nombre), self.dir / f"capturas_{nombre}", "Capturas " + nombre)

        #genero los html del reporte
        generateReport(perito, aportante, dispositivo, lista_hashes_multimedias_chat, lista_multimedia, lista_chat,
                       array_nombres, mapa_participantes, self.dir, datos_formulario,desc,array_dis,dates)
        funExportar(html, self.dir)
        #Creo una ventana para preguntarle al usuario donde guardar el .zip
        selection, _ = QFileDialog.getSaveFileName(
            None,
            "Save File",
            "chat_comprimido.zip",
            "ZIP files (*.zip)"
        )
        create_zip(selection,self.dir)

        return {"hashes":lista_hashes_multimedias_chat}

    @pyqtSlot('QVariant', str)
    def export_chat(self, dates,html,lexer_class=chatWhatsappLexer, parser_class=chatWhatsappParser, visitor_class=chatWhatsappParserVisitor):

        file = antlr4.FileStream(self.selected_chat, encoding='utf-8')
        lexer = lexer_class(file)
        stream = antlr4.CommonTokenStream(lexer)
        parser = parser_class(stream)
        parse_tree = parser.chat()
        visitor = visitor_class()
        res = visitor.visit(parse_tree)
        json = res.get("json", [])
        kfile = []
        # cuando voy a generar parseo nuevamente el file, lo hago para poder generar el json y txt podados.
        #  evaluo mensaje a mensaje para determinar que archivos son conservados
        if dates:
            for  json_msg in  json:
                if date_comp(json_msg.get("Fecha"), dates):
                    if json_msg.get("NameFileWhitExtension"):
                        kfile.append(json_msg.get("NameFileWhitExtension"))
        else:
            for json_msg in json:
                if json_msg.get("NameFileWhitExtension"):
                    kfile.append(json_msg.get("NameFileWhitExtension"))

        fuentes_dir = Path(self.dir) / "fuentes"
        for file in fuentes_dir.iterdir():
                if file.is_file() and file.name not in kfile:
                    try:
                        # elimino los archivos que no estan presententes en el json filtrado
                        file.unlink()
                    except Exception as e:
                        print(f"No se pudo eliminar {file.name}: {e}")
        funExportar(html, self.dir)
        selection, _ = QFileDialog.getSaveFileName(
            None,
            "Save File",
            "chat_comprimido.zip",
            "ZIP files (*.zip)"
        )
        create_zip(selection,fuentes_dir , self.dir / "chat_exportado" )
flask_app = Flask(__name__)

@flask_app.route("/")
def visualizador():
    return send_from_directory(INTERFAZ_DIR, "visualizador.html")

@flask_app.route("/visualizador/<path:filename>")
def serve_ui_assets(filename):
    return send_from_directory(INTERFAZ_DIR, filename)

@flask_app.route("/<path:filename>")
def serve_chats(filename):
    return send_from_directory("", filename)


@flask_app.route("/qtwebchannel/qwebchannel.js")
def serve_qwebchannel():
    f = QFile(":/qtwebchannel/qwebchannel.js")
    if f.open(QFile.OpenModeFlag.ReadOnly | QFile.OpenModeFlag.Text):
        stream = QTextStream(f)
        text = stream.readAll()
        return text, 200, {'Content-Type': 'application/javascript'}
    return "/* qwebchannel.js not found */", 404

def run_flask():
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    flask_app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Herramienta")
        self.setMinimumSize(600, 450)
        self.resize(1024, 768)
        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)
        self.channel = QWebChannel()
        self.api = Api(self)
        self.channel.registerObject("bridge", self.api)
        self.browser.page().setWebChannel(self.channel)

        #declaro analizador web
        self.inspector_window = QMainWindow(self)
        self.inspector_window.setWindowTitle("Consola / Inspector Web")
        self.inspector_window.resize(800, 600)
        self.inspector_view = QWebEngineView()
        self.inspector_window.setCentralWidget(self.inspector_view)
        self.browser.page().setDevToolsPage(self.inspector_view.page())
        self.shortcut = QShortcut(QKeySequence("F12"), self)
        self.shortcut.activated.connect(self.inspector_window.show)

        self.browser.setUrl(QUrl("http://127.0.0.1:5000/"))

if __name__ == '__main__':
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())