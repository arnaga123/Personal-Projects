"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MuscleGroup } from "@/lib/muscle-groups";
import { SPECIFIC_MUSCLE_BROAD_GROUP, SPECIFIC_MUSCLE_LABELS, type SpecificMuscle } from "@/lib/specific-muscles";

// Natural muscle-tissue red as the base tone (not a highlighted muscle) so the
// figure reads as anatomy rather than a flat-colored hologram; each muscle
// gets a small deterministic jitter off this base so adjacent, independently
// -modeled muscles stay visually distinguishable even when neither is
// highlighted — exactly what was missing before ("properly see every muscle").
const MUSCLE_BASE = "#a8483d";
const BONE_COLOR = "#e2d6bd";
const OUTLINE_COLOR = "#170a08";
const PRIMARY = "#c6ff3a";
const SECONDARY = "#5fbf3a";
const BG = "#0b0a09";

// Tuned for the full head-to-feet figure (~1.64m tall after adding neck and
// foot anatomy) at fov=30: target sits at mid-height, and the camera is far
// enough back that the head and feet both stay inside the frame with margin.
const INITIAL_CAMERA_POSITION: [number, number, number] = [1.44, 0.93, -3.2];
const ORBIT_TARGET: [number, number, number] = [0, 0.82, 0];

const PRIMARY_COLOR = new THREE.Color(PRIMARY);
const SECONDARY_COLOR = new THREE.Color(SECONDARY);
const MUSCLE_BASE_HSL = new THREE.Color(MUSCLE_BASE).getHSL({ h: 0, s: 0, l: 0 });

// Small per-broad-group hue shifts (still within the muscle-tissue red/brown
// family, not a rainbow) so a whole region reads as visually distinct at a
// glance — e.g. the back is noticeably warmer/browner than the chest — on
// top of the per-muscle lightness jitter that separates individual muscles
// within a region.
const BROAD_HUE_OFFSET: Record<MuscleGroup, number> = {
  chest: 0,
  shoulders: 0.025,
  arms: -0.03,
  back: 0.05,
  core: -0.05,
  legs: 0.075,
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return (h >>> 0) / 4294967295;
}

function baseColorFor(id: string, muscle: SpecificMuscle | null): THREE.Color {
  const broad = muscle ? SPECIFIC_MUSCLE_BROAD_GROUP[muscle] : undefined;
  const groupHueOffset = broad ? (BROAD_HUE_OFFSET[broad] ?? 0) : 0;
  const t = hashString(id);
  const lightness = MUSCLE_BASE_HSL.l + (t - 0.5) * 0.28;
  const hue = (((MUSCLE_BASE_HSL.h + groupHueOffset + (t - 0.5) * 0.02) % 1) + 1) % 1;
  return new THREE.Color().setHSL(hue, MUSCLE_BASE_HSL.s, Math.min(0.7, Math.max(0.16, lightness)));
}

type Region = SpecificMuscle | "neutral";

// When the exercise has specific-muscle data, only that exact muscle (and its
// specific secondaries) light up — the "surgical" highlight the broad-group
// version couldn't do. Without it, fall back to matching each vertex's
// specific muscle against its broad muscle group, reproducing the old
// whole-region highlight for exercises that haven't been tagged yet.
function regionColor(
  id: string,
  region: Region,
  primary: MuscleGroup,
  secondary: MuscleGroup[],
  specificMuscle?: SpecificMuscle,
  specificSecondaryMuscles?: SpecificMuscle[]
): THREE.Color {
  if (region === "neutral") return baseColorFor(id, null);
  if (specificMuscle) {
    if (region === specificMuscle) return PRIMARY_COLOR;
    if (specificSecondaryMuscles?.includes(region)) return SECONDARY_COLOR;
    return baseColorFor(id, region);
  }
  const broad = SPECIFIC_MUSCLE_BROAD_GROUP[region];
  if (broad === primary) return PRIMARY_COLOR;
  if (secondary.includes(broad)) return SECONDARY_COLOR;
  return baseColorFor(id, region);
}

// One real anatomical piece (muscle or bone), sliced directly out of the
// shared binary blob (no per-vertex copy until render time).
type MuscleEntry = {
  id: string;
  kind: "muscle" | "bone";
  muscle: SpecificMuscle | null;
  side: "L" | "R";
  positions: Float32Array;
  indices: Uint32Array;
};

type Manifest = {
  scale: number;
  muscles: {
    id: string;
    kind: "muscle" | "bone";
    muscle: SpecificMuscle | null;
    side: "L" | "R";
    posOffset: number;
    posLength: number;
    idxOffset: number;
    idxLength: number;
  }[];
};

