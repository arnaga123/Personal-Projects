"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MuscleGroup } from "@/lib/muscle-groups";
import { SPECIFIC_MUSCLE_BROAD_GROUP, SPECIFIC_MUSCLE_LABELS, type SpecificMuscle } from "@/lib/specific-muscles";

// Neutral grey for anything not targeted, so worked muscles read as the one
// clear signal on the figure instead of competing with a colored body; each
// muscle gets a small deterministic jitter off this base so adjacent,
// independently-modeled muscles stay visually distinguishable as shapes
// even when neither is highlighted.
// A bit darker than before so the highlight red has more to contrast
// against — the highlight itself wasn't the only thing that needed to pop
// harder, a lighter grey body was eating into that contrast too.
const MUSCLE_BASE = "#726f6a";
const BONE_COLOR = "#e2d6bd";
// More saturated and a shade brighter than before — the previous red/pink
// pair was legible up close but too easily lost against the grey body at a
// normal glance.
const PRIMARY = "#ff2114";
const SECONDARY = "#ff8f76";
const BG = "#0b0a09";

// Tuned for the full head-to-feet figure (~1.64m tall after adding neck and
// foot anatomy) at fov=30: target sits at mid-height, and the camera is far
// enough back that the head and feet both stay inside the frame with margin.
const INITIAL_CAMERA_POSITION: [number, number, number] = [1.44, 0.93, -3.2];
const ORBIT_TARGET: [number, number, number] = [0, 0.82, 0];

const PRIMARY_HSL = new THREE.Color(PRIMARY).getHSL({ h: 0, s: 0, l: 0 });
const SECONDARY_HSL = new THREE.Color(SECONDARY).getHSL({ h: 0, s: 0, l: 0 });
const MUSCLE_BASE_HSL = new THREE.Color(MUSCLE_BASE).getHSL({ h: 0, s: 0, l: 0 });

// The body is one consistent grey — individual muscles read as distinct via
// *shade*, not hue (a per-broad-group hue shift was tried here once; on a
// low-saturation base it did nothing useful, and on the red base tried
// before that it was enough to visibly rotate hue into magenta/orange for
// some groups). Keeping every group at 0 and relying only on baseColorFor's
// per-muscle lightness jitter for separation.
const BROAD_HUE_OFFSET: Record<MuscleGroup, number> = {
  chest: 0,
  shoulders: 0,
  arms: 0,
  back: 0,
  core: 0,
  legs: 0,
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
  // Enough shade difference that unworked muscles read as distinct shapes
  // next to each other, not so much that it goes back to looking muddy —
  // with per-piece shading now doing most of the form-separation work
  // (see MuscleMesh), this only needs to nudge flat areas, not carry the
  // whole distinction on its own.
  const lightness = MUSCLE_BASE_HSL.l + (t - 0.5) * 0.16;
  const hue = (((MUSCLE_BASE_HSL.h + groupHueOffset) % 1) + 1) % 1;
  // Clamp relative to the base lightness (not a fixed range) so this stays
  // correct if MUSCLE_BASE itself changes — a fixed [0.32, 0.62] clamp is
  // exactly what silently overrode "dark blood red" back to a medium shade
  // the last time this base color changed.
  const clampMin = Math.max(0, MUSCLE_BASE_HSL.l - 0.06);
  const clampMax = Math.min(1, MUSCLE_BASE_HSL.l + 0.06);
  return new THREE.Color().setHSL(hue, MUSCLE_BASE_HSL.s, Math.min(clampMax, Math.max(clampMin, lightness)));
}

