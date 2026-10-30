import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Viewer({ canvas, shirtColor, version }) {
  const mount = useRef(), api = useRef({})

  useEffect(() => {
    const el = mount.current
    const R = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    R.outputColorSpace = THREE.SRGBColorSpace
    R.setPixelRatio(Math.min(devicePixelRatio, 2))
    el.appendChild(R.domElement)

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100)

    // Éclairage studio soigné
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.0))
    const dl = new THREE.DirectionalLight(0xffffff, 2.5)
    dl.position.set(4, 6, 6)
    scene.add(dl)
    const dl2 = new THREE.DirectionalLight(0x99bbff, 1.0)
    dl2.position.set(-4, -2, -4)
    scene.add(dl2)

    // Forme réaliste du t-shirt extrudé
    const p = new THREE.Shape()
    p.moveTo(-0.7, 2.3)
    p.lineTo(-1.7, 2.1)
    p.lineTo(-3.1, 1.2)
    p.lineTo(-2.5, 0.3)
    p.lineTo(-1.75, 0.8)
    p.lineTo(-1.75, -2.4)
    p.lineTo(1.75, -2.4)
    p.lineTo(1.75, 0.8)
    p.lineTo(2.5, 0.3)
    p.lineTo(3.1, 1.2)
    p.lineTo(1.7, 2.1)
    p.lineTo(0.7, 2.3)
    p.quadraticCurveTo(0, 1.5, -0.7, 2.3)

    const g = new THREE.ExtrudeGeometry(p, {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.14,
      bevelSegments: 6,
      curveSegments: 24,
    })
    g.translate(0, 0, -0.175)

    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.85,
      metalness: 0.05,
    })

    // Décalque pour le design textuel
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 16

    const dg = new THREE.PlaneGeometry(3.2, 3.2, 32, 32)
    const pos = dg.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      pos.setZ(i, Math.cos((x / 1.6) * (Math.PI / 2)) * 0.08)
    }
    dg.computeVertexNormals()

    const decalMat = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      roughness: 0.7,
      depthWrite: false,
    })
    const decal = new THREE.Mesh(dg, decalMat)
    decal.position.set(0, 0.1, 0.32)

    const grp = new THREE.Group()
    grp.add(new THREE.Mesh(g, shirtMat), decal)
    grp.scale.setScalar(1.02)
    scene.add(grp)

    api.current = { shirtMat, tex }

    const resize = () => {
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      R.setSize(w, h)
      cam.aspect = w / h
      cam.position.set(0, 0, cam.aspect < 1 ? 14 : 10)
      cam.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let drag = false, lx = 0, ry = 0, idle = true, raf
    const down = (e) => { drag = true; idle = false; lx = e.clientX }
    const move = (e) => {
      if (drag) {
        ry += (e.clientX - lx) * 0.01
        lx = e.clientX
      }
    }
    const up = () => (drag = false)

    const domEl = R.domElement
    domEl.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (idle) ry += 0.003
      grp.rotation.set(0.05, ry, 0)
      R.render(scene, cam)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      domEl.removeEventListener('pointerdown', down)
      R.dispose()
      if (el) el.innerHTML = ''
    }
  }, [canvas])

  useEffect(() => {
    if (api.current.shirtMat) api.current.shirtMat.color.set(shirtColor)
  }, [shirtColor])

  useEffect(() => {
    if (api.current.tex) api.current.tex.needsUpdate = true
  }, [version])

  return (
      <div ref={mount} className="viewer-container">
        <div className="viewer-hint">Glissez pour pivoter le t-shirt 3D</div>
      </div>
  )
}