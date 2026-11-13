/**
 * Programas de sessão mostrados na landing.
 *
 * Fonte única para o seletor do hero (que reclina a cadeira 3D), para a seção
 * de programas e para o vídeo do app. `pose` é o que a cadeira 3D faz quando o
 * programa é escolhido; `zone` é o trecho do encosto onde os pulsos de massagem
 * correm, em fração da altura do encosto (0 = quadril, 1 = topo).
 */
export type ProgramId = "relax" | "shiatsu" | "zeroGravity";

export type ChairPose = {
  /** Inclinação do berço inteiro (assento + encosto + pernas), em radianos. */
  tilt: number;
  /** Reclínio extra do encosto em relação ao assento. */
  back: number;
  /** Elevação do apoio de pernas. */
  legs: number;
};

export type Program = {
  id: ProgramId;
  name: string;
  minutes: number;
  focus: string;
  intensity: string;
  description: string;
  pose: ChairPose;
  zone: [number, number];
  /** Pulsos também no apoio de pernas (massagem de corpo inteiro). */
  legPulses: boolean;
};

export const PROGRAMS: Program[] = [
  {
    id: "relax",
    name: "Relax Express",
    minutes: 10,
    focus: "Pescoço e ombros",
    intensity: "Leve",
    description: "Pausa curta para a cervical, entre uma reunião e outra.",
    pose: { tilt: 0.04, back: 0.2, legs: 0.22 },
    zone: [0.62, 0.95],
    legPulses: false,
  },
  {
    id: "shiatsu",
    name: "Shiatsu Profundo",
    minutes: 20,
    focus: "Lombar",
    intensity: "Média",
    description: "Pressão progressiva na coluna para quem passa o dia sentado.",
    pose: { tilt: 0.12, back: 0.36, legs: 0.55 },
    zone: [0.12, 0.5],
    legPulses: false,
  },
  {
    id: "zeroGravity",
    name: "Zero Gravity",
    minutes: 30,
    focus: "Corpo inteiro",
    intensity: "Alta",
    description: "Reclínio total, pernas acima do coração, massagem da nuca aos pés.",
    pose: { tilt: 0.3, back: 0.5, legs: 1.05 },
    zone: [0.08, 0.95],
    legPulses: true,
  },
];

/** Pose de entrada: a cadeira começa em pé e reclina até o programa escolhido. */
export const UPRIGHT_POSE: ChairPose = { tilt: 0, back: 0.08, legs: 0 };