function useMuscleData() {
  const [entries, setEntries] = useState<MuscleEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [manifest, binBuf] = await Promise.all([
        fetch("/models/muscles-manifest.json").then((r) => r.json() as Promise<Manifest>),
        fetch("/models/muscles.bin").then((r) => r.arrayBuffer()),
      ]);
      if (cancelled) return;
      const parsed = manifest.muscles.map((m) => ({
        id: m.id,
        kind: m.kind,
        muscle: m.muscle,
        side: m.side,
        positions: new Float32Array(binBuf, m.posOffset, m.posLength),
        indices: new Uint32Array(binBuf, m.idxOffset, m.idxLength),
      }));
      setEntries(parsed);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return entries;
}

// A dark, slightly-enlarged backface-only shell behind each piece — the
// standard "toon outline" trick, and the main way individual muscles read as
// distinct pieces at a glance rather than relying on color alone.
//
// This stays non-depth-writing so it can never permanently claim a pixel —
// it only shows through wherever nothing else has drawn something closer
// there. Fills, by contrast, are transparent (~0.94-0.99 opacity) but DO
// write depth: with ~100 independently-modeled anatomical pieces puffed
// outward to close seams, they overlap each other substantially, and true
// full-opacity rendering exposed real gaps between pieces as solid black
// (blending across the overlap had been quietly hiding those). Letting
// fills write depth while keeping the blend gives a real z-buffer for
// stability — no more per-frame flicker from three.js re-sorting transparent
// draw order by camera distance — while the residual blending still papers
// over the gaps. (A fixed manifest-index-based renderOrder was tried first
// instead of touching depth at all; with no depth write anywhere, that just
// replaced "flickers over time" with "whichever mesh has the higher fixed
// index always wins," visible as static, wrong-looking color takeovers.)
//
// The shell is built by pushing each vertex out along its own normal by a
// small constant world-space distance, not by scaling the whole mesh from
// its centroid. Centroid scaling moves a vertex by an amount proportional to
// its distance from the centroid — fine for a small round shape, but for a
// long piece (a trapezius, a torso bone) the far ends shift by far more than
// a "thin rim" and balloon straight through neighboring, anatomically-
// touching pieces, which is what caused large wrong-colored/black patches
// across the torso regardless of how transparency/depth were configured.
const OUTLINE_THICKNESS = 0.0025;

function useOutlineGeometry(geometry: THREE.BufferGeometry) {
  return useMemo(() => {
    const pos = geometry.attributes.position;
    const norm = geometry.attributes.normal;
    const outPos = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      outPos[i * 3] = pos.getX(i) + norm.getX(i) * OUTLINE_THICKNESS;
      outPos[i * 3 + 1] = pos.getY(i) + norm.getY(i) * OUTLINE_THICKNESS;
      outPos[i * 3 + 2] = pos.getZ(i) + norm.getZ(i) * OUTLINE_THICKNESS;
    }
    const outGeo = new THREE.BufferGeometry();
    outGeo.setAttribute("position", new THREE.BufferAttribute(outPos, 3));
    outGeo.setIndex(geometry.index);
    return outGeo;
  }, [geometry]);
}

function Outline({ geometry }: { geometry: THREE.BufferGeometry }) {
  const outlineGeometry = useOutlineGeometry(geometry);
  return (
    <mesh geometry={outlineGeometry}>
      <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} transparent depthWrite={false} />
    </mesh>
  );
}

function useEntryGeometry(entry: MuscleEntry) {
  return useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(entry.positions, 3));
    geo.setIndex(new THREE.BufferAttribute(entry.indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [entry]);
}

