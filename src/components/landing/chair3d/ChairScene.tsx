"use client";

import { ContactShadows, Environment, Lightformer, PresentationControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChairModel } from "./ChairModel";
import type { Program } from "./programs";

type ChairSceneProps = {
  program: Program;
  still: boolean;
  /** Mostrado se o navegador não tiver WebGL. */
  fallback: ReactNode;
};

/**
 * Palco da cadeira 3D.
 *
 * <p>
 * A luz é um estúdio montado com {@code Lightformer}s dentro do próprio
 * {@code Environment}: nada de HDR baixado de CDN, que travaria a cena em rede
 * corporativa e no WebView do app. Três softboxes quentes e um recorte cobre
 * por trás desenham o contorno do couro preto, que de outro modo some no fundo
 * escuro.
 *
 * <p>
 * Fora da tela o laço de render para ({@code frameloop="never"}): a landing é
 * longa e não faz sentido a GPU desenhar uma cadeira que ninguém está vendo.
 */
export function ChairScene({ program, still, fallback }: ChairSceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "120px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [2.3, 0.7, 2.5], fov: 30 }}
        frameloop={visible ? "always" : "never"}
        fallback={<div className="relative h-full w-full">{fallback}</div>}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 5, 2]} intensity={1.6} />

        <PresentationControls
          global={false}
          cursor
          snap
          speed={1.4}
          rotation={[0, -0.35, 0]}
          polar={[-0.1, 0.18]}
          azimuth={[-0.9, 0.9]}
        >
          <group position={[0, -0.05, 0]}>
            <ChairModel program={program} still={still} />
          </group>
        </PresentationControls>

        <ContactShadows position={[0, -0.6, 0]} opacity={0.65} scale={4} blur={2.6} far={1.2} color="#000" />

        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.2} color="#ffe2c4" position={[0, 3, 2]} scale={[4, 1.2, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#ffd2a6" position={[3, 1, 1]} rotation-y={-Math.PI / 2} scale={[3, 1, 1]} />
          <Lightformer form="rect" intensity={0.9} color="#ffffff" position={[-3, 1.2, 1]} rotation-y={Math.PI / 2} scale={[2, 1, 1]} />
          {/* Recorte cobre por trás: o contorno que separa a cadeira do fundo. */}
          <Lightformer form="ring" intensity={3} color="#c2793c" position={[-1.5, 1.5, -3]} scale={2} />
        </Environment>
      </Canvas>
    </div>
  );
}
