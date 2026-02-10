# Favicon Guide

Este projeto já contém `favicon.svg` e `icon-brand.jpg` em `public/`.
Para gerar favicons em vários tamanhos (PNG e ICO) recomendo usar ImageMagick ou um serviço online.

Exemplos com ImageMagick (local):

1) Gere PNGs a partir do `icon-brand.jpg` (ou SVG se tiver):

```bash
# a partir de PNG/JPG - cria 16x16 e 32x32
convert public/icon-brand.jpg -resize 32x32 public/favicon-32x32.png
convert public/icon-brand.jpg -resize 16x16 public/favicon-16x16.png

# opcional: criar Apple touch icon 180x180
convert public/icon-brand.jpg -resize 180x180 public/apple-touch-icon.png
```

2) Gere um arquivo `favicon.ico` com múltiplas resoluções:

```bash
convert public/icon-brand.jpg -resize 16x16 favicon-16.png
convert public/icon-brand.jpg -resize 32x32 favicon-32.png
convert public/icon-brand.jpg -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png public/favicon.ico
rm favicon-16.png favicon-32.png favicon-48.png
```

3) Alternativa rápida (usando `pngquant` para otimizar):

```bash
convert public/icon-brand.jpg -resize 32x32 png32:public/favicon-32x32.png
pngquant --quality=65-80 --force --output public/favicon-32x32.png public/favicon-32x32.png
```

Se você não tiver ImageMagick no ambiente, use um gerador online como
- https://[REDACTED_TOKEN].net/

Coloque os arquivos gerados em `frontend/public/` e os links em `src/pages/_document.jsx` já foram adicionados.
