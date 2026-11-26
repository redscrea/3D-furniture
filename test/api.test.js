// Pruebas del servidor del chat sin llamar de verdad a Anthropic.
// Ejecutar con: npm run test:api
import assert from 'node:assert/strict';

process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.AI_LIMIT_PER_HOUR = '3';
process.env.AI_GLOBAL_LIMIT_PER_HOUR = '1000';
const { default: handler } = await import('../api/ask.js');

const HOST = 'furnituretest.vercel.app';
function fakeRes() {
  const r = { status_: 200, headers: {}, body: '', json_: null, ended: false, writableEnded: false };
  r.status = (c) => { r.status_ = c; return r; };
  r.json = (o) => { r.json_ = o; r.ended = r.writableEnded = true; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.writeHead = (c, h) => { r.status_ = c; Object.assign(r.headers, h); };
  r.write = (s) => { r.body += s; };
  r.end = () => { r.ended = r.writableEnded = true; };
  return r;
}
let ipN = 0;
function req(method, body, { ip, origin = `https://${HOST}`, site = 'same-origin', type = 'application/json' } = {}) {
  const headers = { host: HOST, 'x-real-ip': ip || `10.0.0.${++ipN}` };
  if (origin) headers.origin = origin;
  if (site) headers['sec-fetch-site'] = site;
  if (type) headers['content-type'] = type;
  return { method, body, headers, socket: {}, on() {} };
}
const ok = (content = '¿Qué hago?') => ({ messages: [{ role: 'user', content }] });
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]).toString('base64');
const HTML = Buffer.from('<html><script>alert(1)</script></html>').toString('base64');

// Simula el streaming de Anthropic, partido en trozos raros.
const sse = [
  'event: message_start\ndata: {"type":"message_start"}\n\n',
  'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hola, "}}\n\nevent: content_bl',
  'ock_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"mira el paso 4."}}\n\n',
  'event: message_stop\ndata: {"type":"message_stop"}\n\n',
];
let lastCall = null;
globalThis.fetch = async (url, opts) => {
  lastCall = { url, body: JSON.parse(opts.body), headers: opts.headers };
  const stream = new ReadableStream({ start(c) { for (const s of sse) c.enqueue(new TextEncoder().encode(s)); c.close(); } });
  return new Response(stream, { status: 200 });
};
async function run(r) { const res = fakeRes(); await handler(r, res); return res; }

// 1. GET dice que la IA está disponible
assert.equal((await run(req('GET'))).json_.ok, true);

// 2. POST normal con foto JPEG
let r = await run(req('POST', { ...ok(), image: JPEG }));
assert.equal(r.status_, 200);
assert.equal(r.body, 'Hola, mira el paso 4.');
assert.equal(lastCall.body.messages[0].content[0].source.media_type, 'image/jpeg');
assert.ok(lastCall.body.system.includes('assembly helper'));
assert.equal(lastCall.body.max_tokens, 700);

// 3. Otra web o un script sin Origin no pueden usar el chat
assert.equal((await run(req('POST', ok(), { origin: 'https://evil.example' }))).status_, 403);
assert.equal((await run(req('POST', ok(), { origin: null, site: null }))).status_, 403);
assert.equal((await run(req('POST', ok(), { site: 'cross-site' }))).status_, 403);

// 4. Solo JSON (evita envíos "simples" desde otras webs)
assert.equal((await run(req('POST', JSON.stringify(ok()), { type: 'text/plain' }))).status_, 415);

// 5. Validación de mensajes e imágenes
assert.equal((await run(req('POST', { messages: [{ role: 'assistant', content: 'x' }] }))).status_, 400);
assert.equal((await run(req('POST', ok('x'.repeat(16_001))))).status_, 400);
assert.equal((await run(req('POST', { ...ok(), image: HTML }))).status_, 400);
assert.equal((await run(req('POST', { ...ok(), image: 'no es base64 !!' }))).status_, 400);
const long = { messages: Array.from({ length: 23 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'hola' })) };
assert.equal((await run(req('POST', long))).status_, 400);

// 6. Límite por hora (3): la 4.ª petición de la misma IP se rechaza
for (let i = 0; i < 3; i++) assert.equal((await run(req('POST', ok(), { ip: '9.9.9.9' }))).status_, 200);
assert.equal((await run(req('POST', ok(), { ip: '9.9.9.9' }))).status_, 429);

// 7. La clave nunca aparece en la respuesta
assert.ok(!JSON.stringify(r).includes('test-key'));

console.log('OK: todas las pruebas del servidor pasan');
