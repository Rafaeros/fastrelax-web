"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { ChairPose, Program } from "./programs";
import { UPRIGHT_POSE } from "./programs";

/*
 * Cadeira de massagem modelada com primitivas, a partir da foto do produto:
 * casco lateral preto em "C", arco cobre na lateral, encosto com canais
 * costurados, apoio de pernas com dois poços para as panturrilhas.
 *
 * Eixos: +X é a frente da cadeira, +Y é para cima, Z é a largura.
 * Tudo em metros, aproximadamente na escala real (1,5 m de comprimento).
 */

const LEATHER = "#141110";
const SHELL = "#0c0a09";
const COPPER = "#c2793c";
const COPPER_GLOW = "#ff9a4d";

/** Altura útil do encosto, usada para posicionar os pulsos na zona do programa. */
const BACK_HEIGHT = 0.92;
const PULSES_PER_CHANNEL = 5;
const CHANNELS_Z = [-0.1, 0, 0.1];

function useShellGeometry() {
  return useMemo(() => {
    // Perfil lateral do casco: sobe da base na traseira, faz a curva do braço
    // e desce pela frente — o "C" que aparece na foto.
    const s = new THREE.Shape();
    s.moveTo(-0.62, 0.12);
    s.lineTo(0.42, 0.12);
    s.bezierCurveTo(0.58, 0.14, 0.6, 0.42, 0.5, 0.58);
    s.bezierCurveTo(0.44, 0.68, 0.36, 0.7, 0.26, 0.7);
    s.lineTo(-0.3, 0.72);
    s.bezierCurveTo(-0.52, 0.74, -0.68, 0.56, -0.66, 0.34);
    s.bezierCurveTo(-0.65, 0.22, -0.66, 0.14, -0.62, 0.12);

    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 6,
      curveSegments: 32,
    });
    geometry.translate(0, 0, -0.04);
    return geometry;
  }, []);
}

function useCopperArc() {
  return useMemo(() => {
    // O arco cobre nasce rente à base, na frente, e sobe abraçando o braço.
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3, 0.15, 0),
      new THREE.Vector3(0.02, 0.24, 0),
      new THREE.Vector3(-0.18, 0.42, 0),
      new THREE.Vector3(-0.12, 0.6, 0),
      new THREE.Vector3(0.12, 0.67, 0),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.014, 12, false);
  }, []);
}

type ChairModelProps = {
  program: Program;
  /** Sem animação contínua: pose aplicada direto e pulsos parados. */
  still: boolean;
};

