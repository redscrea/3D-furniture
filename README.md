# Montaje 3D

Guía de montaje de muebles en 3D, paso a paso, en **español, neerlandés, francés e inglés**, con un chat de **ayuda con IA**.

Primer mueble: **KALLAX 182 × 182 cm + INLÄGG + 2 patas OLOV** (estantería con escritorio).

> Proyecto independiente, sin relación con IKEA. Antes de publicarlo en abierto, consulta la sección «Antes de lanzar».

---

## Qué hay en el repositorio

```
montaje-3d/
├── index.html        Página principal
├── styles.css        Estilos (tema claro y oscuro)
├── js/
│   ├── app.js        Visor 3D, pasos, animaciones y chat
│   └── i18n.js       Todos los textos en ES / NL / FR / EN
├── vendor/three/     Three.js 0.160.0 (licencia MIT), servido desde la propia web
├── fonts/            Fuentes Barlow Condensed e IBM Plex Sans (licencia SIL OFL)
├── api/
│   └── ask.js        Servidor del chat con IA (guarda la clave de Anthropic)
├── test/
│   └── api.test.js   Prueba del servidor (sin gastar créditos)
├── .env.example      Variables que necesita el servidor
├── .gitignore        Evita subir claves a GitHub
├── .vercelignore     Archivos que no se publican en la web
├── vercel.json       Cabeceras de seguridad (CSP y otras)
└── package.json
```

La web no necesita instalar nada ni carga nada de servidores externos: Three.js y las fuentes están en el propio repositorio.

---

## 1. Subirlo a GitHub (sin usar la terminal)

1. Entra en <https://github.com> → botón **New** (nuevo repositorio).
2. Nombre: `montaje-3d`. Puedes dejarlo **privado**. Pulsa **Create repository**.
3. En la página del repositorio vacío, pulsa **uploading an existing file**.
4. Descomprime el zip y **arrastra el contenido de la carpeta** (no la carpeta en sí) a la página.
   - Los archivos que empiezan por punto (`.gitignore`, `.env.example`) pueden estar ocultos en tu ordenador. En Windows: Explorador → Vista → Mostrar → Elementos ocultos. En Mac: `Cmd + Shift + .`
5. Abajo, pulsa **Commit changes**.

Con terminal sería:

```bash
cd montaje-3d
git init && git add . && git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/montaje-3d.git
git push -u origin main
```

## 2. Publicar la web en Vercel

1. Entra en <https://vercel.com> con tu cuenta de GitHub.
2. **Add New → Project** → elige `montaje-3d` → **Import**.
3. *Framework Preset*: **Other**. No cambies nada más → **Deploy**.
4. En un minuto tendrás una dirección del tipo `montaje-3d.vercel.app`. La web ya funciona; el botón de IA todavía no aparece.

## 3. Activar el chat con IA

1. Crea una cuenta en <https://console.anthropic.com>, añade un método de pago y crea una **API key**.
2. **Pon un límite de gasto mensual** en la consola de Anthropic. Es tu red de seguridad.
3. En Vercel: tu proyecto → **Settings → Environment Variables** y añade:

| Variable | Valor | ¿Obligatoria? |
|---|---|---|
| `ANTHROPIC_API_KEY` | tu clave | Sí |
| `ANTHROPIC_MODEL` | `claude-haiku-5-5` (rápido y barato) | No |
| `AI_LIMIT_PER_HOUR` | preguntas por persona y hora (por defecto 20) | No |
| `AI_GLOBAL_LIMIT_PER_HOUR` | preguntas en total por hora, sumando a todos (por defecto 200) | No |
| `ALLOWED_ORIGIN` | tu dirección, p. ej. `https://montaje-3d.vercel.app` | Recomendada |

4. **Deployments → ⋯ → Redeploy**. Ahora aparece «¿Algo no está claro? → Pregunta a la IA».

⚠️ **La clave nunca va en el código ni se sube a GitHub.** Solo en las variables de Vercel. Si alguna vez la pegas por error en un archivo o en un chat, bórrala en la consola de Anthropic y crea otra.

