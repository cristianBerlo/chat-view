# Generated from /home/cristian/Sistema-PJ/Sistema PJ/herramienta/grammar/chatWhatsappParser.g4 by ANTLR 4.13.2
from antlr4 import *
import re

if "." in __name__:
    from .chatWhatsappParser import chatWhatsappParser
else:
    from chatWhatsappParser import chatWhatsappParser

# This class defines a complete generic visitor for a parse tree produced by chatWhatsappParser.

class chatWhatsappParserVisitor(ParseTreeVisitor):

    #declaraciones para metodo auxiliar
    DEC_ANDROID = ["(archivo adjunto)", "(file attached)"]
    DEC_IOS = ["<adjunto:"]

    _dec_pat_and = "|".join([re.escape(d) for d in DEC_ANDROID])
    _dec_pat_ios = "|".join([re.escape(d) for d in DEC_IOS])

    _PATTERN_STR = (
        rf"^(?:{_dec_pat_ios})\s+(?P<filename_ios>.+?)(?:>)(?:\n(?P<rest_ios>[\s\S]*))?$|"
        rf"^(?P<filename_and>.+)\s+(?:{_dec_pat_and})(?:\n(?P<rest_and>[\s\S]*))?$"
    )
    _COMPILED_PATTERN = re.compile(_PATTERN_STR)

    @staticmethod
    def is_file(text: str) -> dict:
        match = chatWhatsappParserVisitor._COMPILED_PATTERN.match(text)
        if match:
            data = match.groupdict()
            # Extract whichever matched (iOS or Android)
            filename = data.get("filename_ios") or data.get("filename_and") or ""
            rest = data.get("rest_ios") or data.get("rest_and") or ""

            return {
                "NameFileWhitExtension": filename.strip(),
                "Mensaje": rest
            }

        # Fallback if it's a regular message without a file
        return {
            "NameFileWhitExtension": "",
            "Mensaje": text
        }

    def visitChat(self, ctx: chatWhatsappParser.ChatContext):
        messages = []
        txt = []
        if ctx.message():
            for msg_ctx in ctx.message():
                if (res := self.visit(msg_ctx)) is not None:
                    messages.append(res.get("json"))
                    txt.append(res.get("txt"))
        return {"json": messages, "txt": txt}

    def visitMessage(self, ctx:chatWhatsappParser.MessageContext):
        header = self.visit(ctx.header())
        content = self.visit(ctx.content())
        return {"json":(header.get("json") | content.get("json")),"txt":(header.get("txt") +" "+ content.get("txt")+"\n") }



    def visitHeader(self, ctx: chatWhatsappParser.HeaderContext):
        date = ctx.DATE().getText() if ctx.DATE() else None
        time = ctx.TIME().getText() if ctx.TIME() else None
        sauthor = ctx.AUTHOR().getText() if ctx.AUTHOR() else None
        if not sauthor or "<missing AUTHOR>" == sauthor:
            author = "SistemaDeWhatsApp"
        else:
            author = sauthor
        txt =  date + time + author
        author = author.lstrip()
        author = author.removesuffix(":")
        header_data = {"Nombre": author,
                      "Fecha": date,
                      "Hora": time}
        return {"json":header_data,"txt": txt }


    def visitContent(self, ctx:chatWhatsappParser.ContentContext):
        content = "".join(
            child.getText()
            for child in (ctx.children or [])
        ).strip()
        # Una vez unificado el texto tengo que comprobar si es un archivo o un mensaje
        return {"json":chatWhatsappParserVisitor.is_file(content) , "txt": content}




del chatWhatsappParser
