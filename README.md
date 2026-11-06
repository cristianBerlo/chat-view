# Chat-view — Herramienta para Preservar y Visualizar Evidencia Digital de Aplicaciones de Mensajería Instantánea

## Descripción

Chat-view es una herramienta de código abierto orientada al ámbito judicial que permite preservar y visualizar evidencia digital proveniente de aplicaciones de mensajería instantánea. Dado que los formatos de exportación de estas aplicaciones presentan dificultades para su lectura y análisis, la herramienta transforma esa información en una representación visual fiel a la interfaz original de la aplicación, facilitando la labor de peritos informáticos y operadores judiciales.

## Contexto de uso

La evidencia digital obtenida de aplicaciones de mensajería es cada vez más frecuente en causas judiciales de diversa índole: grooming, extorsión, violencia doméstica, violencia de género, estafas, robos, entre otras. Uno de los procedimientos más comunes es el **aporte voluntario de evidencia**, donde los involucrados exportan sus conversaciones desde el dispositivo móvil y las presentan como prueba.

El problema es que el formato exportado —generalmente un archivo `.txt`— presenta cierto tecnicismo que lo hace ilegible para los operadores judiciales. Esta herramienta resuelve ese problema.

## Funcionalidades

- Carga y parseo del archivo zip o `.txt` exportado desde WhatsApp 
- Visualización de la conversación en una interfaz tipo chat
- Filtrado por rango de fechas
- Identificación del titular de la cuenta
- Exportación del chat visualizado
- Generacion de reportes:
    - Toma de datos referentes al aporte.
    - Soporte para garegar capturas sobre el chat y los participantes.
    - Soporte para adjuntar archivos multimedia adicionalles y una desprcione.
     -Calculo de hash de todos los archivos del chat y los suministrados para el reporte.

## Aplicaciones soportadas

| Aplicación | Sistema Operativo | Estado |
|---|---|---|
| WhatsApp | Android | ✅ Disponible |
| WhatsApp | iOS |  ✅ Disponible |

## Instrucciones de uso

### WhatsApp

1. Exportar la conversación desde WhatsApp.
2. Abrir la aplicacion.
3. Seleccionar el zip exportado.

## Tecnologías utilizadas

- HTML, CSS, JavaScript
- Bootstrap 5
- jQuery / Moment.js / DateRangePicker
- SweetAlert2
- Python 
- Antlr4
- Pywebview
- Flask


## Licencia

Este proyecto se distribuye bajo la licencia **GNU General Public License v3.0 (GPL-3.0)**.

Esto implica que cualquier uso, modificación o distribución del código debe:
- Reconocer a los autores originales.
- Distribuirse bajo la misma licencia.
- Mantener el código fuente accesible.

Para más detalles ver el archivo [LICENSE](./LICENSE).


## Contribuciones

Las contribuciones son bienvenidas. Si encontrás un bug, querés proponer una mejora o extender la herramienta a otras plataformas de mensajería.

El único requisito es que cualquier desarrollo derivado mantenga el carácter de **código abierto y libre uso**.
