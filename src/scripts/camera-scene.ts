import * as THREE from 'three';

const ORANGE = 0xf09808;
const RUBBER = 0x16181c;

type Part = {
  group: THREE.Group;
  rest: THREE.Vector3;
  exploded: THREE.Vector3;
  explodedMobile: THREE.Vector3;
  delay: number;
};

type Surfaces = {
  aluminum: THREE.MeshPhysicalMaterial;
  dark: THREE.MeshPhysicalMaterial;
  cable: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  orange: THREE.MeshStandardMaterial;
  plastic: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  pcb: THREE.MeshStandardMaterial;
  textures: THREE.Texture[];
};

function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function smooth(t: number) {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

function lathe(pairs: number[][], segs: number) {
  return new THREE.LatheGeometry(
    pairs.map(([x, y]) => new THREE.Vector2(x, y)),
    segs,
  );
}

function roundedBox(w: number, h: number, d: number, r: number) {
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const shape = new THREE.Shape();
  shape.absarc(hw, hh, r, 0, Math.PI / 2);
  shape.absarc(-hw, hh, r, Math.PI / 2, Math.PI);
  shape.absarc(-hw, -hh, r, Math.PI, Math.PI * 1.5);
  shape.absarc(hw, -hh, r, Math.PI * 1.5, Math.PI * 2);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 8 });
  geo.translate(0, 0, -d / 2);
  return geo;
}

function makeCanvas(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  draw(ctx, size);
  return canvas;
}

function texFrom(canvas: HTMLCanvasElement, srgb: boolean, anisotropy: number) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = anisotropy;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function paintAnodized(ctx: CanvasRenderingContext2D, size: number, base: [number, number, number], spread: number) {
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let i = 0; i < size * size; i += 1) {
    const n = (Math.random() - 0.5) * spread;
    const p = i * 4;
    data[p] = base[0] + n;
    data[p + 1] = base[1] + n * 0.97;
    data[p + 2] = base[2] + n * 0.9;
    data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function paintSatin(ctx: CanvasRenderingContext2D, size: number, mid: number, spread: number) {
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let i = 0; i < size * size; i += 1) {
    const v = mid + (Math.random() - 0.5) * spread;
    const p = i * 4;
    data[p] = v;
    data[p + 1] = v;
    data[p + 2] = v;
    data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function paintCable(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#14171c';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 1) {
    const n = (Math.random() - 0.5) * 14;
    ctx.fillStyle = `rgb(${20 + n},${22 + n},${26 + n})`;
    ctx.fillRect(0, y, size, 1);
  }
  for (let y = 0; y < size; y += 7) {
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, y, size, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, y + 3, size, 1);
  }
  const stripe = 0.16;
  const y0 = size * 0.38;
  ctx.fillStyle = '#c87a08';
  ctx.fillRect(0, y0, size, size * stripe);
  ctx.fillStyle = '#f09808';
  ctx.fillRect(0, y0 + size * 0.04, size, size * 0.07);
  ctx.fillStyle = '#7a4a04';
  ctx.fillRect(0, y0, size, 2);
  ctx.fillRect(0, y0 + size * stripe - 2, size, 2);
  for (let x = 0; x < size; x += 18) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, 0, 2, size);
  }
}

function paintPcb(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#1a3d2a';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#d4b24a';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 28; i += 1) {
    const x = 20 + (i % 7) * 70;
    const y = 24 + Math.floor(i / 7) * 120;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 48, y);
    ctx.lineTo(x + 48, y + 36);
    ctx.lineTo(x + 90, y + 36);
    ctx.stroke();
    ctx.fillStyle = '#c9a44a';
    ctx.fillRect(x + 8, y + 8, 10, 10);
    ctx.fillRect(x + 70, y + 28, 8, 8);
    ctx.fillStyle = '#1a3d2a';
  }
  ctx.fillStyle = '#0d2418';
  for (let i = 0; i < 80; i += 1) {
    ctx.fillRect(12 + (i % 16) * 30, 14 + Math.floor(i / 16) * 96, 4, 4);
  }
}

