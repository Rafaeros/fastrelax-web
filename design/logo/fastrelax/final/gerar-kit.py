"""Kit final da marca fastrelax: símbolo D · Iniciar (play cortado pela onda).

Geometria exata, sem pontos amostrados no arquivo final:
- o play é um triângulo com cantos em arco de verdade (comandos A do SVG);
- a onda é UMA cúbica; as bordas do corte são offsets dela na normal (vão
  constante, medido perpendicular à curva), ajustados por mínimos quadrados
  em outra cúbica;
- cada peça = trecho da onda entre as duas interseções + o contorno do play.

Uso: python3 gerar-kit.py   (escreve tudo nesta pasta)
O wordmark vem de wordmark-urw-gothic-demi.json (contorno da URW Gothic Demi,
"fastrelax", tracking -18/1000), gerado com opentype.js.
"""
import json, math, os

OUT = os.path.dirname(os.path.abspath(__file__))

# Paleta
COBRE, OURO, ESCURO, CLARO = "#C2793C", "#E0B360", "#0F0C08", "#F5F1EA"
COBRE_ESCURO = "#824A22"  # par do cobre em fundo claro (o ouro some no branco)


# ---------------------------------------------------------------- geometria
def sub(a, b): return (a[0] - b[0], a[1] - b[1])
def add(a, b): return (a[0] + b[0], a[1] + b[1])
def mul(a, k): return (a[0] * k, a[1] * k)
def norm(a):
    l = math.hypot(*a); return (a[0] / l, a[1] / l)
def dot(a, b): return a[0] * b[0] + a[1] * b[1]


class RoundedTriangle:
    """Triângulo com cantos em arco. Contorno = arco0, reta, arco1, reta, arco2, reta."""

    def __init__(self, V, r):
        self.r = r
        self.corners = []  # (t_in, t_out, centro)
        n = len(V)
        for i in range(n):
            P, C, N = V[i - 1], V[i], V[(i + 1) % n]
            u1, u2 = norm(sub(P, C)), norm(sub(N, C))
            th = math.acos(dot(u1, u2))
            d = r / math.tan(th / 2)
            bis = norm(add(u1, u2))
            ctr = add(C, mul(bis, r / math.sin(th / 2)))
            self.corners.append((add(C, mul(u1, d)), add(C, mul(u2, d)), ctr))
        # elementos do contorno em ordem, com comprimento (para parametrizar por s)
        self.el = []
        for i in range(n):
            ti, to, c = self.corners[i]
            a1 = math.atan2(ti[1] - c[1], ti[0] - c[0])
            a2 = math.atan2(to[1] - c[1], to[0] - c[0])
            da = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi
            self.el.append(("arc", c, a1, da, abs(da) * r))
            nxt = self.corners[(i + 1) % n][0]
            self.el.append(("line", to, nxt, math.hypot(*sub(nxt, to))))
        self.L = sum(e[-1] for e in self.el)
        self.inner = [c for _, _, c in self.corners]

    def inside(self, p):
        """Soma de Minkowski (triângulo dos centros ⊕ disco r)."""
        A = self.inner
        s = [((A[(i + 1) % 3][0] - A[i][0]) * (p[1] - A[i][1]) - (A[(i + 1) % 3][1] - A[i][1]) * (p[0] - A[i][0])) for i in range(3)]
        if all(x >= 0 for x in s) or all(x <= 0 for x in s):
            return True
        for i in range(3):
            a, b = A[i], A[(i + 1) % 3]
            ab = sub(b, a); t = max(0, min(1, dot(sub(p, a), ab) / dot(ab, ab)))
            if math.hypot(*sub(p, add(a, mul(ab, t)))) <= self.r:
                return True
        return False

    def point_at(self, s):
        s %= self.L
        for e in self.el:
            if s <= e[-1] + 1e-9:
                if e[0] == "line":
                    return add(e[1], mul(sub(e[2], e[1]), s / e[3]))
                _, c, a1, da, l = e
                a = a1 + da * s / l
                return (c[0] + self.r * math.cos(a), c[1] + self.r * math.sin(a))
            s -= e[-1]

    def locate(self, p):
        """s do ponto do contorno mais próximo de p."""
        best, s0 = (1e9, 0), 0
        for e in self.el:
            if e[0] == "line":
                ab = sub(e[2], e[1]); t = max(0, min(1, dot(sub(p, e[1]), ab) / dot(ab, ab)))
                q = add(e[1], mul(ab, t)); cand = (math.hypot(*sub(p, q)), s0 + t * e[3])
            else:
                _, c, a1, da, l = e
                a = math.atan2(p[1] - c[1], p[0] - c[0])
                t = ((a - a1) / da) if da else 0
                t = max(0, min(1, t))
                q = (c[0] + self.r * math.cos(a1 + da * t), c[1] + self.r * math.sin(a1 + da * t))
                cand = (math.hypot(*sub(p, q)), s0 + t * l)
            best = min(best, cand)
            s0 += e[-1]
        return best[1]

    def path(self, s1, s2, fmt, forward=True):
        """Segmentos SVG do contorno de s1 a s2 (sem o M inicial)."""
        span = (s2 - s1) % self.L if forward else (s1 - s2) % self.L
        sign = 1 if forward else -1
        # limites dos elementos (em s desenrolado) que caem dentro do percurso
        cuts, acc = [], 0
        for e in self.el:
            acc += e[-1]
            for k in (-1, 0, 1):
                b = acc + k * self.L
                if 1e-6 < sign * (b - s1) < span - 1e-6:
                    cuts.append(sign * (b - s1))
        cuts = sorted(set(round(c, 9) for c in cuts)) + [span]
        out, prev = [], 0
        for c in cuts:
            mid = (s1 + sign * (prev + c) / 2) % self.L
            acc = 0
            for e in self.el:
                if mid <= acc + e[-1]: break
                acc += e[-1]
            end = self.point_at(s1 + sign * c)
            if e[0] == "line":
                out.append(f"L{fmt(end)}")
            else:
                sweep = 1 if (e[3] > 0) == forward else 0
                out.append(f"A{self.r:g} {self.r:g} 0 0 {sweep} {fmt(end)}")
            prev = c
        return out