export function ChairModel({ program, still }: ChairModelProps) {
  const shellGeometry = useShellGeometry();
  const arcGeometry = useCopperArc();

  const cradle = useRef<THREE.Group>(null);
  const backrest = useRef<THREE.Group>(null);
  const legrest = useRef<THREE.Group>(null);
  const backPulses = useRef<THREE.InstancedMesh>(null);
  const legPulses = useRef<THREE.InstancedMesh>(null);

  // Pose atual, interpolada a cada quadro até a pose do programa. Começa em
  // pé: o primeiro reclínio é a entrada da página.
  const pose = useRef<ChairPose>({ ...(still ? program.pose : UPRIGHT_POSE) });
  const zone = useRef<[number, number]>([...program.zone]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const leather = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: LEATHER,
        roughness: 0.48,
        clearcoat: 0.55,
        clearcoatRoughness: 0.35,
        sheen: 0.4,
        sheenColor: new THREE.Color("#6b4a33"),
      }),
    [],
  );
  const shell = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: SHELL,
        roughness: 0.22,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    [],
  );
  const copper = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COPPER, metalness: 1, roughness: 0.28 }),
    [],
  );
  const pulse = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COPPER_GLOW,
        emissive: COPPER_GLOW,
        emissiveIntensity: 1.6,
        toneMapped: false,
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );

  useFrame((state, delta) => {
    const target = program.pose;
    const p = pose.current;
    // Amortecimento exponencial: independe da taxa de quadros e chega suave,
    // como o motor de reclínio de verdade (lento no fim do curso).
    const k = still ? 1000 : 2.2;
    p.tilt = THREE.MathUtils.damp(p.tilt, target.tilt, k, delta);
    p.back = THREE.MathUtils.damp(p.back, target.back, k, delta);
    p.legs = THREE.MathUtils.damp(p.legs, target.legs, k, delta);
    zone.current[0] = THREE.MathUtils.damp(zone.current[0], program.zone[0], k * 1.5, delta);
    zone.current[1] = THREE.MathUtils.damp(zone.current[1], program.zone[1], k * 1.5, delta);

    if (cradle.current) cradle.current.rotation.z = p.tilt;
    if (backrest.current) backrest.current.rotation.z = p.back;
    if (legrest.current) legrest.current.rotation.z = p.legs;

    const t = still ? 0.35 : state.clock.elapsedTime;
    const [z0, z1] = zone.current;

    // Pulsos subindo pelos canais do encosto, dentro da zona do programa.
    if (backPulses.current) {
      let i = 0;
      for (const z of CHANNELS_Z) {
        for (let n = 0; n < PULSES_PER_CHANNEL; n++) {
          // Canal do meio defasado: os roletes não sobem todos juntos.
          const phase = (t * 0.32 + n / PULSES_PER_CHANNEL + (z === 0 ? 0.1 : 0)) % 1;
          const y = 0.06 + (z0 + (z1 - z0) * phase) * BACK_HEIGHT;
          // Nasce e morre pequeno nas pontas da zona.
          const size = Math.sin(phase * Math.PI) * (z === 0 ? 0.018 : 0.013);
          dummy.position.set(0.085, y, z);
          dummy.scale.setScalar(Math.max(size, 0.0001));
          dummy.updateMatrix();
          backPulses.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      backPulses.current.instanceMatrix.needsUpdate = true;
    }

    if (legPulses.current) {
      const visible = program.legPulses ? 1 : 0;
      let i = 0;
      for (const z of [-0.13, 0.13]) {
        for (let n = 0; n < 4; n++) {
          const phase = (t * 0.4 + n / 4) % 1;
          dummy.position.set(0.15, -0.08 - phase * 0.4, z);
          dummy.scale.setScalar(Math.max(Math.sin(phase * Math.PI) * 0.016 * visible, 0.0001));
          dummy.updateMatrix();
          legPulses.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      legPulses.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[0, -0.55, 0]}>
      {/* Base em "trenó", fixa no chão. */}
      <RoundedBox args={[1.25, 0.1, 0.62]} radius={0.04} smoothness={4} position={[-0.08, 0.05, 0]} material={shell} />

      {/* Cascos laterais com o arco cobre. */}
      {[-0.43, 0.43].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={shellGeometry} material={shell} />
          <mesh
            geometry={arcGeometry}
            material={copper}
            position={[0, 0, z > 0 ? 0.066 : -0.066]}
          />
          {/* Braço acolchoado com o controle de cobre. */}
          <RoundedBox args={[0.62, 0.06, 0.14]} radius={0.028} smoothness={4} position={[-0.02, 0.75, 0]} material={leather} />
          <mesh position={[0.2, 0.79, 0]} material={copper}>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 24]} />
          </mesh>
        </group>
      ))}

      {/* Berço: assento + encosto + pernas giram juntos no eixo do quadril. */}
      <group position={[-0.05, 0.5, 0]}>
        <group ref={cradle}>
          <RoundedBox args={[0.72, 0.13, 0.7]} radius={0.05} smoothness={5} position={[0.06, 0, 0]} material={leather} />

          {/* Encosto: pivô no quadril, reclina para trás (+Z gira o topo para -X). */}
          <group ref={backrest} position={[-0.27, 0.04, 0]}>
            <RoundedBox args={[0.17, BACK_HEIGHT, 0.7]} radius={0.07} smoothness={5} position={[-0.02, BACK_HEIGHT / 2, 0]} material={leather} />
            {/* Capota do encosto, a parte rígida que envolve as costas. */}
            <RoundedBox args={[0.1, BACK_HEIGHT + 0.08, 0.78]} radius={0.045} smoothness={4} position={[-0.12, BACK_HEIGHT / 2 + 0.02, 0]} material={shell} />
            {/* Canais costurados do couro. */}
            {[-0.17, -0.05, 0.05, 0.17].map((z) => (
              <mesh key={z} position={[0.07, BACK_HEIGHT * 0.45, z]}>
                <boxGeometry args={[0.006, BACK_HEIGHT * 0.78, 0.006]} />
                <meshStandardMaterial color="#000" roughness={0.9} />
              </mesh>
            ))}
            {/* Almofada de cabeça. */}
            <RoundedBox args={[0.12, 0.2, 0.42]} radius={0.06} smoothness={5} position={[0.06, BACK_HEIGHT - 0.06, 0]} material={leather} />

            <instancedMesh
              ref={backPulses}
              args={[undefined, undefined, CHANNELS_Z.length * PULSES_PER_CHANNEL]}
              material={pulse}
            >
              <sphereGeometry args={[1, 16, 12]} />
            </instancedMesh>
          </group>

          {/* Apoio de pernas: pivô na frente do assento, sobe com +Z. */}
          <group ref={legrest} position={[0.4, -0.02, 0]}>
            {[-0.13, 0.13].map((z) => (
              <RoundedBox key={z} args={[0.18, 0.5, 0.2]} radius={0.07} smoothness={5} position={[0.06, -0.25, z]} material={leather} />
            ))}
            <RoundedBox args={[0.12, 0.52, 0.62]} radius={0.04} smoothness={4} position={[-0.02, -0.26, 0]} material={shell} />
            <RoundedBox args={[0.3, 0.09, 0.6]} radius={0.04} smoothness={4} position={[0.1, -0.52, 0]} material={shell} />

            <instancedMesh ref={legPulses} args={[undefined, undefined, 8]} material={pulse}>
              <sphereGeometry args={[1, 16, 12]} />
            </instancedMesh>
          </group>
        </group>
      </group>
    </group>
  );
}