function paintCableBump(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 6) {
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(0, y, size, 2);
    ctx.fillStyle = '#505050';
    ctx.fillRect(0, y + 3, size, 2);
  }
}

function studioEnv(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('env');
  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#e8eef4');
  sky.addColorStop(0.45, '#9aa7b4');
  sky.addColorStop(0.55, '#5a6672');
  sky.addColorStop(1, '#1a222a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.fillRect(90, 36, 260, 90);
  ctx.fillStyle = 'rgba(190,210,230,0.22)';
  ctx.fillRect(720, 70, 180, 140);
  const map = new THREE.CanvasTexture(canvas);
  map.mapping = THREE.EquirectangularReflectionMapping;
  map.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromEquirectangular(map);
  map.dispose();
  pmrem.dispose();
  return rt;
}

function createSurfaces(anisotropy: number): Surfaces {
  const aluMap = texFrom(makeCanvas(512, (ctx, size) => paintAnodized(ctx, size, [244, 245, 247], 7)), true, anisotropy);
  const aluRough = texFrom(makeCanvas(512, (ctx, size) => paintSatin(ctx, size, 118, 16)), false, anisotropy);
  const aluBump = texFrom(makeCanvas(256, (ctx, size) => paintSatin(ctx, size, 128, 18)), false, anisotropy);
  aluMap.repeat.set(6, 3);
  aluRough.repeat.copy(aluMap.repeat);
  aluBump.repeat.copy(aluMap.repeat);

  const darkMap = texFrom(makeCanvas(512, (ctx, size) => paintAnodized(ctx, size, [58, 64, 72], 8)), true, anisotropy);
  const darkRough = texFrom(makeCanvas(512, (ctx, size) => paintSatin(ctx, size, 102, 14)), false, anisotropy);
  darkMap.repeat.set(5, 3);
  darkRough.repeat.copy(darkMap.repeat);

  const cableMap = texFrom(makeCanvas(512, paintCable), true, anisotropy);
  const cableBump = texFrom(makeCanvas(256, paintCableBump), false, anisotropy);
  cableMap.repeat.set(5, 1);
  cableMap.offset.set(0, 0.22);
  cableBump.repeat.set(8, 3);

  const rubberMap = texFrom(
    makeCanvas(256, (ctx, size) => {
      ctx.fillStyle = '#1a1c1e';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 1200; i += 1) {
        const n = Math.random() * 30;
        ctx.fillStyle = `rgba(${n},${n},${n},0.35)`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
      }
    }),
    true,
    anisotropy,
  );

  const aluminum = new THREE.MeshPhysicalMaterial({
    map: aluMap,
    roughnessMap: aluRough,
    bumpMap: aluBump,
    bumpScale: 0.008,
    color: 0xffffff,
    metalness: 0.28,
    roughness: 0.4,
    envMapIntensity: 0.45,
  });

  const dark = new THREE.MeshPhysicalMaterial({
    map: darkMap,
    roughnessMap: darkRough,
    bumpMap: darkRough,
    bumpScale: 0.006,
    color: 0xffffff,
    metalness: 0.86,
    roughness: 0.48,
    envMapIntensity: 0.55,
  });

  const cable = new THREE.MeshStandardMaterial({
    map: cableMap,
    bumpMap: cableBump,
    bumpScale: 0.16,
    color: 0xffffff,
    metalness: 0.06,
    roughness: 0.78,
    envMapIntensity: 0.15,
  });

  const rubber = new THREE.MeshStandardMaterial({
    map: rubberMap,
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.92,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x070d14,
    metalness: 0.2,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.4,
  });

  const orange = new THREE.MeshStandardMaterial({
    color: ORANGE,
    metalness: 0.55,
    roughness: 0.38,
    emissive: ORANGE,
    emissiveIntensity: 0.12,
  });

  const plastic = new THREE.MeshStandardMaterial({
    color: 0x2a313a,
    metalness: 0.35,
    roughness: 0.48,
  });

  const gold = new THREE.MeshStandardMaterial({
    color: 0xd4b24a,
    metalness: 1,
    roughness: 0.22,
  });

  const pcbMap = texFrom(makeCanvas(512, paintPcb), true, anisotropy);
  pcbMap.repeat.set(1, 2);
  const pcb = new THREE.MeshStandardMaterial({
    map: pcbMap,
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0.5,
  });

  return {
    aluminum,
    dark,
    cable,
    rubber,
    glass,
    orange,
    plastic,
    gold,
    pcb,
    textures: [aluMap, aluRough, aluBump, darkMap, darkRough, cableMap, cableBump, rubberMap, pcbMap],
  };
}

