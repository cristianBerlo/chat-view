# Generated from /home/cristian/Sistema-PJ/Sistema PJ/herramienta/grammar/chatWhatsappParser.g4 by ANTLR 4.13.2
# encoding: utf-8
from antlr4 import *
from io import StringIO
import sys
if sys.version_info[1] > 5:
	from typing import TextIO
else:
	from typing.io import TextIO

def serializedATN():
    return [
        4,1,13,44,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,1,0,5,0,10,8,0,10,0,12,
        0,13,9,0,1,0,1,0,1,1,1,1,1,1,1,2,3,2,21,8,2,1,2,1,2,3,2,25,8,2,1,
        2,1,2,3,2,29,8,2,1,2,3,2,32,8,2,1,2,1,2,1,3,1,3,1,3,1,3,4,3,40,8,
        3,11,3,12,3,41,1,3,0,0,4,0,2,4,6,0,0,47,0,11,1,0,0,0,2,16,1,0,0,
        0,4,20,1,0,0,0,6,39,1,0,0,0,8,10,3,2,1,0,9,8,1,0,0,0,10,13,1,0,0,
        0,11,9,1,0,0,0,11,12,1,0,0,0,12,14,1,0,0,0,13,11,1,0,0,0,14,15,5,
        0,0,1,15,1,1,0,0,0,16,17,3,4,2,0,17,18,3,6,3,0,18,3,1,0,0,0,19,21,
        5,2,0,0,20,19,1,0,0,0,20,21,1,0,0,0,21,22,1,0,0,0,22,24,5,5,0,0,
        23,25,5,4,0,0,24,23,1,0,0,0,24,25,1,0,0,0,25,26,1,0,0,0,26,28,5,
        6,0,0,27,29,5,3,0,0,28,27,1,0,0,0,28,29,1,0,0,0,29,31,1,0,0,0,30,
        32,5,7,0,0,31,30,1,0,0,0,31,32,1,0,0,0,32,33,1,0,0,0,33,34,5,8,0,
        0,34,5,1,0,0,0,35,40,5,11,0,0,36,40,5,10,0,0,37,38,5,10,0,0,38,40,
        5,2,0,0,39,35,1,0,0,0,39,36,1,0,0,0,39,37,1,0,0,0,40,41,1,0,0,0,
        41,39,1,0,0,0,41,42,1,0,0,0,42,7,1,0,0,0,7,11,20,24,28,31,39,41
    ]