// Highlighted pieces used to return the exact same flat PRIMARY/SECONDARY
// color for every matching piece — two anatomically separate pieces (like
// left and right rectus abdominis) rendered as one dead-flat, identical
// swatch with zero variation between them, which reads as "no texture"
// regardless of how good the lighting is. This gives highlighted pieces the
// same kind of per-piece shade jitter baseColorFor gives unworked ones.
// Jitter only ever brightens (never darkens) relative to the base lightness:
// symmetric jitter here was occasionally landing a highlighted piece
// noticeably darker than PRIMARY/SECONDARY's own lightness, which is exactly
// what made it hard to spot against the grey body. This keeps every
// highlighted piece at least as bright as the base color, with a bit of
// variety added on top instead of subtracted.
function jitteredColor(id: string, hsl: { h: number; s: number; l: number }, spread: number): THREE.Color {
  const t = hashString(id);
  const lightness = Math.min(1, hsl.l + t * spread);
  return new THREE.Color().setHSL(hsl.h, hsl.s, lightness);
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
    if (region === specificMuscle) return jitteredColor(id, PRIMARY_HSL, 0.1);
    if (specificSecondaryMuscles?.includes(region)) return jitteredColor(id, SECONDARY_HSL, 0.1);
    return baseColorFor(id, region);
  }
  const broad = SPECIFIC_MUSCLE_BROAD_GROUP[region];
  if (broad === primary) return jitteredColor(id, PRIMARY_HSL, 0.1);
  if (secondary.includes(broad)) return jitteredColor(id, SECONDARY_HSL, 0.1);
  return baseColorFor(id, region);
}

// One real anatomical piece (muscle or bone), sliced directly out of the
// shared binary blob (no per-vertex copy until render time).
type MuscleEntry = {
  id: string;
  kind: "muscle" | "bone" | "skin";
  muscle: SpecificMuscle | null;
  side: "L" | "R";
  positions: Float32Array;
  indices: Uint32Array;
};

type Manifest = {
  scale: number;
  muscles: {
    id: string;
    kind: "muscle" | "bone" | "skin";
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

// A per-piece toon-outline shell (an enlarged BackSide shell peeking through
// at silhouette edges) used to draw a boundary line around every muscle.
// Removed: on ~170 independently-modeled, non-convex, overlapping organic
// pieces, that peek-through doesn't stay confined to real edges — it
// triggers all across each piece's interior wherever local curvature
// happens to expose the shell, which reads as scattered white speckle
// rather than a clean line. Neither increasing the shell's thickness nor
// heavily smoothing the underlying geometry fixed that (both were tried);
// the technique itself doesn't hold up at this piece count and complexity.
// Muscle boundaries now come from meshLambertMaterial's light/shadow across
// each piece's real puffed-out form plus baseColorFor's per-muscle shade
// jitter, not an explicit drawn line.

function useEntryGeometry(entry: MuscleEntry) {
  return useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(entry.positions, 3));
    geo.setIndex(new THREE.BufferAttribute(entry.indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [entry]);
}

// Bones alone get real shading (matte diffuse, not the flat color the rest
// of the figure uses): a skull only reads as a skull through light and
// shadow across its eye sockets, brow ridge, and jaw — flat color turns any
// 3D form into a featureless blob regardless of how accurate the geometry
// underneath actually is. Lambert (pure diffuse, no specular term at all)
// gives that shading without the speckled highlights meshStandardMaterial
// produced on this coarse, decimated geometry — that speckling was a
// specular artifact, not a diffuse one.
function BoneMesh({ entry, onSelectPoint }: { entry: MuscleEntry; onSelectPoint: (p: THREE.Vector3) => void }) {
  const geometry = useEntryGeometry(entry);
  return (
    <mesh
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPoint(e.point);
      }}
    >
      <meshLambertMaterial color={BONE_COLOR} side={THREE.DoubleSide} />
    </mesh>
  );
}