function metalTube(
  outer: number,
  inner: number,
  length: number,
  segs: number,
  outerMat: THREE.Material,
  innerMat: THREE.Material,
) {
  const group = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(outer, outer, length, segs, 1, true), outerMat);
  const cavity = new THREE.Mesh(new THREE.CylinderGeometry(inner, inner, length, segs, 1, true), innerMat);
  const front = new THREE.Mesh(new THREE.RingGeometry(inner, outer, segs), outerMat);
  front.rotation.x = -Math.PI / 2;
  front.position.y = length / 2;
  const back = new THREE.Mesh(new THREE.RingGeometry(inner, outer, segs), outerMat);
  back.rotation.x = Math.PI / 2;
  back.position.y = -length / 2;
  group.add(wall, cavity, front, back);
  group.rotation.x = Math.PI / 2;
  return group;
}

function flushScrew(material: THREE.Material, radius = 0.018) {
  const group = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.012, 6), material);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.72, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), material);
  dish.position.y = 0.004;
  group.add(head, dish);
  return group;
}

function makeCable(surf: Surfaces, hi: boolean) {
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0.02),
    new THREE.Vector3(0.05, -0.1, -0.3),
    new THREE.Vector3(0.22, -0.32, -0.74),
    new THREE.Vector3(0.44, -0.58, -1.14),
    new THREE.Vector3(0.62, -0.9, -1.5),
  ]);
  const segs = hi ? 140 : 72;
  const radial = hi ? 20 : 14;
  const jacket = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.078, radial, false), surf.cable);
  group.add(jacket);

  const boot = new THREE.Mesh(
    lathe(
      [
        [0.05, 0],
        [0.09, 0.02],
        [0.105, 0.07],
        [0.1, 0.14],
        [0.078, 0.2],
      ],
      20,
    ),
    surf.rubber,
  );
  boot.rotation.x = Math.PI / 2;
  boot.position.z = 0.02;
  group.add(boot);

  const plug = new THREE.Mesh(roundedBox(0.2, 0.14, 0.28, 0.018), surf.plastic);
  plug.position.set(0, 0.01, 0.28);
  group.add(plug);

  const clip = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.07, 4, 8), surf.plastic);
  clip.rotation.x = Math.PI / 2;
  clip.position.set(0, 0.09, 0.3);
  group.add(clip);

  for (let i = 0; i < 8; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.028, 0.055), surf.gold);
    pin.position.set(-0.05 + (i % 4) * 0.033, i < 4 ? 0.028 : -0.008, 0.41);
    group.add(pin);
  }
  return group;
}

function makeVisor(segs: number, mat: THREE.Material) {
  const outer = 0.5;
  const inner = 0.405;
  const a0 = Math.PI * 0.16;
  const a1 = Math.PI * 0.84;
  const shape = new THREE.Shape();
  const steps = Math.max(18, Math.floor(segs / 2));
  for (let i = 0; i <= steps; i += 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const x = Math.cos(a) * outer;
    const y = Math.sin(a) * outer;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i -= 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    shape.lineTo(Math.cos(a) * inner, Math.sin(a) * inner);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.88,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.016,
    bevelSegments: 2,
  });
  geo.translate(0, 0.02, -0.18);
  return new THREE.Mesh(geo, mat);
}

