// Dessin 2D des calques de texte sur un canvas (utilisé comme texture 3D)
export const S = 1024
export const FONTS = ['Bangers','Anton','Bebas Neue','Archivo Black','Lobster','Pacifico','Permanent Marker','Rubik Mono One','Righteous','Shrikhand']
export const SHAPES = [['bloc','Bloc'],['droit','Droit'],['haut','Arc haut'],['bas','Arc bas'],['cercle','Cercle']]

const off = document.createElement('canvas'); off.width = off.height = S
const o = off.getContext('2d')

function drawLayer(l) {
  o.clearRect(0, 0, S, S)
  const lines = l.text.toUpperCase().split('\n').filter(x => x.trim())
  if (!lines.length) return
  const k = l.size / 100, cy = S / 2 + l.y, f = l.font
  o.fillStyle = l.color; o.textAlign = 'center'; o.textBaseline = 'middle'

  if (l.shape === 'bloc') {            // chaque ligne remplit la même largeur
    const W = 700 * k, H = Math.min(210, 620 / lines.length) * k
    const y0 = cy - (lines.length - 1) * H / 2
    lines.forEach((t, i) => {
      o.font = `200px "${f}"`
      const w = o.measureText(t).width || 1
      o.save(); o.translate(S / 2, y0 + i * H); o.scale(W / w, H / 170); o.fillText(t, 0, 0); o.restore()
    })
  } else if (l.shape === 'droit') {
    const px = 150 * k, lh = px * 1.05, y0 = cy - (lines.length - 1) * lh / 2
    o.font = `${px}px "${f}"`
    lines.forEach((t, i) => {
      const w = o.measureText(t).width, s = w > 860 ? 860 / w : 1
      o.save(); o.translate(S / 2, y0 + i * lh); o.scale(s, s); o.fillText(t, 0, 0); o.restore()
    })
  } else {                              // arcs et cercle
    const str = lines.join(' ') + (l.shape === 'cercle' ? '  ' : ''), R = 300
    o.font = `100px "${f}"`
    const base = [...str].map(c => o.measureText(c).width)
    const tot = base.reduce((a, b) => a + b, 0) || 1
    const px = l.shape === 'cercle' ? Math.min(160, 100 * (2 * Math.PI * R * .98) / tot) : 110 * k
    const sc = px / 100
    let a = -(tot * sc / R) / 2
    o.font = `${px}px "${f}"`
    ;[...str].forEach((c, i) => {
      const w = base[i] * sc, ang = a + w / 2 / R; a += w / R
      o.save()
      if (l.shape === 'bas') { o.translate(S / 2, cy - R * .55); o.rotate(-ang); o.translate(0, R) }
      else { o.translate(S / 2, cy + R * .55); o.rotate(ang); o.translate(0, -R) }
      o.fillText(c, 0, 0); o.restore()
    })
  }
}

export function renderAll(ctx, layers) {
  ctx.clearRect(0, 0, S, S)
  for (const l of layers) {
    drawLayer(l)
    if (!l.wave) ctx.drawImage(off, 0, 0)
    else for (let x = 0; x < S; x += 2) ctx.drawImage(off, x, 0, 2, S, x, Math.sin(x / 85) * l.wave, 2, S)
  }
}
