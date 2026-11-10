// Interactive 3D Zeebo (rigged GLB, 29 bones, no baked clips). Everything is
// procedural: every bone gets an offset rotation on top of its rest pose.
//
// Offsets are written in Zeebo's *body frame* (x = nod / pitch, y = turn / yaw,
// z = tilt / roll, radians) and converted to each bone's own axes, so poses
// read the same for every bone whatever its rest orientation.
//
// Bones: root · hips · spine · chest · neck · head
//        upperarm_L/R · forearm_L/R · hand_L/R
//        ear_L_01..03 · ear_R_01..03 · tail_01..02 · foot_L/R
//        eye_L/R · brow_L/R · mouth · cheek_L/R
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export interface PoseOffsets {
  /** body-frame rotation [x, y, z] in radians, added to the bone's rest pose */
  [bone: string]: [number, number, number];
}

/** Static poses: used for the pre-rendered stills and as the base of the live animation. */
export const POSES: Record<string, { offsets: PoseOffsets; yaw: number }> = {
  wave: { yaw: -0.35, offsets: {} },
  hello: { yaw: 0.35, offsets: { neck: [0.02, 0.1, 0.04], head: [0.04, 0.15, 0.08] } },
  cheer: {
    yaw: -0.2,
    offsets: { head: [-0.12, 0, 0], upperarm_L: [0, 0, -1.25], forearm_L: [0, 0, -0.6], upperarm_R: [0, 0, 0.15], forearm_R: [0, 0, -0.2] },
  },
  point: {
    yaw: 0.5,
    offsets: {
      neck: [0.05, 0.08, -0.08],
      head: [0.08, 0.12, -0.14],
      ear_L_01: [0, 0, 0.2],
      ear_R_01: [0, 0, 0.3],
      upperarm_R: [0, 0, -0.9],
      forearm_R: [0, 0, -0.35],
    },
  },
  // hand on the cheek
  think: {
    yaw: 0.3,
    offsets: { neck: [0.03, 0.06, -0.1], head: [0.05, 0.09, -0.15], upperarm_R: [0, 0, -0.3], forearm_R: [0, 0, 1.6] },
  },
  // looking down at a laptop (the still adds a laptop prop in front)
  laptop: {
    yaw: 0.2,
    offsets: {
      neck: [0.1, 0, 0],
      head: [0.14, 0, 0],
      upperarm_R: [0, 0, -1.9],
      forearm_R: [-1, 0, 0],
      upperarm_L: [0, 0, 0.35],
      forearm_L: [-1, 0, 0],
    },
  },
  peek: { yaw: -0.6, offsets: { neck: [0.02, -0.14, 0.1], head: [0.03, -0.21, 0.15], ear_R_01: [0, 0, -0.3] } },
};

export interface ZeeboOptions {
  src: string;
  pose?: keyof typeof POSES;
  /** override the pose's body yaw (radians) */
  yaw?: number;
  /** follow the pointer + idle animation */
  interactive?: boolean;
  /** render with a soft contact shadow */
  shadow?: boolean;
  onReady?: () => void;
}

const BONES = [
  "root", "hips", "spine", "chest", "neck", "head",
  "upperarm_L", "forearm_L", "hand_L", "upperarm_R", "forearm_R", "hand_R",
  "ear_L_01", "ear_L_02", "ear_L_03", "ear_R_01", "ear_R_02", "ear_R_03",
  "tail_01", "tail_02", "foot_L", "foot_R",
  "eye_L", "eye_R", "brow_L", "brow_R", "mouth", "cheek_L", "cheek_R",
] as const;
type Bone = (typeof BONES)[number];