def bez(P, t):
    a, b, c, d = P
    u = 1 - t
    return tuple(u ** 3 * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t ** 3 * d[i] for i in range(2))

def bez_d(P, t):
    a, b, c, d = P
    u = 1 - t
    return tuple(3 * u * u * (b[i] - a[i]) + 6 * u * t * (c[i] - b[i]) + 3 * t * t * (d[i] - c[i]) for i in range(2))

def split(P, t0, t1):
    """Trecho [t0, t1] de uma cúbica, como outra cúbica (de Casteljau duas vezes)."""
    def left(P, t):
        a, b, c, d = P
        ab, bc, cd = add(a, mul(sub(b, a), t)), add(b, mul(sub(c, b), t)), add(c, mul(sub(d, c), t))
        abc, bcd = add(ab, mul(sub(bc, ab), t)), add(bc, mul(sub(cd, bc), t))
        m = add(abc, mul(sub(bcd, abc), t))
        return (a, ab, abc, m), (m, bcd, cd, d)
    _, right = left(P, t0)
    l, _ = left(right, (t1 - t0) / (1 - t0))
    return l

def offset_cubic(P, g):
    """Cúbica que aproxima o offset normal de P a distância g (+ = para cima)."""
    N = 240
    def off(t):
        tx, ty = norm(bez_d(P, t)); p = bez(P, t)
        return (p[0] + ty * g, p[1] - tx * g)
    pts = [off(i / N) for i in range(N + 1)]
    p0, p3 = pts[0], pts[-1]
    T0, T3 = norm(bez_d(P, 0)), norm(bez_d(P, 1))
    # parametrização por comprimento de corda, refinada por Newton algumas vezes
    ch = [0]
    for i in range(1, len(pts)): ch.append(ch[-1] + math.hypot(*sub(pts[i], pts[i - 1])))
    ts = [c / ch[-1] for c in ch]
    for _ in range(6):
        # mínimos quadrados em (a, b): P1 = p0 + a T0, P2 = p3 - b T3
        A11 = A12 = A22 = B1 = B2 = 0
        for t, q in zip(ts, pts):
            u = 1 - t
            b1, b2 = 3 * u * u * t, 3 * u * t * t
            base = add(mul(p0, u ** 3 + b1), mul(p3, b2 + t ** 3))
            r = sub(q, base)
            v1, v2 = mul(T0, b1), mul(T3, -b2)
            A11 += dot(v1, v1); A12 += dot(v1, v2); A22 += dot(v2, v2)
            B1 += dot(v1, r); B2 += dot(v2, r)
        det = A11 * A22 - A12 * A12
        a = (B1 * A22 - B2 * A12) / det; b = (A11 * B2 - A12 * B1) / det
        Q = (p0, add(p0, mul(T0, a)), sub(p3, mul(T3, b)), p3)
        new = []
        for t, q in zip(ts, pts):  # reparametriza: ponto mais próximo
            for _ in range(3):
                d = sub(bez(Q, t), q); dd = bez_d(Q, t)
                t = min(1, max(0, t - dot(d, dd) / (dot(dd, dd) + 1e-9)))
            new.append(t)
        ts = new
    err = max(math.hypot(*sub(bez(Q, t), q)) for t, q in zip(ts, pts))
    return Q, err