function ic(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(roundedBox(w, h, d, 0.003), mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function makeMainBoard(surf: Surfaces) {
  const group = new THREE.Group();
  const smd = new THREE.MeshStandardMaterial({ color: 0xc8b48a, metalness: 0.3, roughness: 0.5 });
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, metalness: 0.1, roughness: 0.45 });
  const board = new THREE.Mesh(roundedBox(0.022, 0.28, 0.82, 0.006), surf.pcb);
  group.add(board);
  group.add(ic(0.045, 0.1, 0.12, surf.dark, 0.032, 0.03, 0.2));
  group.add(ic(0.038, 0.07, 0.07, surf.dark, 0.03, -0.07, 0.14));
  group.add(ic(0.032, 0.05, 0.09, surf.orange, 0.03, 0.08, -0.04));
  group.add(ic(0.03, 0.045, 0.045, surf.dark, 0.028, -0.06, -0.12));
  group.add(ic(0.028, 0.04, 0.06, surf.dark, 0.028, 0.08, 0.32));
  group.add(ic(0.025, 0.035, 0.05, ceramic, 0.026, -0.08, 0.32));
  const jack = new THREE.Mesh(roundedBox(0.055, 0.13, 0.15, 0.008), surf.plastic);
  jack.position.set(0.032, 0.01, -0.36);
  group.add(jack);
  const goldRow = surf.gold;
  for (let i = 0; i < 8; i += 1) {
    const contact = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.01, 0.04), goldRow);
    contact.position.set(0.055, -0.04 + i * 0.012, -0.36);
    group.add(contact);
  }
  const capMat = new THREE.MeshStandardMaterial({ color: 0xc45a22, metalness: 0.45, roughness: 0.38 });
  for (let i = 0; i < 10; i += 1) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.03, 10), capMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(0.03, -0.11 + (i % 5) * 0.045, 0.34 - Math.floor(i / 5) * 0.07);
    group.add(cap);
  }
  for (let i = 0; i < 18; i += 1) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.006, 0.014), i % 3 === 0 ? surf.dark : smd);
    r.position.set(0.018, -0.12 + (i % 6) * 0.04, -0.02 + Math.floor(i / 6) * 0.08);
    group.add(r);
  }
  for (let i = 0; i < 12; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.007, 0.028), surf.gold);
    pin.position.set(0.02, -0.12 + i * 0.02, 0.4);
    group.add(pin);
  }
  const can = new THREE.Mesh(roundedBox(0.022, 0.11, 0.13, 0.004), surf.aluminum);
  can.position.set(0.036, 0.02, -0.2);
  group.add(can);
  const xtal = new THREE.Mesh(roundedBox(0.018, 0.03, 0.05, 0.002), surf.aluminum);
  xtal.position.set(0.024, 0.1, 0.08);
  group.add(xtal);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.007, 6, 14), surf.dark);
  coil.rotation.y = Math.PI / 2;
  coil.position.set(0.03, -0.1, -0.26);
  group.add(coil);
  return group;
}

function makeSensor(surf: Surfaces) {
  const group = new THREE.Group();
  const carrier = new THREE.Mesh(roundedBox(0.032, 0.17, 0.17, 0.006), surf.pcb);
  group.add(carrier);
  const die = new THREE.Mesh(roundedBox(0.022, 0.095, 0.095, 0.004), surf.dark);
  die.position.x = 0.02;
  group.add(die);
  const window = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.062, 0.062), surf.glass);
  window.position.x = 0.032;
  group.add(window);
  const filter = new THREE.Mesh(
    new THREE.BoxGeometry(0.004, 0.07, 0.07),
    new THREE.MeshPhysicalMaterial({
      color: 0x6a2c8a,
      metalness: 0.1,
      roughness: 0.08,
      transparent: true,
      opacity: 0.45,
    }),
  );
  filter.position.x = 0.042;
  group.add(filter);
  for (let i = 0; i < 14; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.006, 0.016), surf.gold);
    pin.position.set(-0.014, i < 7 ? 0.065 : -0.065, -0.055 + (i % 7) * 0.018);
    group.add(pin);
  }
  group.add(ic(0.02, 0.03, 0.04, surf.dark, 0.02, -0.055, 0.05));
  return group;
}

