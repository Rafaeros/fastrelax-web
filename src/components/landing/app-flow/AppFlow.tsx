import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "@/config/brand";

/*
 * Composição Remotion: o fluxo do app do colaborador em quatro cenas, do jeito
 * que as telas reais funcionam (mesmos rótulos do portal: "Escolha o dia",
 * "Sua próxima massagem", "Iniciar agora", "Sessão em andamento").
 *
 * Tocada na landing pelo <Player>; a mesma composição pode virar MP4 com
 * `npx remotion render` para redes sociais.
 */

export const APP_FLOW = {
  fps: 30,
  width: 390,
  height: 800,
  /** Quadros por cena. Quatro cenas = 14 s. */
  scene: 105,
  scenes: 4,
} as const;

export const APP_FLOW_DURATION = APP_FLOW.scene * APP_FLOW.scenes;

const C = {
  bg: "#0F0C08",
  card: "#211C15",
  raised: "#2E2820",
  line: "#443A2C",
  ink: "#F5F1EA",
  ink2: "#A89C8A",
  ink3: "#837763",
  copper: "#C2793C",
  copperSoft: "#DFA066",
  onCopper: "#3B2010",
  success: "#7BC08D",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Toque de dedo: um anel que abre e some. Vai como filho do elemento tocado
 * (que precisa de position relative) e se centraliza nele — nada de
 * coordenadas fixas que desalinham quando o layout da tela muda.
 */
function Tap({ at }: { at: number }) {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 18) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 44,
        height: 44,
        marginLeft: -22,
        marginTop: -22,
        borderRadius: 999,
        border: `2px solid ${C.copperSoft}`,
        background: "rgba(223,160,102,0.18)",
        pointerEvents: "none",
        scale: interpolate(frame, [at, at + 18], [0.4, 1.5], { ...clamp, easing: outExpo }),
        opacity: interpolate(frame, [at, at + 18], [0.9, 0], clamp),
      }}
    />
  );
}

/** Abas do portal do colaborador (as mesmas rotas de /colaborador). */
const TABS = ["Início", "Agenda", "Notificações", "Perfil"] as const;

function Screen({ title, tab, children }: { title: string; tab: (typeof TABS)[number]; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: C.bg, color: C.ink, fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 26px 0", fontSize: 13, color: C.ink2 }}>
        <span>14:20</span>
        <span>5G</span>
      </div>
      <div style={{ padding: "22px 24px 0", fontSize: 26, fontFamily: "var(--font-display-serif), serif" }}>{title}</div>
      <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: "14px 10px 26px",
          borderTop: `1px solid ${C.line}`,
          background: "#17130D",
          fontSize: 12,
        }}
      >
        {TABS.map((t) => (
          <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: t === tab ? C.copperSoft : C.ink3 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${t === tab ? C.copperSoft : C.ink3}` }} />
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

const label: CSSProperties = { fontSize: 13, color: C.ink2, marginBottom: 10 };

/* ---------------------------------------------------------------- Cena 1 */
function BookScene() {
  const frame = useCurrentFrame();
  const days = [
    ["Seg", "10"],
    ["Ter", "11"],
    ["Qua", "12"],
    ["Qui", "13"],
    ["Sex", "14"],
  ];
  const slots = ["08:30", "09:00", "10:30", "11:00", "13:30", "14:30", "15:00", "16:30", "17:00"];
  const daySelected = frame >= 14;
  const slotSelected = frame >= 42;
  const pressed = frame >= 72 && frame < 80;
  const confirmed = frame >= 80;

  return (
    <Screen title="Agendar" tab="Agenda">
      <div>
        <div style={label}>Escolha o dia</div>
        <div style={{ display: "flex", gap: 8 }}>
          {days.map(([d, n], i) => {
            const on = daySelected && i === 2;
            return (
              <div
                key={d}
                style={{
                  position: "relative",
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 12,
                  textAlign: "center",
                  background: on ? C.copper : C.card,
                  color: on ? C.onCopper : C.ink,
                  border: `1px solid ${on ? C.copper : C.line}`,
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.8 }}>{d}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{n}</div>
                {i === 2 && <Tap at={14} />}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={label}>Escolha o horário</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {slots.map((s, i) => {
            const on = slotSelected && s === "14:30";
            const busy = i === 1 || i === 3 || i === 7;
            return (
              <div
                key={s}
                style={{
                  position: "relative",
                  padding: "11px 0",
                  borderRadius: 10,
                  textAlign: "center",
                  fontSize: 15,
                  background: on ? C.copper : busy ? "transparent" : C.card,
                  color: on ? C.onCopper : busy ? C.ink3 : C.ink,
                  border: `1px solid ${on ? C.copper : C.line}`,
                  textDecoration: busy ? "line-through" : "none",
                  opacity: interpolate(frame, [i * 2, i * 2 + 10], [0, 1], clamp),
                }}
              >
                {s}
                {s === "14:30" && <Tap at={42} />}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={label}>Escolha a cadeira</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Cadeira 1", "Cadeira 2"].map((c, i) => (
            <div
              key={c}
              style={{
                position: "relative",
                flex: 1,
                padding: "12px 14px",
                borderRadius: 12,
                background: C.card,
                border: `1px solid ${i === 1 && frame >= 58 ? C.copper : C.line}`,
                fontSize: 14,
              }}
            >
              {c}
              <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>3º andar</div>
              {i === 1 && <Tap at={58} />}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 6,
          padding: "15px 0",
          borderRadius: 12,
          textAlign: "center",
          fontWeight: 700,
          fontSize: 16,
          background: confirmed ? C.raised : C.copper,
          color: confirmed ? C.success : C.onCopper,
          scale: pressed ? 0.97 : 1,
        }}
      >
        {confirmed ? "Massagem agendada para 12/11, 14:30" : "Confirmar"}
        <Tap at={72} />
      </div>

    </Screen>
  );
}

/* ---------------------------------------------------------------- Cena 2 */
function ReminderScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: frame - 18, fps, config: { damping: 16, stiffness: 140 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 70% at 50% 0%, #3B2010 0%, ${C.bg} 70%)`,
        color: C.ink,
        fontFamily: "var(--font-geist-sans), sans-serif",
        alignItems: "center",
      }}
    >
      <div style={{ marginTop: 120, fontSize: 84, fontWeight: 300, letterSpacing: -2 }}>14:20</div>
      <div style={{ fontSize: 16, color: C.ink2 }}>quinta-feira, 12 de novembro</div>

      <div
        style={{
          marginTop: 56,
          width: 342,
          padding: 16,
          borderRadius: 20,
          background: "rgba(46,40,32,0.92)",
          border: `1px solid ${C.line}`,
          translate: `0px ${interpolate(drop, [0, 1], [-260, 0])}px`,
          opacity: drop,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.ink2 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: C.copper }} />
          {brand.name}
          <span style={{ marginLeft: "auto" }}>agora</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600 }}>Sua próxima massagem é em 10 min</div>
        <div style={{ marginTop: 4, fontSize: 14, color: C.ink2 }}>Cadeira 2, 3º andar. Hoje às 14:30.</div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------------------------------------------------------------- Cena 3 */