class chatWhatsappParser ( Parser ):

    grammarFileName = "chatWhatsappParser.g4"

    atn = ATNDeserializer().deserialize(serializedATN())

    decisionsToDFA = [ DFA(ds, i) for i, ds in enumerate(atn.decisionToState) ]

    sharedContextCache = PredictionContextCache()

    literalNames = [ "<INVALID>", "<INVALID>", "<INVALID>", "']'", "','", 
                     "<INVALID>", "<INVALID>", "'-'" ]

    symbolicNames = [ "<INVALID>", "IGNORE", "LBRACK", "RBRACK", "COMMA", 
                      "DATE", "TIME", "DASH", "AUTHOR", "WS", "NEW_LINE", 
                      "CHAR", "IGNORE_MESSAGE", "IGNORE_NEW_LINE" ]

    RULE_chat = 0
    RULE_message = 1
    RULE_header = 2
    RULE_content = 3

    ruleNames =  [ "chat", "message", "header", "content" ]

    EOF = Token.EOF
    IGNORE=1
    LBRACK=2
    RBRACK=3
    COMMA=4
    DATE=5
    TIME=6
    DASH=7
    AUTHOR=8
    WS=9
    NEW_LINE=10
    CHAR=11
    IGNORE_MESSAGE=12
    IGNORE_NEW_LINE=13

    def __init__(self, input:TokenStream, output:TextIO = sys.stdout):
        super().__init__(input, output)
        self.checkVersion("4.13.2")
        self._interp = ParserATNSimulator(self, self.atn, self.decisionsToDFA, self.sharedContextCache)
        self._predicates = None




    class ChatContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def EOF(self):
            return self.getToken(chatWhatsappParser.EOF, 0)

        def message(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(chatWhatsappParser.MessageContext)
            else:
                return self.getTypedRuleContext(chatWhatsappParser.MessageContext,i)


        def getRuleIndex(self):
            return chatWhatsappParser.RULE_chat

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterChat" ):
                listener.enterChat(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitChat" ):
                listener.exitChat(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitChat" ):
                return visitor.visitChat(self)
            else:
                return visitor.visitChildren(self)




    def chat(self):

        localctx = chatWhatsappParser.ChatContext(self, self._ctx, self.state)
        self.enterRule(localctx, 0, self.RULE_chat)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 11
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            while _la==2 or _la==5:
                self.state = 8
                self.message()
                self.state = 13
                self._errHandler.sync(self)
                _la = self._input.LA(1)

            self.state = 14
            self.match(chatWhatsappParser.EOF)
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class MessageContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def header(self):
            return self.getTypedRuleContext(chatWhatsappParser.HeaderContext,0)


        def content(self):
            return self.getTypedRuleContext(chatWhatsappParser.ContentContext,0)


        def getRuleIndex(self):
            return chatWhatsappParser.RULE_message

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterMessage" ):
                listener.enterMessage(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitMessage" ):
                listener.exitMessage(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitMessage" ):
                return visitor.visitMessage(self)
            else:
                return visitor.visitChildren(self)




    def message(self):

        localctx = chatWhatsappParser.MessageContext(self, self._ctx, self.state)
        self.enterRule(localctx, 2, self.RULE_message)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 16
            self.header()
            self.state = 17
            self.content()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class HeaderContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def DATE(self):
            return self.getToken(chatWhatsappParser.DATE, 0)

        def TIME(self):
            return self.getToken(chatWhatsappParser.TIME, 0)

        def AUTHOR(self):
            return self.getToken(chatWhatsappParser.AUTHOR, 0)

        def LBRACK(self):
            return self.getToken(chatWhatsappParser.LBRACK, 0)

        def COMMA(self):
            return self.getToken(chatWhatsappParser.COMMA, 0)

        def RBRACK(self):
            return self.getToken(chatWhatsappParser.RBRACK, 0)

        def DASH(self):
            return self.getToken(chatWhatsappParser.DASH, 0)

        def getRuleIndex(self):
            return chatWhatsappParser.RULE_header

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterHeader" ):
                listener.enterHeader(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitHeader" ):
                listener.exitHeader(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitHeader" ):
                return visitor.visitHeader(self)
            else:
                return visitor.visitChildren(self)




    def header(self):

        localctx = chatWhatsappParser.HeaderContext(self, self._ctx, self.state)
        self.enterRule(localctx, 4, self.RULE_header)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 20
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            if _la==2:
                self.state = 19
                self.match(chatWhatsappParser.LBRACK)


            self.state = 22
            self.match(chatWhatsappParser.DATE)
            self.state = 24
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            if _la==4:
                self.state = 23
                self.match(chatWhatsappParser.COMMA)


            self.state = 26
            self.match(chatWhatsappParser.TIME)
            self.state = 28
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            if _la==3:
                self.state = 27
                self.match(chatWhatsappParser.RBRACK)


            self.state = 31
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            if _la==7:
                self.state = 30
                self.match(chatWhatsappParser.DASH)


            self.state = 33
            self.match(chatWhatsappParser.AUTHOR)
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class ContentContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def CHAR(self, i:int=None):
            if i is None:
                return self.getTokens(chatWhatsappParser.CHAR)
            else:
                return self.getToken(chatWhatsappParser.CHAR, i)

        def NEW_LINE(self, i:int=None):
            if i is None:
                return self.getTokens(chatWhatsappParser.NEW_LINE)
            else:
                return self.getToken(chatWhatsappParser.NEW_LINE, i)

        def LBRACK(self, i:int=None):
            if i is None:
                return self.getTokens(chatWhatsappParser.LBRACK)
            else:
                return self.getToken(chatWhatsappParser.LBRACK, i)

        def getRuleIndex(self):
            return chatWhatsappParser.RULE_content

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterContent" ):
                listener.enterContent(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitContent" ):
                listener.exitContent(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitContent" ):
                return visitor.visitContent(self)
            else:
                return visitor.visitChildren(self)




    def content(self):

        localctx = chatWhatsappParser.ContentContext(self, self._ctx, self.state)
        self.enterRule(localctx, 6, self.RULE_content)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 39 
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            while True:
                self.state = 39
                self._errHandler.sync(self)
                la_ = self._interp.adaptivePredict(self._input,5,self._ctx)
                if la_ == 1:
                    self.state = 35
                    self.match(chatWhatsappParser.CHAR)
                    pass

                elif la_ == 2:
                    self.state = 36
                    self.match(chatWhatsappParser.NEW_LINE)
                    pass

                elif la_ == 3:
                    self.state = 37
                    self.match(chatWhatsappParser.NEW_LINE)
                    self.state = 38
                    self.match(chatWhatsappParser.LBRACK)
                    pass


                self.state = 41 
                self._errHandler.sync(self)
                _la = self._input.LA(1)
                if not (_la==10 or _la==11):
                    break

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx





