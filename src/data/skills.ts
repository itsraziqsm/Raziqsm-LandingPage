// Edit this file to change the showcase content.
// Star counts and commands are placeholders taken from the reference video.

export type CategoryId = "video" | "motion" | "blender" | "web";

export interface Category {
  id: CategoryId;
  label: string; // shown big in serif italic
  short: string; // shown as small mono tag on cards
  color: string;
  tint: string; // scene background tint
}

export const categories: Category[] = [
  { id: "video", label: "Video", short: "Video", color: "#f26b2c", tint: "#f6d9c8" },
  { id: "motion", label: "Motion", short: "Motion", color: "#7559f2", tint: "#dcd8f6" },
  { id: "blender", label: "Blender", short: "Blender", color: "#1d9467", tint: "#d3e9dc" },
  { id: "web", label: "3D web", short: "3D web", color: "#1688c4", tint: "#d4e6f2" },
];

export type Prop =
  | "monitor"
  | "filmstrip"
  | "boards"
  | "curve"
  | "camera"
  | "burst"
  | "turntable"
  | "trees"
  | "canvas"
  | "blocks"
  | "layers"
  | "grid";

export interface Skill {
  name: string;
  repo: string; // owner/name on github
  category: CategoryId;
  description: string;
  command: string;
  tag: string; // pill label
  stars: string;
  prop: Prop;
  badge?: string; // small dark badge next to category
  chip?: string; // floating chip on the scene
}

export const skills: Skill[] = [
  {
    name: "hyperframes",
    repo: "heygen-com/hyperframes",
    category: "video",
    description: "huge skills refresh: /reverse-any-video, free music, sfx + tts",
    command: "npx hyperframes skills update",
    tag: "Skills",
    stars: "80K",
    prop: "monitor",
    badge: "Updated · Nov 4",
    chip: "new /reverse-any-video",
  },
  {
    name: "remotion skills",
    repo: "remotion-dev/skills",
    category: "video",
    description: "teaches Claude to cut real videos in React",
    command: "npx skills add remotion-dev/skills",
    tag: "Official",
    stars: "6.4K",
    prop: "filmstrip",
  },
  {
    name: "OpenMontage",
    repo: "calesthio/OpenMontage",
    category: "video",
    description: "a full agentic video studio: 12 pipelines, 700+ skill files",
    command: "git clone https://github.com/calesthio/OpenMontage.git",
    tag: "Studio",
    stars: "77K",
    prop: "boards",
  },
  {
    name: "gsap-skills",
    repo: "greensock/gsap-skills",
    category: "motion",
    description: "official GSAP skills: easing, timelines, scroll motion",
    command: "npx skills add https://github.com/greensock/gsap-skills",
    tag: "Official",
    stars: "15K",
    prop: "curve",
  },
  {
    name: "video-shotcraft",
    repo: "Vincentwei1021/video-shotcraft",
    category: "motion",
    description: "cinematic product promos: 124 shot recipes, beat sync",
    command: "npx skills add Vincentwei1021/video-shotcraft",
    tag: "Skill",
    stars: "17K",
    prop: "camera",
  },
  {
    name: "motionmaxxing",
    repo: "Tejashmakwana/motionmaxxing",
    category: "motion",
    description: "turns AI slop videos into films that look made by a motion designer",
    command: "git clone https://github.com/Tejashmakwana/motionmaxxing ~/.claude/skills/motionmaxxing",
    tag: "Skill",
    stars: "1.6K",
    prop: "burst",
  },
  {
    name: "blender mcp",
    repo: "ahujasid/blender-mcp",
    category: "blender",
    description: "Claude drives Blender: models, materials, whole scenes",
    command: "uvx blender-mcp",
    tag: "MCP",
    stars: "13K",
    prop: "turntable",
    chip: "> add a monkey",
  },
  {
    name: "blender-skills",
    repo: "arjun988/blender-skills",
    category: "blender",
    description: "94 Blender skills, from blockout to engine export",
    command: "git clone https://github.com/arjun988/blender-skills.git",
    tag: "94 Skills",
    stars: "3K",
    prop: "trees",
  },
  {
    name: "dream-loop",
    repo: "achimala/dream-loop",
    category: "blender",
    description: "Blender + image gen + a critic subagent that scores every render",
    command: "npx skills add achimala/dream-loop",
    tag: "Skill",
    stars: "1.8K",
    prop: "canvas",
  },
  {
    name: "threejs-game-skills",
    repo: "majidmanzarpour/threejs-game-skills",
    category: "web",
    description: "playable Three.js games with AAA-style graphics",
    command: "npx skills add majidmanzarpour/threejs-game-skills",
    tag: "9 Skills",
    stars: "2.7K",
    prop: "blocks",
  },
  {
    name: "anatomy",
    repo: "wharesryan22/anatomy",
    category: "web",
    description: "isometric exploded views of real machines, SVG + WebGL",
    command: "npx skills add wharesryan22/anatomy",
    tag: "Skill",
    stars: "25K",
    prop: "layers",
  },
  {
    name: "3dviz-pro-max",
    repo: "viettranx/3dviz-pro-max",
    category: "web",
    description: "idea in, Three.js or Blender scene out",
    command: "claude plugin install viettranx/3dviz-pro-max",
    tag: "Plugin",
    stars: "1K",
    prop: "grid",
  },
];

export const categoryOf = (id: CategoryId) => categories.find((c) => c.id === id)!;
