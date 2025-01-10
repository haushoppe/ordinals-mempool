
import { decodeDataURI } from '/resources/inscription-assets/decode-data-uri.js';

const text = decodeDataURI(window.textBase64);

let pre = document.querySelector('body > pre');

// ⚠️ This helps mitigate Cross-Site Scripting (XSS) attacks.
// ⚠️ NEVER insert the content directly into the HTML using innerHTML or other methods.
// ⚠️ Always use innerText to safely render text content.
pre.innerText = text;

// this zooms the text and makes it either very large or super small
// this is how ord displays text – and it's very ugly :D
let { width, height } = pre.getBoundingClientRect();
let columns = width / 16;
let rows = height / 16;
pre.style.fontSize = `min(${95/columns}vw, ${95/rows}vh)`;
pre.style.opacity = 1;