def crossings(Q, shape):
    """Parâmetros t onde a cúbica entra/sai do play (bissecção)."""
    N, ts = 800, []
    prev = shape.inside(bez(Q, 0))
    for i in range(1, N + 1):
        cur = shape.inside(bez(Q, i / N))
        if cur != prev:
            a, b = (i - 1) / N, i / N
            for _ in range(40):
                m = (a + b) / 2
                if shape.inside(bez(Q, m)) == prev: a = m
                else: b = m
            ts.append((a + b) / 2)
        prev = cur
    return ts


def build_symbol(r=28, gap=9.0, dx=0.0):
    """Devolve (peça_de_cima, peça_de_baixo, bbox) como strings de path."""
    V = [(58 + dx, 40), (58 + dx, 216), (210 + dx, 128)]
    tri = RoundedTriangle(V, r)
    W = ((10 + dx, 146), (96 + dx, 206), (124 + dx, 52), (246 + dx, 112))
    fmt = lambda p: f"{p[0]:.2f} {p[1]:.2f}".replace(".00", "")
    pieces, errs = [], []
    for sign, corner in ((+1, 0), (-1, 1)):  # +1 = borda de cima (peça superior, canto 0)
        Q, err = offset_cubic(W, sign * gap); errs.append(err)
        ts = crossings(Q, tri)
        assert len(ts) == 2, ts
        seg = split(Q, ts[0], ts[1])
        E, X = seg[0], seg[3]
        sE, sX = tri.locate(E), tri.locate(X)
        # escolhe o sentido do contorno que passa pelo canto certo
        # ponto do contorno que sempre pertence à peça: meio do arco do canto
        # superior (peça de cima) ou meio da aresta de baixo (peça de baixo)
        lens = [e[-1] for e in tri.el]
        c_mid = lens[0] / 2 if corner == 0 else sum(lens[:3]) + lens[3] / 2
        fwd_has = ((c_mid - sX) % tri.L) < ((sE - sX) % tri.L)
        d = f"M{fmt(E)}C{fmt(seg[1])} {fmt(seg[2])} {fmt(X)}" + "".join(tri.path(sX, sE, fmt, forward=fwd_has)) + "Z"
        pieces.append(d)
    # bbox do play (para lockups): amostra o contorno
    pts = [tri.point_at(tri.L * i / 2000) for i in range(2000)]
    bbox = (min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts))
    centroid = tuple(sum(v[i] for v in V) / 3 for i in range(2))
    return pieces, bbox, centroid, max(errs)


# Centralização óptica: o play tem a massa à esquerda. Meio-termo entre centrar
# a caixa e centrar o centróide, como se faz em ícones de play.
_, bb0, cen0, _ = build_symbol()
box_cx = (bb0[0] + bb0[2]) / 2
DX = 128 - (box_cx + cen0[0]) / 2
SYM, BBOX, _, ERR = build_symbol(dx=DX)
# Corte pequeno (16–32 px): vão maior e cantos mais redondos para o vão não fechar.
SYM_S, _, _, ERR_S = build_symbol(r=32, gap=14, dx=DX)


