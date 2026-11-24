// Prueba rápida del servidor del chat sin llamar de verdad a Anthropic.
// Ejecutar con: npm run test:api
import assert from 'node:assert/strict';

process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.AI_LIMIT_PER_HOUR = '3';
const { default: handler } = await import('../api/ask.js');

function fakeRes() {
  const r = { status_: 200, headers: {}, body: '', json_: null, ended: false };
  r.status = (c) => { r.status_ = c; return r; };
  r.json = (o) => { r.json_ = o; r.ended = true; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.writeHead = (c, h) => { r.status_ = c; Object.assign(r.headers, h); };
  r.write = (s) => { r.body += s; };
  r.end = () => { r.ended = true; };
  return r;
}
const req = (method, body, ip = '1.1.1.1') => ({ method, body, headers: { 'x-forwarded-for': ip }, socket: {} });

// Simula el streaming de Anthropic, partido en trozos raros.
const sse = [
  'event: message_start\ndata: {"type":"message_start"}\n\n',
  'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hola, "}}\n\nevent: content_bl',
  'ock_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"mira el paso 4."}}\n\n',
  'event: message_stop\ndata: {"type":"message_stop"}\n\n',
];
let lastCall = null;
globalThis.fetch = async (url, opts) => {
  lastCall = { url, body: JSON.parse(opts.body) };
  const stream = new ReadableStream({ start(c) { for (const s of sse) c.enqueue(new TextEncoder().encode(s)); c.close(); } });
  return new Response(stream, { status: 200 });
};

// GET dice que la IA está disponible
let r = fakeRes(); await handler(req('GET'), r);
assert.equal(r.json_.ok, true);

// POST normal con foto
r = fakeRes();
await handler(req('POST', { messages: [{ role: 'user', content: '¿Qué hago?' }], image: 'AAAA' }), r);
assert.equal(r.status_, 200);
assert.equal(r.body, 'Hola, mira el paso 4.');
assert.equal(lastCall.body.messages[0].content[0].type, 'image');
assert.ok(lastCall.body.system.includes('assembly helper'));

// Mensajes mal formados
r = fakeRes(); await handler(req('POST', { messages: [{ role: 'assistant', content: 'x' }] }, '2.2.2.2'), r);
assert.equal(r.status_, 400);

// Límite por hora (3): la 4.ª petición de la misma IP se rechaza
for (let i = 0; i < 3; i++) { r = fakeRes(); await handler(req('POST', { messages: [{ role: 'user', content: 'hola' }] }, '9.9.9.9'), r); }
r = fakeRes(); await handler(req('POST', { messages: [{ role: 'user', content: 'hola' }] }, '9.9.9.9'), r);
assert.equal(r.status_, 429);

console.log('OK: todas las pruebas del servidor pasan');