// A full-body shell (BodyParts3D's "skin" mesh) rendered underneath
// everything else in the plain "not worked" tone, so the figure reads as a
// continuous body instead of separate muscle islands floating over black
// background wherever no named muscle is modeled.
//
// This never writes depth, so it can never win a depth test against a named
// muscle/bone — it only ever shows through real gaps. Depth *competition*
// (shrinking it inward and hoping named muscles' puff pushes past it) isn't
// reliable here: skin and the individual named muscles come from separately
// reconstructed BodyParts3D datasets that don't align tightly enough for
// that — skin's true surface sits closer to the camera than most puffed
// muscles almost everywhere, so it would just win outright and hide them.
// No outline shell of its own for the same reason an outline traces
// individual pieces, not the whole silhouette.
//
// renderOrder={-1} forces this to draw before every muscle/bone (which sit
// at the default 0) regardless of the opaque queue's own front-to-back
// sort. Without it, whichever one happens to draw second wins the pixel —
// depthWrite:false only stops skin from being written *to* the depth
// buffer, it doesn't stop skin's own draw from passing its depth test (it's
// usually the closer surface) and overwriting an already-drawn muscle's
// color outright. Forcing skin first means muscles always draw after it and
// simply replace its color wherever they exist.
function SkinMesh({ entry, onSelectPoint }: { entry: MuscleEntry; onSelectPoint: (p: THREE.Vector3) => void }) {
  const geometry = useEntryGeometry(entry);
  const color = useMemo(() => baseColorFor(entry.id, null), [entry.id]);
  return (
    <mesh
      geometry={geometry}
      renderOrder={-1}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPoint(e.point);
      }}
    >
      <meshLambertMaterial color={color} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function MuscleMesh({
  entry,
  primary,
  secondary,
  specificMuscle,
  specificSecondaryMuscles,
  onSelectPoint,
}: {
  entry: MuscleEntry;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  specificMuscle?: SpecificMuscle;
  specificSecondaryMuscles?: SpecificMuscle[];
  onSelectPoint: (p: THREE.Vector3) => void;
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
    <mesh
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPoint(e.point);
      }}
    >
      {/* 0.6 washed out the diffuse shading entirely (a highlighted muscle
          read as flat/textureless); 0.12 swung too far the other way and
          made the highlight easy to lose against the grey body once a
          piece's own shading dipped. 0.25 is the middle: a floor under how
          dark a highlighted piece's shadow side can get, without
          overpowering the light/shadow gradient the rest of the fix relies
          on for showing shape. */}
      <meshLambertMaterial
        color={color}
        emissive={highlighted ? color : "#000000"}
        emissiveIntensity={highlighted ? 0.25 : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Figure({
  primary,
  secondary,
  specificMuscle,
  specificSecondaryMuscles,
  onSelectPoint,
}: {
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  specificMuscle?: SpecificMuscle;
  specificSecondaryMuscles?: SpecificMuscle[];
  onSelectPoint: (p: THREE.Vector3) => void;
}) {
  const entries = useMuscleData();
  if (!entries) return null;

  return (
    <group>
      {entries.map((entry) =>
        entry.kind === "bone" ? (
          <BoneMesh key={entry.id} entry={entry} onSelectPoint={onSelectPoint} />
        ) : entry.kind === "skin" ? (
          <SkinMesh key={entry.id} entry={entry} onSelectPoint={onSelectPoint} />
        ) : (
          <MuscleMesh
            key={entry.id}
            entry={entry}
            primary={primary}
            secondary={secondary}
            specificMuscle={specificMuscle}
            specificSecondaryMuscles={specificSecondaryMuscles}
            onSelectPoint={onSelectPoint}
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

const DEFAULT_TARGET_VEC = new THREE.Vector3(...ORBIT_TARGET);
const DEFAULT_DISTANCE = new THREE.Vector3(...INITIAL_CAMERA_POSITION).distanceTo(DEFAULT_TARGET_VEC);
const CLOSE_ZOOM_DISTANCE = 0.4;
const FOCUS_EPSILON = 0.01;

// Click a muscle to zoom into it, click "Full body" to zoom back out. Moves
// the orbit pivot to the clicked point and dollies the camera in along
// whatever direction it's currently facing (doesn't force a specific
// angle), so a focus doesn't fight whatever rotation the user already set
// up with drag-to-rotate. Stops adjusting once within FOCUS_EPSILON so it
// doesn't fight the user's own drag/scroll input after arriving.
function FocusRig({ focusPoint }: { focusPoint: THREE.Vector3 | null }) {
  const { camera, controls } = useThree();
  useFrame(() => {
    const anyControls = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (!anyControls) return;

    const desiredTarget = focusPoint ?? DEFAULT_TARGET_VEC;
    const desiredDistance = focusPoint ? CLOSE_ZOOM_DISTANCE : DEFAULT_DISTANCE;

    const dir = new THREE.Vector3().subVectors(camera.position, anyControls.target);
    const currentDistance = dir.length() || 1;
    dir.normalize();

    if (anyControls.target.distanceTo(desiredTarget) < FOCUS_EPSILON && Math.abs(currentDistance - desiredDistance) < FOCUS_EPSILON) {
      return;
    }

    anyControls.target.lerp(desiredTarget, 0.12);
    const newDistance = THREE.MathUtils.lerp(currentDistance, desiredDistance, 0.12);
    camera.position.copy(anyControls.target).addScaledVector(dir, newDistance);
    camera.lookAt(anyControls.target);
    anyControls.update();
  });
  return null;
}

function Scene({ primary, secondary, specificMuscle, specificSecondaryMuscles, view, onArrived, focusPoint, onSelectPoint }: {
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  specificMuscle?: SpecificMuscle;
  specificSecondaryMuscles?: SpecificMuscle[];
  view: "front" | "back" | null;
  onArrived: () => void;
  focusPoint: THREE.Vector3 | null;
  onSelectPoint: (p: THREE.Vector3) => void;
}) {
  return (
    <>
      {/* Every piece uses meshLambertMaterial (diffuse-only — no specular
          term at all, unlike meshStandardMaterial), so individual muscles
          and the skull read as real 3D shapes via light/shadow instead of
          flat color regions. Diffuse still reacts to per-facet surface
          noise, which is why this only looks clean now that the geometry
          itself got much heavier smoothing in the build — before that, this
          exact material showed the same speckle a specular material did. */}
      {/* Ambient this strong relative to directional was the real reason
          shading looked flat everywhere, not just on highlighted pieces:
          ambient is a flat, angle-independent fill, so when it dominates,
          the angle-dependent term that actually reveals form (a muscle's
          curve, an eye socket) gets drowned out. Directional now does most
          of the work; ambient only keeps the shadowed side from going
          fully black. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 3]} intensity={1} />

      <Suspense fallback={null}>
        <Figure
          primary={primary}
          secondary={secondary}
          specificMuscle={specificMuscle}
          specificSecondaryMuscles={specificSecondaryMuscles}
          onSelectPoint={onSelectPoint}
        />
      </Suspense>

      <Rig view={view} onArrived={onArrived} />
      <FocusRig focusPoint={focusPoint} />
      <OrbitControls
        makeDefault
        target={ORBIT_TARGET}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.15}
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
  const [focusPoint, setFocusPoint] = useState<THREE.Vector3 | null>(null);
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
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        >
          <color attach="background" args={[BG]} />
          <Scene
            primary={primary}
            secondary={secondary}
            specificMuscle={specificMuscle}
            specificSecondaryMuscles={specificSecondaryMuscles}
            view={view}
            onArrived={() => setView(null)}
            focusPoint={focusPoint}
            onSelectPoint={setFocusPoint}
          />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          <span className="pointer-events-none text-[10px] uppercase tracking-wide text-muted/70">
            {focusPoint ? "Drag to rotate · Scroll to zoom" : "Click a muscle to zoom in"}
          </span>
          <div className="pointer-events-auto flex gap-2">
            {focusPoint && (
              <button
                type="button"
                onClick={() => setFocusPoint(null)}
                className={cn(buttonVariants("secondary"), "px-3 py-1.5 text-[10px]")}
              >
                Full body
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setView("front");
                setFocusPoint(null);
              }}
              className={cn(buttonVariants("secondary"), "px-3 py-1.5 text-[10px]")}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => {
                setView("back");
                setFocusPoint(null);
              }}
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
