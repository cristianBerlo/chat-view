
parser grammar chatWhatsappParser;

options {
    tokenVocab = chatWhatsappLexer;
}

chat
    : message* EOF
    ;
message
    : header content
    ;

header
    : LBRACK? DATE COMMA? TIME RBRACK? DASH? AUTHOR?
    ;

// El tercer termino es el caso que un mensaje tenga un salto de linea y su primer caracter sea un [
content : ( CHAR | NEW_LINE | NEW_LINE LBRACK)+;

