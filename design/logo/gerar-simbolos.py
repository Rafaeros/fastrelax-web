import math, os
OUT = os.path.dirname(os.path.abspath(__file__))
def pt(cx, cy, r, deg):
    a = math.radians(deg); return (round(cx + r*math.cos(a), 2), round(cy + r*math.sin(a), 2))
def f(p): return f"{p[0]} {p[1]}"

def split_sphere(cx=128, cy=128, r=112, gap=1.0):
    """Círculo dividido por uma onda em S que sobe da esquerda-baixo para a direita-cima.
    Duas regiões fechadas, com um vão de verdade entre elas (sem máscara)."""
    s = r/112
    # metade de cima: curva deslocada para cima; metade de baixo: para baixo
    t0, t1 = pt(cx, cy, r, 176), pt(cx, cy, r, -27)
    b0, b1 = pt(cx, cy, r, 160), pt(cx, cy, r, -12)
    tc1 = (cx + (-52)*s, cy + (58-9*gap)*s); tc2 = (cx + 20*s, cy + (-78-9*gap)*s)
    bc1 = (cx + (-44)*s, cy + (80+9*gap)*s); bc2 = (cx + 28*s, cy + (-58+9*gap)*s)
    top = f"M{f(t0)} C{f(tc1)} {f(tc2)} {f(t1)} A{r} {r} 0 0 0 {f(t0)} Z"  # 157°: arco pequeno
    bot = f"M{f(b0)} C{f(bc1)} {f(bc2)} {f(b1)} A{r} {r} 0 0 1 {f(b0)} Z"
    return top, bot

def svg(body, vb="0 0 256 256"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{body}</svg>\n'

# A — Onda
top, bot = split_sphere()
open(f"{OUT}/a-onda.svg", "w").write(svg(f'<path d="{top}" fill="#000"/><path d="{bot}" fill="#000"/>'))

# B — Onda livre: anel + fita em S que nasce fora do círculo (a "cauda" do vão
# da logo original) e termina afinando dentro dele.
ring = ("M128 16 A112 112 0 1 1 127.99 16 Z "
        "M128 38 A90 90 0 1 0 128.01 38 Z")
ribbon = ("M4 160 C70 140 92 186 140 140 C170 112 196 84 238 92 "   # borda de cima
          "C200 120 186 160 154 186 C104 226 66 172 4 160 Z")        # borda de baixo, volta afinando
open(f"{OUT}/b-onda-livre.svg", "w").write(svg(
    f'<path d="{ring}" fill="#000" fill-rule="evenodd"/><path d="{ribbon}" fill="#000"/>'))

# C — p de pausa: haste + barriga = esfera da onda
top, bot = split_sphere(cx=152, cy=114, r=88)
# haste começa na mesma altura do topo da barriga (y=26) e entra 14px nela
stem = "M38 46 a20 20 0 0 1 40 0 V226 a20 20 0 0 1 -40 0 Z"
open(f"{OUT}/c-p-pausa.svg", "w").write(svg(
    # centrado: conteúdo ia de x 38–240 e y 26–246; o centro óptico fica um pouco acima do geométrico
    f'<g transform="translate(-11 -6)"><path d="{stem}" fill="#000"/><path d="{top}" fill="#000"/><path d="{bot}" fill="#000"/></g>'))
print("ok")
