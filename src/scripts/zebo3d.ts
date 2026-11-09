// Interactive 3D Zebo. The GLB has no baked animations, so everything here is
// procedural: each named node (head, ears, arms, tail…) gets an offset rotation
// on top of its rest pose.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export interface PoseOffsets {
  /** radians, added to the node's rest rotation */
  [node: string]: [number, number, number];
}

/** Static poses used for the pre-rendered stills and as animation bases. */
export const POSES: Record<string, { offsets: PoseOffsets; yaw: number }> = {
  wave: { yaw: -0.35, offsets: {} },
  hello: { yaw: 0.35, offsets: { head: [0.05, 0.25, 0.1] } },
  cheer: { yaw: -0.2, offsets: { arm_L: [0, 0, -1.6], arm_R: [0, 0, 0.25], head: [-0.12, 0, 0] } },
  point: { yaw: 0.5, offsets: { head: [0.12, 0.2, -0.22], ear_L: [0, 0, 0.25], ear_R: [0, 0, 0.35], arm_R: [0, 0, -0.9] } },
  peek: { yaw: -0.6, offsets: { head: [0.05, -0.35, 0.25], ear_R: [0, 0, -0.3] } },
};

const ANIMATED = ["zebo", "body", "torso", "head", "ear_L", "ear_R", "arm_L", "arm_R", "tail"] as const;

export interface ZeboOptions {
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

export function mountZebo(container: HTMLElement, opts: ZeboOptions) {
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

  const nodes = new Map<string, THREE.Object3D>();
  const rest = new Map<string, THREE.Quaternion>();
  const restPos = new Map<string, THREE.Vector3>();
  let root: THREE.Object3D | null = null;

  const pointer = new THREE.Vector2();
  const look = new THREE.Vector2();
  let hop = 0;
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

  const tmpE = new THREE.Euler();
  const tmpQ = new THREE.Quaternion();
  const setOffset = (name: string, x: number, y: number, z: number) => {
    const n = nodes.get(name);
    const r = rest.get(name);
    if (!n || !r) return;
    tmpQ.setFromEuler(tmpE.set(x, y, z));
    n.quaternion.copy(r).multiply(tmpQ);
  };

  const applyPose = (t: number) => {
    const o = pose.offsets;
    const g = (name: string): [number, number, number] => o[name] ?? [0, 0, 0];
    const idle = interactive ? 1 : 0;
    const s = Math.sin;

    // body bob + breathing + hop
    const bodyPos = restPos.get("body");
    const body = nodes.get("body");
    const hopY = Math.max(0, s(Math.min(hop, 1) * Math.PI)) * 0.25;
    if (body && bodyPos) body.position.set(bodyPos.x, bodyPos.y + idle * s(t * 2.2) * 0.015 + hopY, bodyPos.z);
    const torso = nodes.get("torso");
    if (torso) {
      const b = 1 + idle * s(t * 2.2) * 0.012;
      torso.scale.set(0.3 * b, 0.29 / b, 0.28 * b);
    }

    // head follows the pointer
    const [hx, hy, hz] = g("head");
    setOffset("head", hx + look.y * 0.25 + idle * s(t * 1.3) * 0.03, hy + look.x * 0.45, hz - look.x * 0.12 + idle * s(t * 0.9) * 0.04);

    // ears lag behind the head a little
    const [elx, ely, elz] = g("ear_L");
    const [erx, ery, erz] = g("ear_R");
    setOffset("ear_L", elx + idle * s(t * 2.6 + 0.5) * 0.06, ely, elz + idle * s(t * 1.8) * 0.1 - look.x * 0.15 + hopY * 0.8);
    setOffset("ear_R", erx + idle * s(t * 2.4) * 0.06, ery, erz - idle * s(t * 1.7 + 1) * 0.1 - look.x * 0.15 - hopY * 0.8);

    // waving arm
    const [arx, ary, arz] = g("arm_R");
    setOffset("arm_R", arx, ary, arz + idle * s(t * 6) * 0.35);
    const [alx, aly, alz] = g("arm_L");
    setOffset("arm_L", alx, aly, alz + idle * s(t * 2.2) * 0.05);

    const [tx, ty, tz] = g("tail");
    setOffset("tail", tx, ty + idle * s(t * 5) * 0.3, tz);

    if (root) root.rotation.y = yaw + look.x * 0.22 + (hop > 0 && hop < 1 ? hop * Math.PI * 2 : 0);
  };

  const frame = () => {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!visible) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();
    look.lerp(pointer, 1 - Math.pow(0.002, dt));
    if (hop > 0) hop = hop >= 1 ? 0 : hop + dt * 1.4;
    applyPose(t);
    renderer.render(scene, camera);
  };

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(opts.src, (gltf) => {
    root = gltf.scene;
    root.traverse((o) => {
      if (o.name) nodes.set(o.name, o);
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    for (const n of ANIMATED) {
      const o = nodes.get(n);
      if (o) {
        rest.set(n, o.quaternion.clone());
        restPos.set(n, o.position.clone());
      }
    }
    scene.add(root);

    // frame the model
    const box = new THREE.Box3().setFromObject(root);
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
  if (interactive) {
    window.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("click", onTap);
  }

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(container);

  return {
    renderer,
    destroy() {
      running = false;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      container.removeEventListener("click", onTap);
      timer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