function makeRibbon(_surf: Surfaces) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.18, roughness: 0.5 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 0.03, 0.3),
    new THREE.Vector3(0.14, 0.1, 0.16),
    new THREE.Vector3(0.18, 0.03, 0.02),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.016, 8, false), mat));
  for (let i = 0; i < 5; i += 1) {
    const stripe = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.003, 4, false),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 }),
    );
    stripe.position.y = -0.012 + i * 0.006;
    group.add(stripe);
  }
  return group;
}

function makeHarness(_surf: Surfaces) {
  const group = new THREE.Group();
  const colors = [0x1a1a1a, 0xf09808, 0x2a6bdc, 0xc62828, 0x2e7d32, 0xfafafa];
  for (let i = 0; i < 6; i += 1) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, -0.06 + i * 0.018, -0.26),
      new THREE.Vector3(0.12, -0.14 + i * 0.012, -0.4),
      new THREE.Vector3(0.04, -0.08 + i * 0.01, -0.56),
    ]);
    group.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, 0.007, 5, false),
        new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.68, metalness: 0.05 }),
      ),
    );
  }
  return group;
}

function buildCamera(hi: boolean, surf: Surfaces): { root: THREE.Group; parts: Part[] } {
  const root = new THREE.Group();
  const segs = hi ? 64 : 40;
  const { aluminum, dark, glass, rubber } = surf;
  const visorMat = aluminum.clone();
  visorMat.side = THREE.DoubleSide;
  const cavity = aluminum.clone();
  cavity.color.setHex(0xd8dbe0);
  cavity.roughness = 0.7;
  cavity.metalness = 0.12;
  cavity.envMapIntensity = 0.18;
  cavity.side = THREE.BackSide;
  const irMat = new THREE.MeshPhysicalMaterial({
    color: 0xf3f0e8,
    roughness: 0.14,
    metalness: 0.08,
    transparent: true,
    opacity: 0.92,
    emissive: 0xddd6c4,
    emissiveIntensity: 0.22,
  });

  const lens = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.355, 0.355, 0.055, segs), dark);
  face.rotation.x = Math.PI / 2;
  lens.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.358, 0.012, 8, segs), aluminum);
  rim.position.z = 0.03;
  lens.add(rim);

  const glassDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.04, segs), glass);
  glassDisk.rotation.x = Math.PI / 2;
  glassDisk.position.z = 0.03;
  lens.add(glassDisk);
  const glassCap = new THREE.Mesh(new THREE.SphereGeometry(0.155, segs, 12, 0, Math.PI * 2, 0, 0.45), glass);
  glassCap.rotation.x = Math.PI;
  glassCap.position.z = 0.04;
  lens.add(glassCap);
  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), dark);
  iris.position.z = 0.055;
  lens.add(iris);
  const accent = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.008, 8, segs), aluminum);
  accent.position.z = 0.032;
  lens.add(accent);

  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const ir = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.022, 16), irMat);
    ir.rotation.x = Math.PI / 2;
    ir.position.set(Math.cos(angle) * 0.255, Math.sin(angle) * 0.255, 0.03);
    lens.add(ir);
  }
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const screw = flushScrew(aluminum, 0.02);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0.032);
    lens.add(screw);
  }
  lens.position.z = 0.58;

  const glass2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.018, segs), glass);
  glass2.rotation.x = Math.PI / 2;
  glass2.position.z = -0.06;
  lens.add(glass2);
  const spacer = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, segs, 1, true), dark);
  spacer.rotation.x = Math.PI / 2;
  spacer.position.z = -0.03;
  lens.add(spacer);

  const shell = new THREE.Group();
  shell.add(makeVisor(segs, visorMat));
  shell.add(metalTube(0.4, 0.3, 1.08, segs, aluminum, cavity));
  const gasket = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.016, 10, segs), rubber);
  gasket.position.z = 0.5;
  shell.add(gasket);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 20), aluminum);
  button.position.set(0, 0.41, -0.08);
  shell.add(button);

  const sensor = makeSensor(surf);
  sensor.position.set(0.02, 0, 0.34);
  const mainPcb = makeMainBoard(surf);
  mainPcb.position.set(0.02, 0, -0.02);
  const ribbon = makeRibbon(surf);
  const harness = makeHarness(surf);

  const rear = new THREE.Group();
  const cap = metalTube(0.39, 0.3, 0.18, segs, aluminum, cavity);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.3, segs), aluminum);
  lid.rotation.x = Math.PI / 2;
  lid.position.y = -0.09;
  cap.add(lid);
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.39, segs, 16, 0, Math.PI * 2, 0, Math.PI / 2), aluminum);
  tail.rotation.x = Math.PI / 2;
  tail.position.z = -0.08;
  rear.add(cap, tail);
  const gland = new THREE.Mesh(
    lathe(
      [
        [0.06, 0],
        [0.11, 0.02],
        [0.12, 0.08],
        [0.1, 0.12],
      ],
      16,
    ),
    dark,
  );
  gland.rotation.x = -Math.PI / 2;
  gland.position.z = -0.2;
  rear.add(gland);
  const port = new THREE.Mesh(roundedBox(0.16, 0.11, 0.05, 0.016), surf.plastic);
  port.position.z = -0.18;
  rear.add(port);
  rear.position.z = -0.62;

  const cable = makeCable(surf, hi);
  cable.position.set(0, -0.05, -0.85);
  cable.rotation.y = 0.12;

  const mount = new THREE.Group();
  const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 20), aluminum);
  socket.position.set(0, -0.32, -0.05);
  mount.add(socket);
  const down = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.22, 20), aluminum);
  down.position.set(0, -0.46, -0.05);
  mount.add(down);
  const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 16), aluminum);
  elbow.position.set(0, -0.58, -0.05);
  mount.add(elbow);
  const horiz = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.58, 20), aluminum);
  horiz.rotation.x = Math.PI / 2;
  horiz.position.set(0, -0.58, -0.36);
  mount.add(horiz);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.045, segs), aluminum);
  plate.rotation.x = Math.PI / 2;
  plate.position.set(0, -0.58, -0.66);
  mount.add(plate);
  for (const [x, y] of [
    [-0.15, -0.15],
    [0.15, -0.15],
    [-0.15, 0.15],
    [0.15, 0.15],
  ]) {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 12), dark);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(x, -0.58 + y, -0.66);
    mount.add(hole);
  }

  root.add(lens, shell, sensor, mainPcb, ribbon, harness, rear, cable, mount);

  return {
    root,
    parts: [
      {
        group: lens,
        rest: lens.position.clone(),
        exploded: new THREE.Vector3(0, 0.16, 1.55),
        explodedMobile: new THREE.Vector3(0, 0.12, 1.02),
        delay: 0,
      },
      {
        group: shell,
        rest: shell.position.clone(),
        exploded: new THREE.Vector3(0, 1.05, 0.1),
        explodedMobile: new THREE.Vector3(0, 0.72, 0.06),
        delay: 0.05,
      },
      {
        group: sensor,
        rest: sensor.position.clone(),
        exploded: new THREE.Vector3(0.08, 0.18, 0.72),
        explodedMobile: new THREE.Vector3(0.06, 0.12, 0.5),
        delay: 0.1,
      },
      {
        group: mainPcb,
        rest: mainPcb.position.clone(),
        exploded: new THREE.Vector3(0.42, 0.12, 0.02),
        explodedMobile: new THREE.Vector3(0.28, 0.1, 0),
        delay: 0.14,
      },
      {
        group: ribbon,
        rest: ribbon.position.clone(),
        exploded: new THREE.Vector3(0.28, 0.28, 0.12),
        explodedMobile: new THREE.Vector3(0.16, 0.18, 0.08),
        delay: 0.12,
      },
      {
        group: harness,
        rest: harness.position.clone(),
        exploded: new THREE.Vector3(0.18, -0.18, -0.12),
        explodedMobile: new THREE.Vector3(0.1, -0.1, -0.08),
        delay: 0.18,
      },
      {
        group: rear,
        rest: rear.position.clone(),
        exploded: new THREE.Vector3(0, -0.08, -1.22),
        explodedMobile: new THREE.Vector3(0, -0.05, -0.82),
        delay: 0.2,
      },
      {
        group: cable,
        rest: cable.position.clone(),
        exploded: new THREE.Vector3(0.18, -0.48, -1.85),
        explodedMobile: new THREE.Vector3(0.1, -0.28, -1.18),
        delay: 0.24,
      },
      {
        group: mount,
        rest: mount.position.clone(),
        exploded: new THREE.Vector3(0, -1.12, -0.3),
        explodedMobile: new THREE.Vector3(0, -0.72, -0.18),
        delay: 0.08,
      },
    ],
  };
}

