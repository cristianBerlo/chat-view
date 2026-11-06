# Generated from /home/cristian/Sistema-PJ/Sistema PJ/herramienta/grammar/chatWhatsappParser.g4 by ANTLR 4.13.2
from antlr4 import *
if "." in __name__:
    from .chatWhatsappParser import chatWhatsappParser
else:
    from chatWhatsappParser import chatWhatsappParser

# This class defines a complete listener for a parse tree produced by chatWhatsappParser.
class chatWhatsappParserListener(ParseTreeListener):

    # Enter a parse tree produced by chatWhatsappParser#chat.
    def enterChat(self, ctx:chatWhatsappParser.ChatContext):
        pass

    # Exit a parse tree produced by chatWhatsappParser#chat.
    def exitChat(self, ctx:chatWhatsappParser.ChatContext):
        pass


    # Enter a parse tree produced by chatWhatsappParser#message.
    def enterMessage(self, ctx:chatWhatsappParser.MessageContext):
        pass

    # Exit a parse tree produced by chatWhatsappParser#message.
    def exitMessage(self, ctx:chatWhatsappParser.MessageContext):
        pass


    # Enter a parse tree produced by chatWhatsappParser#header.
    def enterHeader(self, ctx:chatWhatsappParser.HeaderContext):
        pass

    # Exit a parse tree produced by chatWhatsappParser#header.
    def exitHeader(self, ctx:chatWhatsappParser.HeaderContext):
        pass


    # Enter a parse tree produced by chatWhatsappParser#content.
    def enterContent(self, ctx:chatWhatsappParser.ContentContext):
        pass

    # Exit a parse tree produced by chatWhatsappParser#content.
    def exitContent(self, ctx:chatWhatsappParser.ContentContext):
        pass



del chatWhatsappParser