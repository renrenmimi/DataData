// Lightweight syntax highlighter — zero dependencies, supports java / python / js.
// Approach: one master regex sweeps the source (comment | string | number |
// identifier | operator); identifiers are then classified as keyword,
// capitalized type, or function (followed by "("); finally the tokens are split
// on newlines so CodeBlock can render line numbers and highlighted lines.

export type CodeLangId = "java" | "python" | "js";

export type TokType = "kw" | "str" | "num" | "com" | "fn" | "type" | "op" | "";

export interface Tok {
  t: TokType;
  s: string;
}

const KW: Record<CodeLangId, Set<string>> = {
  java: new Set(
    "public private protected static final void int long double float boolean char byte short class interface extends implements new return if else for while do switch case break continue null true false this super import package try catch finally throw throws var record enum abstract default instanceof".split(
      " ",
    ),
  ),
  python: new Set(
    "def class return if elif else for while in not and or is None True False import from as with try except finally raise lambda yield pass break continue global nonlocal del assert self match case async await".split(
      " ",
    ),
  ),
  js: new Set(
    "const let var function return if else for while do switch case break continue new class extends this null undefined true false import from export default try catch finally throw typeof instanceof of in async await yield delete void static get set".split(
      " ",
    ),
  ),
};

const RE: Record<CodeLangId, RegExp> = {
  java: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b0x[\da-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]+)?[fFdDlL]?\b)|([A-Za-z_$][\w$]*)|([+\-*/%=<>!&|^~?:]+)/g,
  python:
    /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*')|(\b0x[\da-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]+)?\b)|([A-Za-z_][\w]*)|([+\-*/%=<>!&|^~@:]+)/g,
  js: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b0x[\da-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]+)?\b)|([A-Za-z_$][\w$]*)|([+\-*/%=<>!&|^~?:]+)/g,
};

/** Is the identifier immediately followed by "(" (spaces allowed)? → a function name */
function isCall(code: string, end: number): boolean {
  let i = end;
  while (i < code.length && code[i] === " ") i++;
  return code[i] === "(";
}

/** Highlight a whole snippet into a lines × tokens matrix */
export function highlight(code: string, lang: CodeLangId): Tok[][] {
  const re = new RegExp(RE[lang].source, "g");
  const toks: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(code))) {
    if (m.index > last) toks.push({ t: "", s: code.slice(last, m.index) });
    const [full, com, str, num, ident, op] = m;
    if (com) toks.push({ t: "com", s: com });
    else if (str) toks.push({ t: "str", s: str });
    else if (num) toks.push({ t: "num", s: num });
    else if (ident) {
      if (KW[lang].has(ident)) toks.push({ t: "kw", s: ident });
      else if (/^[A-Z]/.test(ident)) toks.push({ t: "type", s: ident });
      else if (isCall(code, m.index + ident.length))
        toks.push({ t: "fn", s: ident });
      else toks.push({ t: "", s: ident });
    } else if (op) toks.push({ t: "op", s: op });
    else toks.push({ t: "", s: full });
    last = m.index + full.length;
  }
  if (last < code.length) toks.push({ t: "", s: code.slice(last) });

  // Split into lines (a token may contain \n — block comments, triple-quoted strings)
  const lines: Tok[][] = [[]];
  for (const tok of toks) {
    const parts = tok.s.split("\n");
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ t: tok.t, s: p });
    });
  }
  return lines;
}
