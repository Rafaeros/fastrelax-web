"use client";

import type { PlayerRef } from "@remotion/player";
import { Player } from "@remotion/player";
import { useEffect, useRef } from "react";
import { APP_FLOW, APP_FLOW_DURATION, AppFlow } from "./AppFlow";

export type AppFlowPlayerProps = {
  /** Toca enquanto true (seção visível e movimento permitido). */
  playing: boolean;
  /** Quadro inicial (com movimento reduzido, um quadro "pronto" da cena 1). */
  initialFrame: number;
  /** Pedido de salto: `n` muda a cada clique, mesmo para o mesmo quadro. */
  seek: { frame: number; n: number } | null;
  onSceneChange: (scene: number) => void;
};

/**
 * Player do Remotion isolado, carregado só no cliente (ver HowItWorks).
 *
 * <p>
 * O Player serializa estilos de forma diferente no servidor e no navegador
 * ({@code top: 0} contra {@code "0px"}), o que gera erro de hidratação. Como
 * ele não mostra nada útil sem JS, renderizá-lo só no cliente resolve sem
 * custo.
 */
export default function AppFlowPlayer({ playing, initialFrame, seek, onSceneChange }: AppFlowPlayerProps) {
  const player = useRef<PlayerRef>(null);

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) =>
      onSceneChange(Math.min(APP_FLOW.scenes - 1, Math.floor(e.detail.frame / APP_FLOW.scene)));
    p.addEventListener("frameupdate", onFrame);
    return () => p.removeEventListener("frameupdate", onFrame);
  }, [onSceneChange]);

  // `playing` por ref no efeito do seek: se fosse dependência, sair e voltar
  // à seção repetiria o último salto em vez de continuar de onde parou.
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
    if (playing) player.current?.play();
    else player.current?.pause();
  }, [playing]);

  useEffect(() => {
    if (!seek) return;
    player.current?.seekTo(seek.frame);
    if (playingRef.current) player.current?.play();
  }, [seek]);

  return (
    <Player
      ref={player}
      component={AppFlow}
      durationInFrames={APP_FLOW_DURATION}
      compositionWidth={APP_FLOW.width}
      compositionHeight={APP_FLOW.height}
      fps={APP_FLOW.fps}
      loop
      acknowledgeRemotionLicense
      initialFrame={initialFrame}
      controls={false}
      clickToPlay={false}
      style={{ width: "100%", aspectRatio: `${APP_FLOW.width} / ${APP_FLOW.height}` }}
    />
  );
}
