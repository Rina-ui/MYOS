import { useEffect, useMemo, useState } from 'react'
import Viewer from './Viewer.jsx'
import { renderAll, S, FONTS, SHAPES } from './render.js'

const COLORS = ['#4a2c1a', '#111111', '#f2ede0', '#1f3558', '#5a1f2b', '#2f4a3a', '#8a8a8a', '#c9a24d']
let nextId = 3
const newLayer = (o = {}) => ({ id: nextId++, text: 'NOUVEAU', font: 'Anton', shape: 'droit', size: 60, wave: 0, y: 0, color: '#d4a95a', ...o })

// Formes découpées (coordonnées 0 → 1) : encoches, creux, coins organiques
const Defs = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs>
      <clipPath id="cStage" clipPathUnits="objectBoundingBox">
        <path d="M0,0.08 C0,0.03 0.02,0 0.05,0 L0.26,0 C0.32,0 0.31,0.105 0.37,0.105 L0.62,0.105 C0.68,0.105 0.67,0 0.73,0 L0.95,0 C0.98,0 1,0.03 1,0.08 L1,0.92 C1,0.97 0.98,1 0.95,1 L0.32,1 C0.28,1 0.265,0.97 0.265,0.92 L0.265,0.78 C0.265,0.71 0.21,0.68 0.14,0.63 C0.06,0.58 0,0.57 0,0.49 Z" />
      </clipPath>
      <clipPath id="cFrame" clipPathUnits="objectBoundingBox">
        <path d="M0,0.15 C0,0.115 0.03,0.1 0.08,0.1 L0.19,0.1 C0.27,0.1 0.24,0 0.33,0 L0.93,0 C0.97,0 1,0.02 1,0.05 L1,0.95 C1,0.98 0.97,1 0.93,1 L0.07,1 C0.03,1 0,0.98 0,0.95 Z" />
      </clipPath>
      <clipPath id="cGlass" clipPathUnits="objectBoundingBox">
        <path d="M0,0.3 C0,0.1 0.06,0 0.16,0 L0.9,0 C0.96,0 1,0.06 1,0.14 L1,0.86 C1,0.95 0.96,1 0.9,1 L0.2,1 C0.12,1 0.1,0.88 0.06,0.8 C0.02,0.7 0,0.6 0,0.45 Z" />
      </clipPath>
    </defs></svg>
)

export default function App() {
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = S; return c }, [])
  const [shirt, setShirt] = useState('#4a2c1a')
  const [layers, setLayers] = useState([
    { id: 1, text: "IT'S A GOOD DAY TO...", font: 'Pacifico', shape: 'haut', size: 55, wave: 0, y: -250, color: '#d4a95a' },
    { id: 2, text: 'KEEP\nGOD\nFIRST', font: 'Bangers', shape: 'bloc', size: 90, wave: 0, y: 60, color: '#d4a95a' },
  ])
  const [sel, setSel] = useState(2)
  const [version, setVersion] = useState(0)
  const cur = layers.find(l => l.id === sel) || layers[0]

  useEffect(() => {
    let dead = false
    Promise.all(layers.map(l => document.fonts.load(`80px "${l.font}"`))).catch(() => {}).then(() => {
      if (dead) return
      renderAll(canvas.getContext('2d'), layers); setVersion(v => v + 1)
    })
    return () => { dead = true }
  }, [layers, canvas])

  const set = patch => setLayers(ls => ls.map(l => (l.id === cur.id ? { ...l, ...patch } : l)))
  const add = () => { const l = newLayer(); setLayers(ls => [...ls, l]); setSel(l.id) }
  const dup = () => { const l = newLayer({ ...cur, y: cur.y + 50 }); setLayers(ls => [...ls, l]); setSel(l.id) }
  const del = () => { if (layers.length < 2) return; const r = layers.filter(l => l.id !== cur.id); setLayers(r); setSel(r[0].id) }
  const nextShape = () => { const i = SHAPES.findIndex(s => s[0] === cur.shape); set({ shape: SHAPES[(i + 1) % SHAPES.length][0] }) }

  return (
      <div className="bento">
        <Defs />

        {/* ============ GAUCHE : scène découpée ============ */}
        <div className="left">
          <div className="bg stage-bg"><Viewer canvas={canvas} shirtColor={shirt} version={version} /></div>

          <div className="pillsL">
            {layers.map((l, i) => (
                <button key={l.id} className={'pill' + (l.id === cur.id ? ' on' : '')} onClick={() => setSel(l.id)}>
                  {i + 1}. {l.text.split('\n')[0].slice(0, 8)}
                </button>
            ))}
          </div>

          <button className="capsule" onClick={add}>
            <span className="round white">＋</span><span>Ajouter un texte</span>
          </button>

          <div className="pillsR"><button className="pill" onClick={dup}>Dupliquer</button></div>

          {/* creux bas-gauche : couleurs */}
          <section className="colorsCard">
            <h3>COULEURS</h3>
            <div className="colorsIn">
              <label>Texte<input type="color" value={cur.color} onChange={e => set({ color: e.target.value })} /></label>
              <label>T-shirt<input type="color" value={shirt} onChange={e => setShirt(e.target.value)} /></label>
            </div>
            <span className="round black tag">●</span>
          </section>

          {/* verre dépoli */}
          <section className="glassWrap">
            <div className="bg glass-bg" />
            <div className="glassIn">
              <div>
                <div className="gTitle">AJUSTEMENTS</div>
                <div className="sliders">
                  <label>Taille<input type="range" min="30" max="130" value={cur.size} onChange={e => set({ size: +e.target.value })} /></label>
                  <label>Vague<input type="range" min="0" max="40" value={cur.wave} onChange={e => set({ wave: +e.target.value })} /></label>
                  <label>Position<input type="range" min="-350" max="350" value={cur.y} onChange={e => set({ y: +e.target.value })} /></label>
                </div>
              </div>
              <div className="sw">{COLORS.map(c => <span key={c} style={{ background: c }} onClick={() => setShirt(c)} />)}</div>
            </div>
          </section>
          <button className="round white big" onClick={nextShape} title="Changer de forme"><span className="ic">↻</span><span className="lb">Forme</span></button>
        </div>

        {/* ============ DROITE ============ */}
        <div className="right">
          <section className="frame">
            <div className="bg frame-bg" />
            <button className="round black notch" onClick={del} disabled={layers.length < 2} title="Supprimer ce calque">✕</button>
            <div className="frameIn">
              <h2>Texte</h2>
              <textarea value={cur.text} onChange={e => set({ text: e.target.value })} />
              <div className="blackCard">
                <span>Police</span>
                <select value={cur.font} onChange={e => set({ font: e.target.value })} style={{ fontFamily: cur.font }}>
                  {FONTS.map(f => <option key={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
                <div className="sample" style={{ fontFamily: cur.font }}>Aa Bb Cc 123</div>
              </div>
            </div>
          </section>

          <section className="bonus">
            <h3>FORME</h3>
            <div className="bonusIn">
              {SHAPES.map(([k, n]) => (
                  <button key={k} className={'pill sm' + (cur.shape === k ? ' on' : '')} onClick={() => set({ shape: k })}>{n}</button>
              ))}
            </div>
          </section>
        </div>
      </div>
  )
}