export function initCameraScene(canvas: HTMLCanvasElement, section: HTMLElement): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hi = !isMobile();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, hi ? 1.75 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;

  const envRT = studioEnv(renderer);
  const scene = new THREE.Scene();
  scene.environment = envRT.texture;

  const camera = new THREE.PerspectiveCamera(hi ? 31 : 34, 1, 0.1, 40);
  const camRest = hi ? new THREE.Vector3(2.55, 1.05, 3.05) : new THREE.Vector3(3.55, 0.92, 2.55);
  const camExploded = hi ? new THREE.Vector3(3.55, 1.7, 4.85) : new THREE.Vector3(4.15, 1.35, 3.75);
  const yaw0 = hi ? 0.1 : 0.42;
  camera.position.copy(camRest);
  camera.lookAt(0, hi ? -0.12 : -0.02, 0);

  scene.add(new THREE.AmbientLight(0x9aabbb, 0.28));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3.4, 3.6, 3.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9eb6d6, 0.4);
  rim.position.set(-3.2, 1.4, -1.8);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(hi ? 2.2 : 1.5, 48),
    new THREE.MeshStandardMaterial({
      color: 0x081828,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.38,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.08;
  scene.add(floor);

  const surf = createSurfaces(Math.min(8, renderer.capabilities.getMaxAnisotropy()));
  const { root, parts } = buildCamera(hi, surf);
  root.position.y = hi ? 0.1 : 0.02;
  root.rotation.y = yaw0;
  scene.add(root);

  const caption = section.querySelector('[data-explode-caption]') as HTMLElement | null;
  const captions = [
    { at: 0, text: 'Hardware de verdad, con cable de verdad. Baja para ver cómo está hecha.' },
    { at: 0.12, text: 'Baja: se abre la carcasa' },
    { at: 0.32, text: 'Lente, sensor CMOS y filtro IR.' },
    { at: 0.52, text: 'La placa: chips, condensadores y el conector de red.' },
    { at: 0.72, text: 'Un cable de red alimenta todo. Por eso no se cae.' },
  ];

  const readProgress = () => {
    const max = section.offsetHeight - window.innerHeight;
    if (max <= 1) return 0;
    return THREE.MathUtils.clamp(-section.getBoundingClientRect().top / max, 0, 1);
  };

  const resize = () => {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let frame = 0;
  let running = true;
  let progress = reduced ? 1 : 0;

  const apply = (p: number) => {
    const mobile = isMobile();
    for (const part of parts) {
      const local = smooth((p - part.delay) / (1 - part.delay));
      part.group.position.lerpVectors(part.rest, mobile ? part.explodedMobile : part.exploded, local);
    }
    camera.position.lerpVectors(camRest, camExploded, p);
    camera.lookAt(0.08 * p, mobile ? 0.04 : 0.08 * p, 0);
    if (caption) {
      const next = [...captions].reverse().find((item) => p >= item.at);
      const text = next?.text ?? captions[0].text;
      if (caption.textContent !== text) caption.textContent = text;
    }
  };

  const tick = () => {
    frame = requestAnimationFrame(tick);
    if (!running) return;
    const target = reduced ? 1 : readProgress();
    progress += (target - progress) * 0.085;
    apply(progress);
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);

  const io = new IntersectionObserver(
    ([entry]) => {
      running = Boolean(entry?.isIntersecting);
    },
    { threshold: 0.02 },
  );
  io.observe(section);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    io.disconnect();
    ro.disconnect();
    surf.textures.forEach((texture) => texture.dispose());
    envRT.dispose();
    renderer.dispose();
  };
}
