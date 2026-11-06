lexer grammar chatWhatsappLexer;

fragment DIGIT
    : [0-9]
    ;
//Limpio caracteres invisibles del header
 IGNORE
    : [\u200E\u200F\u202A-\u202E\u2066-\u2069] -> skip
    ;

LBRACK : '[' ;
RBRACK : ']' ;
COMMA  : ',' ;


DATE
    : DIGIT DIGIT? '/' DIGIT DIGIT? '/'
      DIGIT DIGIT (DIGIT DIGIT)?
    ;

TIME
    : ' ' DIGIT DIGIT? ':' DIGIT DIGIT
      (':' DIGIT DIGIT)?
    ;
DASH   : '-'    -> mode(AuthorMode); // El dash en el header separa la fecha del autor en android, el modo me permite
// capturar correctamente los mensajes sin autor (mensajes del sistema)
AUTHOR
      :    [ \t]+ ~[-] ~[:\r\n]+ ':'
      -> mode(MessageMode)  //Existen tres estas y se va saltando entre ellos,
      // al encontrar un autor paso al estado de mensaje
    ;

WS
    : [ \t\n\r]+ -> skip
    ;
mode MessageMode; //En este estado consumo todos los caracteres hasta encontrar un inicio de linea

NEW_LINE
    : '\r'? '\n'
      -> mode(NewLineMode)
    ;

CHAR
    : ~[\r\n\u200E\u200F\u202A-\u202E\u2066-\u2069]+
    ;
    //Limpio caracteres invisibles del mensaje
 IGNORE_MESSAGE
    : [\u200E\u200F\u202A-\u202E\u2066-\u2069] -> skip
    ;

mode NewLineMode; // Veo si el inicio de linea comienza con una fecha, si es asio considero que hay un nuevo mensaje
// Paso al estado regular
    //Limpio caracteres invisibles de la nueva linea
    IGNORE_NEW_LINE
        : [\u200E\u200F\u202A-\u202E\u2066-\u2069] -> skip
    ;

    NEW_DATE:  DIGIT DIGIT? '/' DIGIT DIGIT? '/'
      DIGIT DIGIT (DIGIT DIGIT)? -> mode(DEFAULT_MODE), type(DATE)
    ;
    //En el caso de que me encuentre un [ abierto lo envio, ya que las fechas de IOS empiezan con
    // [ y no quiero que se considere un char
    OPENBRACKET: '[' -> type(LBRACK);
    OTHER: . -> mode(MessageMode), type(CHAR);

mode AuthorMode;  //Modo pensado para los chats de android donde los mensajes de sistema no tienen autor
fragment STRING
      :    [ \t]+ ~[-] ~[:\r\n]+
      ;
EAUTHOR :   STRING ':'-> mode(MessageMode), type(AUTHOR);
SYSTEM  :   STRING -> mode(MessageMode), type(CHAR);
