"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MuscleGroup } from "@/lib/muscle-groups";
import { SPECIFIC_MUSCLE_BROAD_GROUP, SPECIFIC_MUSCLE_LABELS, type SpecificMuscle } from "@/lib/specific-muscles";

const HOLO_BASE = "#5fc6ff";
const PRIMARY = "#c6ff3a";
const SECONDARY = "#9be15c";
const BG = "#050c18";

const INITIAL_CAMERA_POSITION: [number, number, number] = [1.1, 1.05, 2.6];
const ORBIT_TARGET: [number, number, number] = [0, 0.95, 0];

useGLTF.preload("/models/xbot.glb");

const HOLO_BASE_COLOR = new THREE.Color(HOLO_BASE);
const PRIMARY_COLOR = new THREE.Color(PRIMARY);
const SECONDARY_COLOR = new THREE.Color(SECONDARY);

type Region = SpecificMuscle | "neutral";

// When the exercise has specific-muscle data, only that exact muscle (and its
// specific secondaries) light up — the "surgical" highlight the broad-group
// version couldn't do. Without it, fall back to matching each vertex's
// specific muscle against its broad muscle group, reproducing the old
// whole-region highlight for exercises that haven't been tagged yet.
function regionColor(
  region: Region,
  primary: MuscleGroup,
  secondary: MuscleGroup[],
  specificMuscle?: SpecificMuscle,
  specificSecondaryMuscles?: SpecificMuscle[]
): THREE.Color {
  if (region === "neutral") return HOLO_BASE_COLOR;
  if (specificMuscle) {
    if (region === specificMuscle) return PRIMARY_COLOR;
    if (specificSecondaryMuscles?.includes(region)) return SECONDARY_COLOR;
    return HOLO_BASE_COLOR;
  }
  const broad = SPECIFIC_MUSCLE_BROAD_GROUP[region];
  if (broad === primary) return PRIMARY_COLOR;
  if (secondary.includes(broad)) return SECONDARY_COLOR;
  return HOLO_BASE_COLOR;
}

// Vertex Z sign convention (confirmed empirically against this rig): negative
// Z is the character's front, positive Z is the back.
const FRONT_Z = -0.01;
const BACK_Z = 0.01;

// Classifies every vertex of a skinned mesh into a specific muscle by its
// dominant bone weight, refined with the vertex's own bind-pose position:
// front/back (Z) splits anterior from posterior muscles sharing one bone
// (e.g. biceps vs. triceps both ride the upper-arm bone), and — for the
// upper arm and forearm — how far along the bone's own vertex span a vertex
// sits (found from the neighboring bones' mean X, since a bone's own matrix
// isn't a reliable "shoulder" or "elbow" landmark on this rig) separates
// biceps from the more distal brachialis, and isolates brachioradialis at
// the proximal forearm.
function classifyVertices(mesh: THREE.SkinnedMesh): Region[] {
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const skinIndex = geo.attributes.skinIndex;
  const skinWeight = geo.attributes.skinWeight;
  const bones = mesh.skeleton.bones;
  const count = pos.count;
  const regions: Region[] = new Array(count).fill("neutral");
  if (!skinIndex || !skinWeight) return regions;

  const boneNameOf: string[] = new Array(count);
  let minY = Infinity;
  let maxY = -Infinity;
  const xSum: Record<string, { sum: number; n: number }> = {};

  for (let i = 0; i < count; i++) {
    const idxs = [skinIndex.getX(i), skinIndex.getY(i), skinIndex.getZ(i), skinIndex.getW(i)];
    const wts = [skinWeight.getX(i), skinWeight.getY(i), skinWeight.getZ(i), skinWeight.getW(i)];
    let bestIdx = idxs[0];
    let bestWeight = wts[0];
    for (let k = 1; k < 4; k++) {
      if (wts[k] > bestWeight) {
        bestWeight = wts[k];
        bestIdx = idxs[k];
      }
    }
    const bone = bones[bestIdx];
    const name = bone ? bone.name.replace(/^mixamorig:?/i, "") : "";
    boneNameOf[i] = name;

    const y = pos.getY(i);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    if (name) {
      const s = (xSum[name] ??= { sum: 0, n: 0 });
      s.sum += pos.getX(i);
      s.n += 1;
    }
  }
  const totalHeight = Math.max(maxY - minY, 1e-6);
  const meanX = (name: string, fallback: number) => (xSum[name] ? xSum[name].sum / xSum[name].n : fallback);

  function armMuscle(side: "Left" | "Right", i: number): SpecificMuscle {
    const x = pos.getX(i);
    const shoulderX = meanX(`${side}Shoulder`, x);
    const elbowX = meanX(`${side}ForeArm`, x);
    const span = elbowX - shoulderX;
    const t = span !== 0 ? (x - shoulderX) / span : 0.5;
    // The "Beta_Joints" mesh's shoulder-ball geometry is dominantly weighted
    // to the upper-arm bone rather than the shoulder bone, so without this
    // its most proximal sliver would read as biceps/triceps instead of
    // deltoid — the deltoid cap does anatomically wrap over that insertion.
    if (t < 0.15) return shoulderMuscle(i);
    if (pos.getZ(i) > BACK_Z) return "triceps_brachii";
    return t > 0.55 ? "brachialis" : "biceps_brachii";
  }

  function forearmMuscle(side: "Left" | "Right", i: number): Region {
    const x = pos.getX(i);
    const elbowX = meanX(`${side}Arm`, x);
    const wristX = meanX(`${side}Hand`, x);
    const span = wristX - elbowX;
    const t = span !== 0 ? (x - elbowX) / span : 0.5;
    return t < 0.4 ? "brachioradialis" : "neutral";
  }

  function shoulderMuscle(i: number): SpecificMuscle {
    const z = pos.getZ(i);
    if (z < FRONT_Z) return "anterior_deltoid";
    if (z > BACK_Z) return "posterior_deltoid";
    return "lateral_deltoid";
  }

  function torsoMuscle(name: string, i: number): Region {
    const relY = (pos.getY(i) - minY) / totalHeight;
    const z = pos.getZ(i);
    if (z < FRONT_Z) {
      if (name === "Hips" && relY < 0.15) return "neutral"; // groin
      if (relY > 0.78) return "upper_pectoralis";
      if (relY > 0.55) return "lower_pectoralis";
      return Math.abs(pos.getX(i)) > 0.09 ? "obliques" : "rectus_abdominis";
    }
    if (z > BACK_Z) {
      if (name === "Hips") return "gluteus_maximus";
      return relY > 0.75 ? "trapezius" : "latissimus_dorsi";
    }
    return "neutral";
  }

  for (let i = 0; i < count; i++) {
    const name = boneNameOf[i];
    if (name.startsWith("LeftHand") || name.startsWith("RightHand")) continue; // fingers stay neutral
    switch (name) {
      case "LeftArm":
        regions[i] = armMuscle("Left", i);
        continue;
      case "RightArm":
        regions[i] = armMuscle("Right", i);
        continue;
      case "LeftForeArm":
        regions[i] = forearmMuscle("Left", i);
        continue;
      case "RightForeArm":
        regions[i] = forearmMuscle("Right", i);
        continue;
      case "LeftShoulder":
      case "RightShoulder":
        regions[i] = shoulderMuscle(i);
        continue;
      case "LeftUpLeg":
      case "RightUpLeg":
        regions[i] = pos.getZ(i) < 0 ? "quadriceps" : "hamstrings";
        continue;
      case "LeftLeg":
      case "RightLeg":
        regions[i] = "gastrocnemius";
        continue;
    }
    if (name.startsWith("Spine") || name === "Hips") {
      regions[i] = torsoMuscle(name, i);
    }
  }
  return regions;
}