# ---------------------------------------------------------------- arquivos
def svg(vb, body, title="fastrelax"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')

def sym_body(c1, c2, pieces=SYM):
    return f'<path fill="{c1}" d="{pieces[0]}"/><path fill="{c2}" d="{pieces[1]}"/>'

def tile_body(c1, c2, bg, pieces=SYM, fill=0.58):
    """Avatar: o play escalado pelo centro do canvas até a altura dele ser `fill` do quadrado."""
    k = fill * 256 / (BBOX[3] - BBOX[1])
    return (f'<rect width="256" height="256" rx="56" fill="{bg}"/>'
            f'<g transform="translate(128 128) scale({k:.4f}) translate(-128 -128)">{sym_body(c1, c2, pieces)}</g>')

WM = json.load(open(os.path.join(OUT, "wordmark-urw-gothic-demi.json")))
WB = WM["bbox"]  # unidades: 1000 = 1 em; baseline em y=0

def lockup_horizontal(c1, c2, ink):
    """Símbolo + wordmark; altura-x = 50 % da altura do play; vão = metade da altura-x."""
    x0, y0, x1, y1 = BBOX
    h = y1 - y0
    k = (0.5 * h) / WM["xheight"]
    gapx = 0.5 * 0.5 * h
    tx = x1 + gapx - WB["x1"] * k
    cy = (y0 + y1) / 2
    ty = cy - ((WB["y1"] + WB["y2"]) / 2) * k  # centra a caixa ascendente–baseline
    right = tx + WB["x2"] * k
    pad = 0
    vb = f"{x0 - pad:.2f} {y0 - pad:.2f} {right - x0 + 2 * pad:.2f} {h + 2 * pad:.2f}"
    body = sym_body(c1, c2) + f'<path fill="{ink}" transform="translate({tx:.2f} {ty:.2f}) scale({k:.5f})" d="{WM["d"]}"/>'
    return svg(vb, body), (right - x0) / h

def lockup_empilhado(c1, c2, ink):
    x0, y0, x1, y1 = BBOX
    h = y1 - y0
    k = (0.34 * h) / WM["xheight"]
    ww = (WB["x2"] - WB["x1"]) * k
    cx = (x0 + x1) / 2
    top_text = y1 + 0.28 * h  # vão entre o play e o topo das ascendentes
    ty = top_text - WB["y1"] * k
    tx = 128 - ww / 2 - WB["x1"] * k
    left, right = min(x0, tx + WB["x1"] * k), max(x1, tx + WB["x2"] * k)
    bottom = ty + WB["y2"] * k
    vb = f"{left:.2f} {y0:.2f} {right - left:.2f} {bottom - y0:.2f}"
    body = sym_body(c1, c2) + f'<path fill="{ink}" transform="translate({tx:.2f} {ty:.2f}) scale({k:.5f})" d="{WM["d"]}"/>'
    return svg(vb, body)

def wordmark(ink):
    vb = f"{WB['x1']} {WB['y1']} {WB['x2'] - WB['x1']} {WB['y2'] - WB['y1']}"
    return svg(vb, f'<path fill="{ink}" d="{WM["d"]}"/>')

files = {
    # símbolo sem fundo
    "simbolo-preto.svg": svg("0 0 256 256", sym_body("#000", "#000")),
    "simbolo-branco.svg": svg("0 0 256 256", sym_body("#FFF", "#FFF")),
    "simbolo-cor.svg": svg("0 0 256 256", sym_body(COBRE, OURO)),            # fundo escuro
    "simbolo-cor-fundo-claro.svg": svg("0 0 256 256", sym_body(COBRE, COBRE_ESCURO)),
    "simbolo-pequeno-preto.svg": svg("0 0 256 256", sym_body("#000", "#000", SYM_S)),
    "simbolo-pequeno-cor.svg": svg("0 0 256 256", sym_body(COBRE, OURO, SYM_S)),
    # avatar com fundo
    "avatar.svg": svg("0 0 256 256", tile_body(COBRE, OURO, ESCURO)),
    "avatar-cobre.svg": svg("0 0 256 256", tile_body(ESCURO, "#3B2010", COBRE)),
    "avatar-pequeno.svg": svg("0 0 256 256", tile_body(COBRE, OURO, ESCURO, SYM_S, 0.64)),
    # ícones: quadrado sem cantos (iOS e Android aplicam a máscara deles) e
    # maskable com o play dentro da zona segura de 80 %
    "icone-quadrado.svg": svg("0 0 256 256", tile_body(COBRE, OURO, ESCURO, fill=0.58).replace('rx="56" ', '')),
    "icone-maskable.svg": svg("0 0 256 256", tile_body(COBRE, OURO, ESCURO, fill=0.46).replace('rx="56" ', '')),
    # wordmark e lockups
    "wordmark-claro.svg": wordmark(CLARO),
    "wordmark-escuro.svg": wordmark(ESCURO),
    "logo-horizontal.svg": lockup_horizontal(COBRE, OURO, CLARO)[0],          # fundo escuro
    "logo-horizontal-fundo-claro.svg": lockup_horizontal(COBRE, COBRE_ESCURO, ESCURO)[0],
    "logo-horizontal-preto.svg": lockup_horizontal("#000", "#000", "#000")[0],
    "logo-horizontal-branco.svg": lockup_horizontal("#FFF", "#FFF", "#FFF")[0],
    "logo-empilhado.svg": lockup_empilhado(COBRE, OURO, CLARO),
    "logo-empilhado-fundo-claro.svg": lockup_empilhado(COBRE, COBRE_ESCURO, ESCURO),
}
for name, content in files.items():
    open(os.path.join(OUT, name), "w").write(content)

ratio = lockup_horizontal(COBRE, OURO, CLARO)[1]
print(f"dx óptico={DX:.2f}  erro offset={ERR:.3f}/{ERR_S:.3f}  proporção horizontal={ratio:.4f}")