## 4. Probar en tu ordenador (opcional)

Solo la web, sin IA:

```bash
npx serve .
```

Web + IA (necesita [Vercel CLI](https://vercel.com/docs/cli) y un archivo `.env.local` copiado de `.env.example`):

```bash
npx vercel dev
```

Prueba del servidor sin gastar créditos:

```bash
npm run test:api
```

---

## Cómo funciona el chat con IA

- La web envía la pregunta, el historial y una descripción de todos los pasos a `/api/ask`.
- `api/ask.js` añade sus propias reglas (solo ayudar con el montaje), llama a Anthropic con tu clave y devuelve la respuesta poco a poco.
- Las fotos se reducen en el móvil antes de enviarse y **no se guardan**.
- Ver la sección «Seguridad» más abajo.
- La misma web también funciona como artifact dentro de claude.ai; ahí usa la IA de Claude directamente y no necesita el servidor.

## Seguridad

**En la web**
- Política de seguridad de contenido (CSP) estricta en `vercel.json`: solo se ejecutan scripts, estilos y fuentes de la propia web; no se puede incrustar en otras páginas (protege contra *clickjacking*).
- Sin dependencias externas en el navegador: nadie más recibe la IP de los visitantes ni puede cambiar el código que se ejecuta.
- Todo lo que viene del chat se escapa antes de mostrarse (no se puede inyectar HTML).
- Otras cabeceras: `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `COOP`/`CORP`. HTTPS lo fuerza Vercel.

**En el servidor del chat (`api/ask.js`)**
- La clave solo existe en las variables de entorno de Vercel; nunca llega al navegador ni a los registros.
- Solo acepta peticiones de la propia web (`Origin` y `Sec-Fetch-Site`) y en formato JSON.
- Límites: 20 preguntas por IP y hora, 200 en total por hora, ~10 preguntas de historial, tamaño máximo por mensaje e imagen, respuesta máxima de 700 tokens y 60 s de espera.
- Las imágenes se comprueban por su contenido (solo JPEG, PNG, WebP o GIF).
- Reglas fijas que el visitante no puede cambiar: solo ayuda con el montaje.
- Las preguntas y fotos no se guardan; los registros solo anotan códigos de error.

**Límites conocidos**
- Los contadores están en memoria: cada instancia del servidor lleva su cuenta. Un atacante con muchas IPs podría superarlos. La protección definitiva es el **límite de gasto mensual en Anthropic** (obligatorio antes de poner la clave). Si un día hay tráfico real, añade una regla de *rate limiting* en el Firewall de Vercel para `/api/ask` o mueve los contadores a una base de datos (por ejemplo Upstash Redis desde el Marketplace de Vercel).
- Las direcciones de vista previa de Vercel tienen activada la protección por inicio de sesión; la barra de herramientas de Vercel en esas vistas puede no funcionar por la CSP.

---

## Antes de lanzar

- [ ] **Revisar los pasos del KALLAX con el manual oficial (AA-2730792).** Ahora son una reconstrucción simplificada; los de INLÄGG y OLOV salen de sus manuales.
- [ ] Revisión de las traducciones NL y FR por hablantes nativos.
- [ ] Probarlo montando el mueble de verdad, con el móvil.
- [ ] Hablar con IKEA. Los manuales y los nombres de producto son suyos.
- [ ] Aviso legal, política de privacidad (RGPD) y, si añades estadísticas, aviso de cookies.
- [ ] Elegir una licencia para el código (o dejarlo como «todos los derechos reservados»).

## Próximos pasos técnicos

1. Separar el mueble del código: cada mueble como un archivo de «receta» (piezas + pasos).
2. Generador de KALLAX para todos los tamaños (1×4, 2×2, 2×4, 4×4, 5×5).
3. Página de catálogo con buscador.
4. Flujo PDF del manual → propuesta de receta con IA → revisión humana.
