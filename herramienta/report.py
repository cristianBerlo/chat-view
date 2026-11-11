from pathlib import Path
import re

def generateReport(perito, aportante, dispositivo, lista_hashes_multimedias_chat, lista_multimedia, lista_chat,
                   array_nombres, mapa_participantes,ruta, datos_formulario,descripcion, lista_capturas_dispositivo,lista_fechas):
    # funcion para generar el reporte html, la mayoria del codigo es la plantinlla. Hay varias funciones locales que sirven para la inyeccion de datos de las listas
    estilos_css = """
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --background-color: #f4f6f9;
            --card-bg: #ffffff;
            --text-color: #333333;
            --border-color: #dcdde1;
        }
        .nav-bar {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #f8f9fa;
                padding: 10px 20px;
                border-radius: 6px;
                margin-bottom: 20px;
                border: 1px solid var(--border-color);
            }}
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: var(--card-bg);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        h1, h3, h4 {
            color: var(--primary-color);
        }

        .text-center { text-align: center; }
        .mb-3 { margin-bottom: 1rem; }
        .mb-4 { margin-bottom: 1.5rem; }
        .p-3 { padding: 1.25rem; }

        .card {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .sub-card {
            background: #fafbfc;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }

        .sub-card summary {
            cursor: pointer;
            font-weight: 600;
            color: var(--primary-color);
            outline: none;
        }

        /* --- CONTROL DE TAMAÑO Y GRILLA DE IMÁGENES --- */
        .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .image-card {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 10px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .image-card img {
            max-width: 100%;
            max-height: 180px; /* Límite de altura máxima */
            width: auto;
            height: auto;
            object-fit: contain; /* Mantiene la proporción de la captura */
            border-radius: 4px;
            transition: transform 0.2s ease;
        }

        .image-card img:hover {
            transform: scale(1.03);
        }

        .img-caption {
            font-size: 0.8rem;
            color: #666;
            margin-top: 8px;
            word-break: break-all;
        }

        .error-img {
            color: #e74c3c;
            font-size: 0.8rem;
            font-style: italic;
        }

        /* Tablas y Listas */
        .table-responsive {
            overflow-x: auto;
        }

        table.table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table.table th, table.table td {
            padding: 10px;
            border: 1px solid var(--border-color);
            text-align: left;
            font-size: 0.85rem;
        }

        table.table th {
            background-color: #f1f3f5;
            color: var(--primary-color);
        }

        table.table-striped tbody tr:nth-child(odd) {
            background-color: #fcfcfc;
        }

        .text-list {
            margin: 10px 0 0 20px;
            padding: 0;
            font-size: 0.9rem;
        }

        .empty {
            color: #777;
            font-style: italic;
            font-size: 0.9rem;
            margin-top: 10px;
        }

        hr {
            border: 0;
            border-top: 1px solid var(--border-color);
            margin: 25px 0;
        }
    </style>
    """

    def renderizar_multimedia_html():
        if not lista_multimedia:
            return '<p class="empty">No hay elementos multimedia registrados.</p>'

        elementos_li = "".join(
            f'<li><a href="adicionales/{item}" target="_blank" class="media-link" title="Abrir archivo multimedia">{item}</a></li>'
            for item in lista_multimedia
        )
        return f"""
        <details class="sub-card" open>
        <summary><strong>Elementos Multimedia</strong> ({len(lista_multimedia)} elementos)</summary>
        <ul class="text-list">
            {elementos_li}
        </ul>
        </details>
        """.strip()

    def renderizar_hashes_html():
        if not lista_hashes_multimedias_chat:
            return '<p class="empty">No hay hashes registrados.</p>'

        filas_tr = "".join(
            f"""<tr>
            <td>{item.get('name', '')}</td>
            <td><code>{item.get('hash', '')}</code></td>
            <td>{item.get('org', '')}</td>
            </tr>"""
            for item in lista_hashes_multimedias_chat
        )

        return f"""
        <details class="sub-card" open>
        <summary><strong>Hashes Registrados</strong> ({len(lista_hashes_multimedias_chat)} elementos)</summary>
        <div class="table-responsive">
        <table class="table table-striped">
        <thead>
        <tr>
        <th>Hash</th>
        <th>Nombre</th>
        <th>Origen</th>
        </tr>
        </thead>
        <tbody>
            {filas_tr}
        </tbody>
        </table>
        </div>
        </details>
        """.strip()


    def renderizar_fechas_html():
        if not lista_fechas:
            return '<p class="empty">No hay fechas registradas.</p>'

        filas_tr = "".join(
            f"""<tr>
            <td>{item.get('start', '')}</td>
            <td><code>{item.get('end', '')}</code></td>
            </tr>"""
            for item in lista_fechas
        )

        return f"""
        <details class="sub-card" open>
        <summary><strong>Periodos filtrados:</strong> ({len(lista_fechas)} elementos)</summary>
        <div class="table-responsive">
        <table class="table table-striped">
        <thead>
        <tr>
        <th>Inicio del periodo</th>
        <th>Fin del periodo</th>
        </tr>
        </thead>
        <tbody>
            {filas_tr}
        </tbody>
        </table>
        </div>
        </details>
        """.strip()
    def renderizar_participantes_html():
        if not array_nombres:
            return '<p class="empty">No hay nombres ni capturas de participantes registradas.</p>'

        html_partes = ["<h3 class='mb-3'>Capturas de Participantes</h3>"]

        for nombre in array_nombres:
            if isinstance(mapa_participantes, dict):
                imagenes = mapa_participantes.get(nombre, [])
            elif hasattr(mapa_participantes, 'get'):
                imagenes = mapa_participantes.get(nombre) or []
            else:
                imagenes = []

            card_header = f"""
            <details class="sub-card" open>
            <summary><strong>Participante: {nombre}</strong> ({len(imagenes)} capturas)</summary>
            """
            html_partes.append(card_header)

            if not imagenes:
                html_partes.append('<p class="empty">Sin capturas asociadas.</p>')
            else:
                imagenes_html = []
                for img_name in imagenes:
                    ruta_completa = f"capturas_{nombre}/{img_name}"
                    img_card = f"""
                    <div class="image-card">
                    <a href="{ruta_completa}" target="_blank" title="Abrir imagen en nueva ventana">
                    <img src="{ruta_completa}" alt="{img_name}" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'error-img\\'>No se pudo cargar: {img_name}</span>';">
                    </a>
                    <span class="img-caption">{img_name}</span>
                    </div>
                    """
                    imagenes_html.append(img_card)

                grid_content = f'<div class="image-grid">{"".join(imagenes_html)}</div>'
                html_partes.append(grid_content)

            html_partes.append('</details>')

        return "".join(html_partes)

    def renderizar_chat_html():
        if not lista_chat:
            return '<p class="empty">No hay capturas de chat registradas.</p>'

        imagenes_chat = []
        for img_name in lista_chat:
            ruta_completa = f"capturas_chat/{img_name}"
            img_card = f"""
            <div class="image-card">
            <a href="{ruta_completa}" target="_blank" title="Abrir imagen en nueva ventana">
            <img src="{ruta_completa}" alt="{img_name}" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'error-img\\'>No se pudo cargar: {img_name}</span>';">
            </a>
            <span class="img-caption">{img_name}</span>
            </div>
            """
            imagenes_chat.append(img_card)

        html = f"""
        <details class="sub-card" open>
        <summary><strong>Capturas de Chat</strong> ({len(lista_chat)} elementos)</summary>
        <div class="image-grid">
            {"".join(imagenes_chat)}
        </div>
        </details>
        """
        return html.strip()
    def renderizar_dispositivorenderizar_chat_html_html():
        if not lista_capturas_dispositivo:
            return '<p class="empty">No hay capturas de chat registradas.</p>'

        imagenes_dispositivo = []
        for img_name in lista_capturas_dispositivo:
            ruta_completa = f"capturas_dispositivo/{img_name}"
            img_card = f"""
            <div class="image-card">
            <a href="{ruta_completa}" target="_blank" title="Abrir imagen en nueva ventana">
            <img src="{ruta_completa}" alt="{img_name}" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'error-img\\'>No se pudo cargar: {img_name}</span>';">
            </a>
            <span class="img-caption">{img_name}</span>
            </div>
            """
            imagenes_dispositivo.append(img_card)

        html = f"""
        <details class="sub-card" open>
        <summary><strong>Capturas de dispositivo</strong> ({len(lista_capturas_dispositivo)} elementos)</summary>
        <div class="image-grid">
            {"".join(imagenes_dispositivo)}
        </div>
        </details>
        """
        return html.strip()

    # --- Ensamblaje principal del reporte ---
    html_reporte = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Informe Pericial - Causa N° {datos_formulario.get('pex', '')}</title>
        {estilos_css}
        <link rel="stylesheet" href="styles.css"> <!-- O tus estilos correspondientes -->
    </head>
    <body>
        <div class="container mt-4">
        <div class="nav-bar">
                <span><strong>Índice:</strong> Informe Pericial</span>
                            <a href="chat_exportado"  class="nav-btn">Ver Chat Exportado 💬</a>
            </div>
            <h1 class="text-center mb-4">Informe chat aportado</h1>
                        
            <!-- Datos Generales y de Causa -->
            <div class="card mb-3 p-3">
                <h4>Detalles de la Causa y Peritaje</h4>
                <p><strong>N° de Causa:</strong> {datos_formulario.get('pex', 'N/D')}</p>
                <p><strong>Fecha del Aporte:</strong> {datos_formulario.get('fecha_reporte', 'N/D')}</p>
                <p><strong>Requiriente del Aporte:</strong> {datos_formulario.get('requiriente', 'N/D')}</p>

            </div>

            <!-- Perito -->
            <div class="card mb-3 p-3">
                <h4>Analista</h4>
                <p><strong>Nombre y Apellido:</strong> {perito.get('nombre', '')} {perito.get('apellido', '')}</p>
                <p><strong>Dependencia:</strong> {perito.get('dependencia', '')}</p>
            </div>

            <!-- Aportante -->
            <div class="card mb-3 p-3">
                <h4>Aportante</h4>
                <p><strong>Nombre y Apellido:</strong> {aportante.get('nombre', '')} {aportante.get('apellido', '')}</p>
                <p><strong>DNI:</strong> {aportante.get('dni', '')}</p>
                <p><strong>Telefono:</strong> {aportante.get('telefono', '')}</p>

            </div>

            <!-- Dispositivo -->
            <div class="card mb-3 p-3">
                <h4>Dispositivo</h4>
                <p><strong>Marca / Modelo:</strong> {dispositivo.get('marca', '')} {dispositivo.get('modelo', '')}</p>
                <p><strong>IMEI:</strong> {dispositivo.get('imei', '')}</p>
            </div>

            <hr>

            <!-- Secciones Renderizadas -->
              <section class="mb-4">
                {renderizar_fechas_html()}
            </section>
            <section class="mb-4">
                {renderizar_participantes_html()}
            </section>

            <section class="mb-4">
                {renderizar_chat_html()}
            </section>
             <section class="mb-4">
                {renderizar_dispositivorenderizar_chat_html_html()}
            </section>
            <section class="mb-4">
                {renderizar_hashes_html()}
            </section>
            
            <section class="mb-4">
                {renderizar_multimedia_html()}
                {descripcion}
            </section>
        </div>
    </body>
    </html>
    """
    try:
        ruta_completa = Path(ruta / "reporte")
        with open(ruta_completa, "w", encoding="utf-8") as f:
            f.write(html_reporte)
        return {"status": "success", "ruta": os.path.abspath("reporte")}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}


# funcion para generar el chat exportado
def funExportar(inner_html,ruta):
    pattern = r'/chats_extracted/[^/]+/fuentes/'
    # Replace all instances with the shorter path
    updated_html = re.sub(pattern, 'fuentes/', inner_html)
    html_reporte = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Exportado</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            /* Aca va el contenido del CSS */
            .pull_left {{ float: left; }}
            .pull_right {{ float: right; }}
            .userpic {{ display: block; border-radius: 50%; overflow: hidden; }}
            .userpic .initials {{ display: block; color: #fff; text-align: center; text-transform: uppercase; user-select: none; }}
            .color_purple, .userpic5, .media_game .fill {{ background-color: #9884e8; }}
            .color_orange, .userpic8, .media_contact .fill {{ background-color: #ff8c44; }}
            body {{ margin: 0; font: 12px/18px 'Open Sans','Lucida Grande','Lucida Sans Unicode',Arial,Helvetica,Verdana,sans-serif; min-height: 90%; }}
            html {{ height: 90%; }}
            .cuerpo {{ background: #e5ddd5; }}
            .gradiente {{
                text-align: center;
                font-size: x-large;
                background: linear-gradient(#009688 0%,#009688 130px, #d9dbd5 130px, #d9dbd5 100%);
                color: white;
            }}
            #ParrafoWhatsApp {{ color: white; }}
            .margenDeArriba {{ margin-top: 10px; }}
            .margenDeAbajo {{ margin-bottom: 10px; }}
            .centrar {{ text-align: center; }}
            .styleTextArea {{ border: 1px solid #ccc; }}
        </style>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">
    </head>
    <body>
        <section class="h-screen flex overflow-hidden">
            <a href="reporte" class="nav-back">Informe</a>

            <div class="bg-white w-2/12 p-6"></div>
            <div class="cuerpo w-8/12 overflow-auto">
                <p class="gradiente px-20 py-6" style="text-align: center; font-size: xx-large;"> Conversación</p>
                <hr></hr>
                <br>
                {updated_html}
            </div>
            <div class="bg-white w-2/12 p-6"></div>
        </section>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossorigin="anonymous"></script>
    </body>
    </html>
        """
    try:
        ruta_completa = Path(ruta / "chat_exportado")
        with open(ruta_completa, "w", encoding="utf-8") as f:
            f.write(html_reporte)
        return {"status": "success", "ruta": os.path.abspath("chat_exportado")}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}


