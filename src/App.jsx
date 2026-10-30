import { useEffect, useMemo, useState } from 'react'
import Viewer from './Viewer.jsx'
import { renderAll, S, FONTS, SHAPES } from './render.js'

const COLORS = ['#111111', '#2f4a3a', '#1f3558', '#5a1f2b', '#4a2c1a', '#e5e5e5', '#d4a95a']
let nextId = 3
const newLayer = (o = {}) => ({
  id: nextId++,
  text: 'NOUVEAU',
  font: 'Anton',
  shape: 'droit',
  size: 60,
  wave: 0,
  y: 0,
  color: '#d4a95a',
  ...o,
})

export default function App() {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = S
    return c
  }, [])

  const [shirt, setShirt] = useState('#111111')
  const [layers, setLayers] = useState([
    { id: 1, text: "IT'S A GOOD DAY TO...", font: 'Pacifico', shape: 'haut', size: 55, wave: 0, y: -250, color: '#d4a95a' },
    { id: 2, text: 'KEEP\nGOD\nFIRST', font: 'Bangers', shape: 'bloc', size: 90, wave: 0, y: 60, color: '#d4a95a' },
  ])
  const [sel, setSel] = useState(2)
  const [version, setVersion] = useState(0)
  const cur = layers.find((l) => l.id === sel) || layers[0]

  useEffect(() => {
    let dead = false
    Promise.all(layers.map((l) => document.fonts.load(`80px "${l.font}"`)))
        .catch(() => {})
        .then(() => {
          if (dead) return
          renderAll(canvas.getContext('2d'), layers)
          setVersion((v) => v + 1)
        })
    return () => {
      dead = true
    }
  }, [layers, canvas])

  const set = (patch) => setLayers((ls) => ls.map((l) => (l.id === cur.id ? { ...l, ...patch } : l)))
  const add = () => {
    const l = newLayer()
    setLayers((ls) => [...ls, l])
    setSel(l.id)
  }
  const del = () => {
    if (layers.length < 2) return
    const r = layers.filter((l) => l.id !== cur.id)
    setLayers(r)
    setSel(r[0].id)
  }

  return (
      <div className="bento-layout">
        {/* Barre latérale gauche (style bento minimaliste) */}
        <aside className="bento-sidebar">
          <div className="brand-logo">✦</div>
          <div className="nav-icons">
            <button className="icon-btn active">👕</button>
            <button className="icon-btn">✨</button>
            <button className="icon-btn">📦</button>
            <button className="icon-btn">⚙️</button>
          </div>
          <div className="user-avatar">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
          </div>
        </aside>

        {/* Contenu Central / Panneau de Contrôle & Aperçu 3D */}
        <main className="bento-main-grid">
          {/* En-tête / Filtres de catégories façon bento */}
          <header className="bento-header">
            <div className="pill-nav">
              <button className="pill active">Studio 3D</button>
              <button className="pill">Collections</button>
              <button className="pill">Matériaux</button>
            </div>
            <div className="search-pill">
              <span>🔍 Edition T-Shirt Premium</span>
            </div>
          </header>

          {/* Section centrale : Éditeur & Aperçu 3D */}
          <section className="bento-content-area">
            {/* Panneau de configuration des calques et textes */}
            <div className="bento-card control-panel">
              <h2>Personnalisation</h2>

              <div className="layer-tabs-container">
                <label>Calques de texte</label>
                <div className="tabs">
                  {layers.map((l, i) => (
                      <button key={l.id} className={l.id === cur.id ? 'on' : ''} onClick={() => setSel(l.id)}>
                        {i + 1}. {l.text.split('\n')[0].slice(0, 8)}
                      </button>
                  ))}
                  <button onClick={add} className="add-btn">＋</button>
                </div>
              </div>

              <div className="input-group">
                <label>Texte</label>
                <textarea value={cur.text} onChange={(e) => set({ text: e.target.value })} rows={2} />
              </div>

              <div className="row-group">
                <div className="input-group">
                  <label>Police</label>
                  <select value={cur.font} onChange={(e) => set({ font: e.target.value })}>
                    {FONTS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Couleur texte</label>
                  <input type="color" value={cur.color} onChange={(e) => set({ color: e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label>Forme</label>
                <div className="shapes">
                  {SHAPES.map(([k, n]) => (
                      <button key={k} className={cur.shape === k ? 'on' : ''} onClick={() => set({ shape: k })}>
                        {n}
                      </button>
                  ))}
                </div>
              </div>

              <div className="sliders-grid">
                <div>
                  <label>Taille ({cur.size}px)</label>
                  <input type="range" min="30" max="130" value={cur.size} onChange={(e) => set({ size: +e.target.value })} />
                </div>
                <div>
                  <label>Vague ({cur.wave})</label>
                  <input type="range" min="0" max="40" value={cur.wave} onChange={(e) => set({ wave: +e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label>Position verticale ({cur.y})</label>
                <input type="range" min="-350" max="350" value={cur.y} onChange={(e) => set({ y: +e.target.value })} />
              </div>

              <div className="input-group">
                <label>Couleur du T-shirt</label>
                <div className="swatches">
                  {COLORS.map((c) => (
                      <span key={c} style={{ background: c }} className={shirt === c ? 'active-swatch' : ''} onClick={() => setShirt(c)} />
                  ))}
                  <input type="color" value={shirt} onChange={(e) => setShirt(e.target.value)} className="color-picker-input" />
                </div>
              </div>

              <button className="del-btn" onClick={del} disabled={layers.length < 2}>
                Supprimer ce calque
              </button>
            </div>

            {/* Visionneuse 3D principale (style Bento) */}
            <div className="bento-card viewer-card">
              <Viewer canvas={canvas} shirtColor={shirt} version={version} />
            </div>
          </section>
        </main>

        {/* Panneau de droite : Statistiques / Stats en verre (Bento) */}
        <aside className="bento-right-sidebar">
          <div className="bento-card stat-card">
            <div className="stat-header">
              <span>📈 Ventes & Croissance</span>
            </div>
            <div className="stat-number">12,480</div>
            <p className="stat-desc">Commandes globales du design</p>
            <div className="mini-chart">
              <div className="bar" style={{ height: '40%' }}></div>
              <div className="bar" style={{ height: '65%' }}></div>
              <div className="bar" style={{ height: '50%' }}></div>
              <div className="bar" style={{ height: '90%' }}></div>
              <div className="bar" style={{ height: '75%' }}></div>
            </div>
          </div>

          <div className="bento-card promo-card">
            <h3>Édition Limitée</h3>
            <p>Matériel 100% Coton Bio certifié éco-responsable.</p>
            <button className="cta-btn">Commander le modèle</button>
          </div>
        </aside>
      </div>
  )
}