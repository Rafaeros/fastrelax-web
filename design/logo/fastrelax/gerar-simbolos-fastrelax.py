"""Símbolos fastrelax (conceitos D, E, F). Geometria em viewBox 256."""
import math, os
OUT = os.path.dirname(os.path.abspath(__file__))
def svg(body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">{body}</svg>\n'
def poly_d(pts): return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"

def rounded_triangle(V, r, steps=10):
    """Polígono do triângulo com cantos em arco de raio r (amostrado)."""
    pts = []
    n = len(V)
    for i in range(n):
        P, C, N = V[i-1], V[i], V[(i+1) % n]
        u1 = ((P[0]-C[0]), (P[1]-C[1])); l1 = math.hypot(*u1); u1 = (u1[0]/l1, u1[1]/l1)
        u2 = ((N[0]-C[0]), (N[1]-C[1])); l2 = math.hypot(*u2); u2 = (u2[0]/l2, u2[1]/l2)
        th = math.acos(u1[0]*u2[0] + u1[1]*u2[1])
        d = r / math.tan(th/2)
        bis = (u1[0]+u2[0], u1[1]+u2[1]); lb = math.hypot(*bis); bis = (bis[0]/lb, bis[1]/lb)
        ctr = (C[0] + bis[0]*r/math.sin(th/2), C[1] + bis[1]*r/math.sin(th/2))
        a1 = math.atan2(C[1]+u1[1]*d-ctr[1], C[0]+u1[0]*d-ctr[0])
        a2 = math.atan2(C[1]+u2[1]*d-ctr[1], C[0]+u2[0]*d-ctr[0])
        da = (a2 - a1 + math.pi) % (2*math.pi) - math.pi
        for k in range(steps+1):
            a = a1 + da*k/steps
            pts.append((ctr[0] + r*math.cos(a), ctr[1] + r*math.sin(a)))
    return pts

def cubic(p0, p1, p2, p3, n=48):
    return [tuple((1-t)**3*a + 3*(1-t)**2*t*b + 3*(1-t)*t**2*c + t**3*d for a, b, c, d in zip(p0, p1, p2, p3))
            for t in (i/n for i in range(n+1))]

def clip(subject, clipper):
    """Sutherland–Hodgman: recorta `subject` (qualquer) pelo polígono convexo `clipper`."""
    def inside(p, a, b): return (b[0]-a[0])*(p[1]-a[1]) - (b[1]-a[1])*(p[0]-a[0]) <= 0
    def inter(p, q, a, b):
        x1, y1, x2, y2, x3, y3, x4, y4 = *p, *q, *a, *b
        den = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)
        t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / den
        return (x1 + t*(x2-x1), y1 + t*(y2-y1))
    out = subject
    # garante orientação do clipper compatível com inside()
    area = sum(clipper[i][0]*clipper[(i+1)%len(clipper)][1] - clipper[(i+1)%len(clipper)][0]*clipper[i][1] for i in range(len(clipper)))
    if area > 0: clipper = clipper[::-1]
    for i in range(len(clipper)):
        a, b = clipper[i], clipper[(i+1) % len(clipper)]
        inp, out = out, []
        for j in range(len(inp)):
            p, q = inp[j-1], inp[j]
            if inside(q, a, b):
                if not inside(p, a, b): out.append(inter(p, q, a, b))
                out.append(q)
            elif inside(p, a, b): out.append(inter(p, q, a, b))
    return out

# ---------------- D · Iniciar: play cortado pela onda
TRI = rounded_triangle([(58, 40), (58, 216), (210, 128)], r=28)
G = 9  # meio vão
wave = lambda dy: cubic((10, 146+dy), (96, 206+dy), (124, 52+dy), (246, 112+dy))  # S marcado, meio da curva no centro do play
top_region = wave(-G) + [(246, -20), (10, -20)]
bot_region = wave(+G) + [(246, 280), (10, 280)]
top = clip(top_region, TRI); bot = clip(bot_region, TRI)
open(f"{OUT}/d-iniciar.svg", "w").write(svg(f'<path d="{poly_d(top)}" fill="#000"/><path d="{poly_d(bot)}" fill="#000"/>'))

# ---------------- E · fr: um traço faz o f e continua como o ombro do r
W = 30
f_stem = "M84 226 V96 C84 60 104 40 138 40 C152 40 162 44 170 50"           # haste + gancho do f
bridge = "M44 120 H150 C174 120 190 112 214 100"                          # barra do f → ombro curto do r (sobe pouco: lê r, não f)
r_stem = "M150 226 V124"                                                   # haste do r
open(f"{OUT}/e-fr.svg", "w").write(svg(
    f'<g fill="none" stroke="#000" stroke-width="{W}" stroke-linecap="round" stroke-linejoin="round">'
    f'<path d="{f_stem}"/><path d="{bridge}"/><path d="{r_stem}"/></g>'))

# ---------------- F · Avança e desacelera: chevron afiado + chevron que vira curva
W2 = 30
sharp = "M44 56 L116 128 L44 200"   # 45° exatos
soft = "M128 56 C196 94 196 162 128 200"
open(f"{OUT}/f-desacelera.svg", "w").write(svg(
    f'<path d="{sharp}" fill="none" stroke="#000" stroke-width="{W2}" stroke-linecap="butt" stroke-linejoin="miter"/>'
    f'<path d="{soft}" fill="none" stroke="#000" stroke-width="{W2}" stroke-linecap="round"/>'))
print("ok", len(top), len(bot))

# ---------------- variantes: preto, cor sem fundo, avatar com fundo
import sys
DEST = sys.argv[1] if len(sys.argv) > 1 else OUT
CU, AU, BG = "#C2793C", "#E0B360", "#0F0C08"
def tile(inner):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="{BG}"/>'
            f'<g transform="translate(35.84 35.84) scale(0.72)">{inner}</g></svg>\n')
def d_body(c1, c2): return f'<path d="{poly_d(top)}" fill="{c1}"/><path d="{poly_d(bot)}" fill="{c2}"/>'
def e_body(c1, c2):
    st = f'fill="none" stroke-width="{W}" stroke-linecap="round" stroke-linejoin="round"'
    return f'<path d="{f_stem}" {st} stroke="{c1}"/><path d="{r_stem}" {st} stroke="{c1}"/><path d="{bridge}" {st} stroke="{c2}"/>'
def f_body(c1, c2):
    return (f'<path d="{sharp}" fill="none" stroke="{c1}" stroke-width="{W2}" stroke-linecap="butt" stroke-linejoin="miter"/>'
            f'<path d="{soft}" fill="none" stroke="{c2}" stroke-width="{W2}" stroke-linecap="round"/>')
for key, body in [("d-iniciar", d_body), ("e-fr", e_body), ("f-desacelera", f_body)]:
    open(f"{DEST}/{key}-preto.svg", "w").write(svg(body("#000", "#000")))
    open(f"{DEST}/{key}-cor-sem-fundo.svg", "w").write(svg(body(CU, AU)))
    open(f"{DEST}/{key}-avatar-com-fundo.svg", "w").write(tile(body(CU, AU)))
