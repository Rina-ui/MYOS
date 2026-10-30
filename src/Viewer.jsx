import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Aperçu 3D : t-shirt extrudé + "decal" (plan courbe) portant la texture canvas
export default function Viewer({ canvas, shirtColor, version }) {
  const mount = useRef(), api = useRef({})

  useEffect(() => {
    const el = mount.current
    const R = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    R.outputColorSpace = THREE.SRGBColorSpace
    R.setPixelRatio(Math.min(devicePixelRatio, 2))
    el.appendChild(R.domElement)
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, .1, 100)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x887766, 2.2))
    const dl = new THREE.DirectionalLight(0xffffff, 2); dl.position.set(3, 5, 8); scene.add(dl)

    const p = new THREE.Shape()
    p.moveTo(-.65, 2.25); p.lineTo(-1.6, 2.05); p.lineTo(-2.95, 1.15); p.lineTo(-2.4, .3); p.lineTo(-1.65, .75)
    p.lineTo(-1.65, -2.3); p.lineTo(1.65, -2.3); p.lineTo(1.65, .75); p.lineTo(2.4, .3); p.lineTo(2.95, 1.15)
    p.lineTo(1.6, 2.05); p.lineTo(.65, 2.25); p.quadraticCurveTo(0, 1.45, -.65, 2.25)
    const g = new THREE.ExtrudeGeometry(p, { depth: .3, bevelEnabled: true, bevelThickness: .12, bevelSize: .12, bevelSegments: 5, curveSegments: 16 })
    g.translate(0, 0, -.15)
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: .9 })

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8
    const dg = new THREE.PlaneGeometry(3, 3, 24, 24), pos = dg.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.cos(pos.getX(i) / 1.6 * Math.PI / 2) * .07)
    dg.computeVertexNormals()
    const decal = new THREE.Mesh(dg, new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .8, depthWrite: false }))
    decal.position.set(0, .1, .3)

    const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, shirtMat), decal); grp.scale.setScalar(.78); grp.position.y = .7; scene.add(grp)
    api.current = { shirtMat, tex }

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1
      R.setSize(w, h, false); cam.aspect = w / h
      cam.position.set(0, 0, Math.max(10.5, 7.6 / (0.63 * cam.aspect))); cam.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize); ro.observe(el); resize()

    let drag = false, lx = 0, ry = 0, idle = true, raf
    const down = e => { drag = true; idle = false; lx = e.clientX }
    const move = e => { if (drag) { ry += (e.clientX - lx) * .01; lx = e.clientX } }
    const up = () => (drag = false)
    R.domElement.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up)
    const loop = () => { raf = requestAnimationFrame(loop); if (idle) ry += .004; grp.rotation.set(.05, ry, 0); R.render(scene, cam) }
    loop()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointermove', move); removeEventListener('pointerup', up); R.dispose(); el.innerHTML = '' }
  }, [canvas])

  useEffect(() => { api.current.shirtMat?.color.set(shirtColor) }, [shirtColor])
  useEffect(() => { if (api.current.tex) api.current.tex.needsUpdate = true }, [version])

  return <div ref={mount} className="viewer"><div className="hint">Glissez pour faire tourner le t-shirt</div></div>
}