/*
 * Glimmer Rewrite Preprocessor
 * ============================
 * The Handlebars parser does not preserve all whitespace when parsing.
 *
 * This is a hacky workaround that replaces whitespace with other characters
 * so that it will be preserved. It does this while preserving the syntactic
 * correctness.
 * After parsing out the AST these special chars can be replaced with thier
 * true counterparts.
 * Please don't hate me.
 */

{
  var SPACE   = options.SPACE_CHAR   || '\x20',
      TAB     = options.TAB_CHAR     || '\x09',
      NEWLINE = options.NEWLINE_CHAR || '\x0A',
      RETURN  = options.RETURN_CHA   || '\x0D';

  var OPEN_MUSTACHE           = "{{",
      CLOSE_MUSTACHE          = "}}",
      OPEN_MUSTACHE_UNESCAPE  = "{{{",
      CLOSE_MUSTACHE_UNESCAPE = "}}}",
}

start
  = c:(
    TAB /
    SPACE /
    RETURN /
    NEWLINE /
    HTML_COMMENT /
    CLOSETAG /
    OPENTAG /
    MUSTACHE_COMMENT /
    MUSTACHE_UNESCAPE /
    BLOCKEND /
    BLOCKSTART /
    MUSTACHE /
    .
  )*
  {
      return c.join('');
  }

OPENTAG "OPENTAG"
  = "<" c:(!">" c:. { return c })* ">"
  { return "<" + c.join('') + ">" }

HTML_COMMENT "HTML_COMMENT"
  = "<!--" c:(!"-->" c:. { return c })* "-->"
  { return "<!--" + c.join('') + "-->" }

CLOSETAG "CLOSETAG"
  = "</" c:(!">" c:. { return c })* ">"
  { return "</" + c.join('') + ">" }

BLOCKSTART "BLOCKSTART"
  = "{{#" c:(!"}}" c:. { return c })* "}}"
  { return OPEN_MUSTACHE + "#" + c.join('') + CLOSE_MUSTACHE }

BLOCKEND "BLOCKEND"
  = "{{/" c:(!"}}" c:. { return c })* "}}"
  { return OPEN_MUSTACHE + "/" + c.join('') + CLOSE_MUSTACHE }

MUSTACHE "MUSTACHE"
  = "{{" c:(!"}}" c:. { return c })* "}}"
  { return OPEN_MUSTACHE + c.join('') + CLOSE_MUSTACHE }

MUSTACHE_UNESCAPE "MUSTACHE_UNESCAPE"
  = "{{{" c:(!"}}}" c:. { return c })* "}}}"
    { return OPEN_MUSTACHE_UNESCAPE + c.join('') + CLOSE_MUSTACHE_UNESCAPE }

MUSTACHE_COMMENT "MUSTACHE_COMMENT"
   = "{{!--" c:(!"--}}" c:. { return c })*  "--}}"
    { return OPEN_MUSTACHE + "!--" + c.join('') + "--" + CLOSE_MUSTACHE }

TAB "TAB"
  = "\t" { return TAB }

SPACE "SPACE"
  = " "  { return SPACE }

RETURN "RETURN"
  = "\r" { return RETURN }

NEWLINE "NEWLINE"
  = "\n" { return NEWLINE }