function applyRegionColors(
  mesh: THREE.SkinnedMesh,
  regions: Region[],
  primary: MuscleGroup,
  secondary: MuscleGroup[],
  specificMuscle?: SpecificMuscle,
  specificSecondaryMuscles?: SpecificMuscle[]
) {
  const count = regions.length;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const c = regionColor(regions[i], primary, secondary, specificMuscle, specificSecondaryMuscles);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const attr = mesh.geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
  if (attr && attr.array.length === colors.length) {
    (attr.array as Float32Array).set(colors);
    attr.needsUpdate = true;
  } else {
    mesh.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }
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
  const { scene, animations } = useGLTF("/models/xbot.glb");
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as THREE.Object3D, [scene]);
  const { actions, mixer } = useAnimations(animations, cloned);

  const skinnedMeshes = useMemo(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    cloned.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh) meshes.push(obj as THREE.SkinnedMesh);
    });
    return meshes;
  }, [cloned]);

  const regionsByMesh = useMemo(() => skinnedMeshes.map((mesh) => classifyVertices(mesh)), [skinnedMeshes]);

  useEffect(() => {
    const action = actions.sad_pose;
    if (!action) return;
    // drei's useAnimations calls mixer.update() every frame regardless, so a
    // playing action loops forever — this clip is ~0.07s long, which without
    // pausing caused a rapid, visible twitch. Freeze it on one static frame.
    action.reset().play();
    // Imperative three.js AnimationAction state, not React render state.
    // eslint-disable-next-line react-hooks/immutability
    action.time = 0.03;
    action.paused = true;
    mixer.update(0);
  }, [actions, mixer]);

  useEffect(() => {
    skinnedMeshes.forEach((mesh) => {
      mesh.material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.96,
        roughness: 0.4,
        metalness: 0.05,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
    });
  }, [skinnedMeshes]);

  useEffect(() => {
    skinnedMeshes.forEach((mesh, i) => {
      applyRegionColors(mesh, regionsByMesh[i], primary, secondary, specificMuscle, specificSecondaryMuscles);
    });
  }, [skinnedMeshes, regionsByMesh, primary, secondary, specificMuscle, specificSecondaryMuscles]);

  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={cloned} />
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
    const targetTheta = view === "front" ? 0 : Math.PI;
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
        minDistance={1.2}
        maxDistance={4}
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
          <span className="h-2.5 w-2.5" style={{ backgroundColor: HOLO_BASE }} /> Not worked
        </span>
      </div>
    </div>
  );
}