export function mountZeebo(container: HTMLElement, opts: ZeeboOptions) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const interactive = (opts.interactive ?? true) && !reduced;
  const pose = POSES[opts.pose ?? "wave"];
  const yaw = opts.yaw ?? pose.yaw;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !interactive });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = opts.shadow ?? true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);

  // warm studio light, matching the clay look of the site
  scene.add(new THREE.HemisphereLight(0xfff1e0, 0xe8b9a0, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(1.2, 5, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 16;
  key.shadow.camera.left = key.shadow.camera.bottom = -2;
  key.shadow.camera.right = key.shadow.camera.top = 2;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc6a8, 1.4);
  rim.position.set(-3, 2, -2);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── rig ───────────────────────────────────────────────────
  const bones = new Map<Bone, THREE.Object3D>();
  const restQ = new Map<Bone, THREE.Quaternion>();
  const restP = new Map<Bone, THREE.Vector3>();
  const restS = new Map<Bone, THREE.Vector3>();
  const parentQ = new Map<Bone, THREE.Quaternion>(); // parent's rest orientation in the model frame
  const parentQi = new Map<Bone, THREE.Quaternion>();
  let model: THREE.Object3D | null = null;

  const tmpE = new THREE.Euler(0, 0, 0, "YXZ");
  const tmpQ = new THREE.Quaternion();
  /** rotate a bone by a body-frame offset (radians) on top of its rest pose */
  const rot = (name: Bone, x: number, y: number, z: number) => {
    const b = bones.get(name);
    if (!b) return;
    tmpQ.setFromEuler(tmpE.set(x, y, z));
    // parent⁻¹ · offset · parent · rest  →  the offset happens around body axes
    b.quaternion.copy(parentQi.get(name)!).multiply(tmpQ).multiply(parentQ.get(name)!).multiply(restQ.get(name)!);
  };
  const scaleBone = (name: Bone, sx: number, sy: number, sz: number) => {
    const b = bones.get(name);
    const s = restS.get(name);
    if (b && s) b.scale.set(s.x * sx, s.y * sy, s.z * sz);
  };
  const lift = (name: Bone, dy: number) => {
    const b = bones.get(name);
    const p = restP.get(name);
    if (b && p) b.position.set(p.x, p.y + dy, p.z);
  };

  // ── live state ────────────────────────────────────────────
  const pointer = new THREE.Vector2();
  const look = new THREE.Vector2();
  const earLag = new THREE.Vector2(); // ears trail the head: a slower copy of `look`
  let hop = 0; // 0 = idle, 0..1 = jumping
  let happy = 0; // eases to 1 while the pointer is over Zeebo
  let happyTarget = 0;
  let nextBlink = 2;
  let blinkStart = -1;
  let running = true;
  let visible = true;
  const timer = new THREE.Timer();

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const applyPose = (t: number) => {
    const o = pose.offsets;
    const g = (b: Bone): [number, number, number] => o[b] ?? [0, 0, 0];
    const on = interactive ? 1 : 0;
    const s = Math.sin;

    // jump: height curve + squash & stretch (0 at rest)
    const jumpH = hop > 0 ? Math.max(0, s(hop * Math.PI)) : 0;
    const jumpV = hop > 0 ? Math.cos(hop * Math.PI) : 0; // +1 rising … −1 falling
    const squash = hop > 0 ? (hop < 0.12 ? -s((hop / 0.12) * Math.PI) * 0.12 : hop > 0.88 ? -s(((hop - 0.88) / 0.12) * Math.PI) * 0.1 : jumpV * 0.06) : 0;

    // body: breathing bob, jump, squash & stretch
    lift("hips", on * s(t * 2.2) * 0.012 + jumpH * 0.28);
    scaleBone("hips", 1 - squash * 0.6, 1 + squash, 1 - squash * 0.6);
    rot("spine", ...add(g("spine"), on * s(t * 2.2) * 0.015, 0, on * s(t * 1.1) * 0.02));
    rot("chest", ...add(g("chest"), on * s(t * 2.2 + 0.4) * 0.02, look.x * 0.06, on * s(t * 1.1 + 0.3) * 0.02));

    // head follows the pointer (neck takes 40 %, head 60 %)
    const nod = on * s(t * 1.3) * 0.03;
    rot("neck", ...add(g("neck"), look.y * 0.08, look.x * 0.12, -look.x * 0.04));
    rot("head", ...add(g("head"), look.y * 0.14 + nod + jumpV * 0.06, look.x * 0.2, -look.x * 0.07 + on * s(t * 0.9) * 0.04));

    // ears: three segments each, a travelling wave + lag behind the head + drag while jumping
    // (kept small and clamped: outer and inner ear are separate meshes with
    // different weights, so a big bend on the outer segments splits them)
    const swingX = clamp((look.x - earLag.x) * 0.7, -0.25, 0.25);
    const swingY = clamp((look.y - earLag.y) * 0.4, -0.15, 0.15);
    const perk = happy * 0.12; // happy: ears stand up a little
    for (const [side, m] of [["L", 1], ["R", -1]] as const) {
      for (let i = 1; i <= 3; i++) {
        const seg = `ear_${side}_0${i}` as Bone;
        const k = 0.4 + i * 0.2; // the tips move most (the base segment carries most of the skin weight)
        const wave = on * s(t * 2.3 - i * 0.7 + (m > 0 ? 0 : 1.1)) * 0.07 * k;
        const flop = jumpV * 0.22 * k; // rising: ears drag down; falling: they lift
        const [bx, by, bz] = i === 1 ? g(seg) : [0, 0, 0];
        const lim = i === 1 ? 0.6 : 0.22;
        const x = clamp(swingY * k + on * s(t * 1.7 + i) * 0.03 * k, -lim, lim);
        const z = clamp(m * (wave + flop - perk * k) - swingX * 0.5 * k, -lim, lim);
        rot(seg, bx + x, by, bz + z);
      }
    }

    // right arm waves from the elbow, left arm sways
    const w = t * 5;
    rot("upperarm_R", ...add(g("upperarm_R"), 0, 0, on * s(w) * 0.12));
    rot("forearm_R", ...add(g("forearm_R"), 0, 0, on * s(w - 0.6) * 0.42));
    rot("hand_R", ...add(g("hand_R"), 0, 0, on * s(w - 1.2) * 0.35));
    rot("upperarm_L", ...add(g("upperarm_L"), 0, 0, on * (s(t * 2.2) * 0.05 - jumpV * 0.25)));
    rot("forearm_L", ...add(g("forearm_L"), 0, 0, on * s(t * 2.2 - 0.5) * 0.08));
    rot("hand_L", ...g("hand_L"));

    // tail wags, faster when happy
    const tw = t * (4 + happy * 4);
    rot("tail_01", ...add(g("tail_01"), 0, on * s(tw) * 0.25, 0));
    rot("tail_02", ...add(g("tail_02"), 0, on * s(tw - 0.8) * 0.4, 0));

    // feet tuck in mid-air
    rot("foot_L", ...add(g("foot_L"), -jumpH * 0.35, 0, 0));
    rot("foot_R", ...add(g("foot_R"), -jumpH * 0.35, 0, 0));

    // face: blink, brows, mouth, blush
    let blink = 0;
    if (on && blinkStart >= 0) {
      const p = (t - blinkStart) / 0.16;
      blink = p >= 0 && p <= 1 ? s(p * Math.PI) : 0;
    }
    scaleBone("eye_L", 1, 1 - blink * 0.75, 1);
    scaleBone("eye_R", 1, 1 - blink * 0.75, 1);
    const browUp = (happy * 0.025 + jumpH * 0.03) * on;
    lift("brow_L", browUp);
    lift("brow_R", browUp);
    const open = 1 + (happy * 0.15 + jumpH * 0.25) * on;
    scaleBone("mouth", 1 + (open - 1) * 0.4, open, 1);
    const blush = 1 + happy * 0.18 * on;
    scaleBone("cheek_L", blush, blush, blush);
    scaleBone("cheek_R", blush, blush, blush);

    if (model) model.rotation.y = yaw + look.x * 0.15 + (hop > 0 ? easeInOut(hop) * Math.PI * 2 : 0);
  };

  const frame = () => {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!visible) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();
    look.lerp(pointer, 1 - Math.pow(0.002, dt));
    earLag.lerp(look, 1 - Math.pow(0.02, dt));
    happy += (happyTarget - happy) * (1 - Math.pow(0.01, dt));
    if (hop > 0) hop = hop >= 1 ? 0 : Math.min(1, hop + dt * 1.25);
    if (t > nextBlink) {
      blinkStart = t;
      nextBlink = t + 2.5 + Math.random() * 3 + (Math.random() < 0.2 ? -2.2 : 0); // sometimes a double blink
    }
    applyPose(t);
    renderer.render(scene, camera);
  };

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(opts.src, (gltf) => {
    model = gltf.scene;
    model.traverse((o) => {
      if ((BONES as readonly string[]).includes(o.name)) bones.set(o.name as Bone, o);
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.frustumCulled = false; // skinned: the bind-pose bounds do not follow the bones
      }
    });
    // rest pose + each bone's parent frame, measured before anything moves
    model.updateMatrixWorld(true);
    const modelQi = model.getWorldQuaternion(new THREE.Quaternion()).invert();
    for (const [name, b] of bones) {
      restQ.set(name, b.quaternion.clone());
      restP.set(name, b.position.clone());
      restS.set(name, b.scale.clone());
      const pq = (b.parent ?? model).getWorldQuaternion(new THREE.Quaternion()).premultiply(modelQi);
      parentQ.set(name, pq);
      parentQi.set(name, pq.clone().invert());
    }
    scene.add(model);

    // frame the model
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    ground.position.y = box.min.y;
    const dist = (size.y * 1.25) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.set(center.x, center.y + size.y * 0.12, center.z + dist);
    camera.lookAt(center.x, center.y - size.y * 0.02, center.z);

    resize();
    applyPose(0);
    renderer.render(scene, camera);
    opts.onReady?.();
    if (interactive) frame();
  });

  const ro = new ResizeObserver(() => {
    resize();
    if (!interactive) renderer.render(scene, camera);
  });
  ro.observe(container);

  const onMove = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp(((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2, -1, 1),
      THREE.MathUtils.clamp(((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2, -1, 1),
    );
  };
  const onTap = () => {
    if (hop === 0) hop = 0.001;
  };
  const onEnter = () => (happyTarget = 1);
  const onLeave = () => (happyTarget = 0);
  if (interactive) {
    window.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("click", onTap);
    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);
  }

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(container);

  return {
    renderer,
    scene,
    /** draw one frame now (used when rendering stills) */
    render: () => renderer.render(scene, camera),
    destroy() {
      running = false;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      container.removeEventListener("click", onTap);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      timer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

function add(a: [number, number, number], x: number, y: number, z: number): [number, number, number] {
  return [a[0] + x, a[1] + y, a[2] + z];
}
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