function StartScene() {
  const frame = useCurrentFrame();
  const starting = frame >= 38 && frame < 70;
  const running = frame >= 70;
  const spin = interpolate(frame, [38, 70], [0, 720], clamp);

  return (
    <Screen title="Início" tab="Início">
      <div style={{ padding: 20, borderRadius: 18, background: C.card, border: `1px solid ${running ? C.copper : C.line}` }}>
        <div style={{ fontSize: 13, color: C.ink2 }}>{running ? "Sessão em andamento" : "Sua próxima massagem"}</div>
        <div style={{ marginTop: 6, fontSize: 24, fontFamily: "var(--font-display-serif), serif" }}>Hoje, 14:30</div>
        <div style={{ marginTop: 4, fontSize: 15, color: C.ink2 }}>Zero Gravity, 30 min. Cadeira 2, 3º andar.</div>

        <div
          style={{
            position: "relative",
            marginTop: 20,
            padding: "15px 0",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 16,
            background: running ? C.raised : C.copper,
            color: running ? C.success : C.onCopper,
            scale: frame >= 32 && frame < 38 ? 0.97 : 1,
          }}
        >
          {starting && (
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                border: `2px solid ${C.onCopper}`,
                borderTopColor: "transparent",
                rotate: `${spin}deg`,
              }}
            />
          )}
          {running && <div style={{ width: 9, height: 9, borderRadius: 999, background: C.success }} />}
          {running ? "Cadeira ativa" : starting ? "Iniciando..." : "Iniciar agora"}
          <Tap at={32} />
        </div>
      </div>

      <div style={{ fontSize: 14, color: C.ink3, lineHeight: 1.5 }}>
        O botão só libera no seu horário. Fora dele, a cadeira não liga.
      </div>
    </Screen>
  );
}

/* ---------------------------------------------------------------- Cena 4 */
function SessionScene() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // 30 minutos comprimidos na cena: o anel mostra o tempo que falta.
  const progress = interpolate(frame, [0, durationInFrames], [0.04, 0.62], clamp);
  const remaining = Math.round(30 * 60 * (1 - progress));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const R = 120;
  const L = 2 * Math.PI * R;

  return (
    <Screen title="Sessão em andamento" tab="Início">
      <div style={{ display: "flex", justifyContent: "center", marginTop: 18, position: "relative" }}>
        <svg width={280} height={280} viewBox="0 0 280 280">
          <circle cx={140} cy={140} r={R} stroke={C.raised} strokeWidth={10} fill="none" />
          <circle
            cx={140}
            cy={140}
            r={R}
            stroke={C.copper}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={L}
            strokeDashoffset={L * progress}
            transform="rotate(-90 140 140)"
          />
        </svg>
        <div style={{ position: "absolute", top: 98, textAlign: "center" }}>
          <div style={{ fontSize: 54, fontWeight: 300, letterSpacing: -1 }}>
            {mm}:{ss}
          </div>
          <div style={{ fontSize: 14, color: C.ink2 }}>Zero Gravity</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", fontSize: 15, color: C.success }}>
        <div style={{ width: 9, height: 9, borderRadius: 999, background: C.success, opacity: 0.5 + 0.5 * Math.sin(frame / 5) }} />
        Cadeira 2 ativa
      </div>

      <div
        style={{
          padding: "15px 0",
          borderRadius: 12,
          textAlign: "center",
          fontWeight: 600,
          fontSize: 16,
          border: `1px solid ${C.line}`,
          color: C.ink,
        }}
      >
        Finalizar sessão
      </div>
    </Screen>
  );
}

/** Corte com leve deslize lateral entre cenas. */
function SceneIn({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, 10], [0, 1], clamp),
        translate: `${interpolate(frame, [0, 14], [24, 0], { ...clamp, easing: outExpo })}px 0px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

export function AppFlow() {
  const { scene } = APP_FLOW;
  const scenes = [BookScene, ReminderScene, StartScene, SessionScene];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {scenes.map((Scene, i) => (
        <Sequence key={i} from={i * scene} durationInFrames={scene} premountFor={10}>
          <SceneIn>
            <Scene />
          </SceneIn>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