function BoneMesh({ entry }: { entry: MuscleEntry }) {
  const geometry = useEntryGeometry(entry);
  return (
    <>
      <Outline geometry={geometry} />
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={BONE_COLOR}
          roughness={0.55}
          metalness={0}
          transparent
          opacity={0.97}
          depthWrite
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function MuscleMesh({
  entry,
  primary,
  secondary,
  specificMuscle,
  specificSecondaryMuscles,
}: {
  entry: MuscleEntry;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  specificMuscle?: SpecificMuscle;
  specificSecondaryMuscles?: SpecificMuscle[];
}) {
  const geometry = useEntryGeometry(entry);
  // Untracked pieces (e.g. neck muscles with no SpecificMuscle mapping) are
  // always rendered as plain, never-highlighted anatomy.
  const region: Region = entry.muscle ?? "neutral";

  const color = regionColor(entry.id, region, primary, secondary, specificMuscle, specificSecondaryMuscles);
  const highlighted =
    entry.muscle === null
      ? false
      : specificMuscle
        ? entry.muscle === specificMuscle || !!specificSecondaryMuscles?.includes(entry.muscle)
        : SPECIFIC_MUSCLE_BROAD_GROUP[entry.muscle] === primary ||
          secondary.includes(SPECIFIC_MUSCLE_BROAD_GROUP[entry.muscle]);

  return (
    <>
      <Outline geometry={geometry} />
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={color}
          emissive={highlighted ? color : "#000000"}
          emissiveIntensity={highlighted ? 0.55 : 0}
          transparent
          opacity={highlighted ? 0.99 : 0.94}
          roughness={0.65}
          metalness={0}
          depthWrite
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function Figure({
  primary,
  secondary,
  specificMuscle,
  specificSecondaryMuscles,
}: {
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  specificMuscle?: SpecificMuscle;
  specificSecondaryMuscles?: SpecificMuscle[];
}) {
  const entries = useMuscleData();
  if (!entries) return null;

  return (
    <group>
      {entries.map((entry) =>
        entry.kind === "bone" ? (
          <BoneMesh key={entry.id} entry={entry} />
        ) : (
          <MuscleMesh
            key={entry.id}
            entry={entry}
            primary={primary}
            secondary={secondary}
            specificMuscle={specificMuscle}
            specificSecondaryMuscles={specificSecondaryMuscles}
          />
        )
      )}
    </group>
  );
}

function Rig({ view, onArrived }: { view: "front" | "back" | null; onArrived: () => void }) {
  const { camera, controls } = useThree();
  useFrame(() => {
    if (!view) return;
    const anyControls = controls as unknown as { target: { x: number; y: number; z: number }; update: () => void } | null;
    const target = anyControls?.target ?? { x: ORBIT_TARGET[0], y: ORBIT_TARGET[1], z: ORBIT_TARGET[2] };
    const dx = camera.position.x - target.x;
    const dz = camera.position.z - target.z;
    const radius = Math.hypot(dx, dz);
    const currentTheta = Math.atan2(dx, dz);
    const targetTheta = view === "front" ? Math.PI : 0;
    let delta = targetTheta - currentTheta;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    if (Math.abs(delta) < 0.01) {
      onArrived();
      return;
    }
    const newTheta = currentTheta + delta * 0.14;
    // eslint-disable-next-line react-hooks/immutability
    camera.position.x = target.x + radius * Math.sin(newTheta);
    camera.position.z = target.z + radius * Math.cos(newTheta);
    camera.lookAt(target.x, target.y, target.z);
    anyControls?.update();
  });
  return null;
}

function Scene({ primary, secondary, specificMuscle, specificSecondaryMuscles, view, onArrived }: {
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  specificMuscle?: SpecificMuscle;
  specificSecondaryMuscles?: SpecificMuscle[];
  view: "front" | "back" | null;
  onArrived: () => void;
}) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 3]} intensity={1} />

      <Suspense fallback={null}>
        <Figure
          primary={primary}
          secondary={secondary}
          specificMuscle={specificMuscle}
          specificSecondaryMuscles={specificSecondaryMuscles}
        />
      </Suspense>

      <Rig view={view} onArrived={onArrived} />
      <OrbitControls
        makeDefault
        target={ORBIT_TARGET}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.8}
        maxDistance={10}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.9}
      />
    </>
  );
}

export function BodyDiagram({
  primary,
  secondary,
  specificMuscle,
  specificSecondaryMuscles,
}: {
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  specificMuscle?: SpecificMuscle;
  specificSecondaryMuscles?: SpecificMuscle[];
}) {
  const [view, setView] = useState<"front" | "back" | null>("front");
  const primaryLabel = specificMuscle ? SPECIFIC_MUSCLE_LABELS[specificMuscle] : "Primary";
  const secondaryLabel =
    specificSecondaryMuscles && specificSecondaryMuscles.length > 0
      ? specificSecondaryMuscles.map((m) => SPECIFIC_MUSCLE_LABELS[m]).join(" / ")
      : "Secondary";

  return (
    <div className="flex flex-col gap-4 border border-border bg-surface p-6">
      <div className="relative h-[440px] w-full overflow-hidden bg-black/40">
        <Canvas
          shadows={false}
          dpr={[1, 2]}
          camera={{ position: INITIAL_CAMERA_POSITION, fov: 30 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <color attach="background" args={[BG]} />
          <Scene
            primary={primary}
            secondary={secondary}
            specificMuscle={specificMuscle}
            specificSecondaryMuscles={specificSecondaryMuscles}
            view={view}
            onArrived={() => setView(null)}
          />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          <span className="pointer-events-none text-[10px] uppercase tracking-wide text-muted/70">
            Drag to rotate · Scroll to zoom
          </span>
          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              onClick={() => setView("front")}
              className={cn(buttonVariants("secondary"), "px-3 py-1.5 text-[10px]")}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => setView("back")}
              className={cn(buttonVariants("secondary"), "px-3 py-1.5 text-[10px]")}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border pt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5 capitalize">
          <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: PRIMARY }} /> {primaryLabel}
        </span>
        <span className="flex items-center gap-1.5 capitalize">
          <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: SECONDARY }} /> {secondaryLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5" style={{ backgroundColor: MUSCLE_BASE }} /> Not worked
        </span>
      </div>
    </div>
  );
}
