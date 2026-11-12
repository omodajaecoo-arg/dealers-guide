# Guía de marca para concesionarios · OMODA & JAECOO Argentina

Sitio estático (GitHub Pages) con la guía de marca para la red de concesionarios.

- Cada concesionario entra con su código o con su link directo (`/#codigo`).
- El contenido viaja cifrado dentro de `index.html`: sin un código válido no se puede leer.
- Los códigos no están en este repositorio.

## Actualizar
1. `python3 tools/decrypt.py <codigo>` recupera el contenido en `tools/content.html` y `tools/logos.json`.
2. Editar `tools/content.html`.
3. Poner los códigos en `tools/codes.json` y correr `python3 tools/build.py`.
4. Commit y push de `index.html`.

`content.html`, `logos.json` y `codes.json` están en `.gitignore`: nunca se suben.

Consultas: marketingar@omodaglobal.com
