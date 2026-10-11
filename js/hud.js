/*
===============================================================================
Ecosistema Verum — HUD animado de VerumIA
Anillos inclinados con estela, marcas y partículas alrededor del logo; es la
misma animación de la pantalla de carga de VerumIA (splash), adaptada a la web.
Uso: <canvas class="hud" data-logo="img/logo-verumia.png"></canvas>
Respeta prefers-reduced-motion (dibuja un solo cuadro) y se pausa fuera de pantalla.
===============================================================================
*/
(() => {

    const PI2 = Math.PI * 2;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cada plano: radios relativos al tamaño, velocidad, sentido y color (r,g,b)
    const PLANOS = [
        { rx: .47, ry: .17,  dy: -.02, vel: .55, sentido:  1, color: '15,139,141',  grosor: 2,   estela: 1.15 },
        { rx: .37, ry: .135, dy:  .02, vel: .90, sentido: -1, color: '242,201,76',  grosor: 1.6, estela: 1.6  },
        { rx: .28, ry: .10,  dy:  .01, vel: 1.35, sentido: 1, color: '15,139,141',  grosor: 2,   estela: 1.15 },
        { rx: .42, ry: .30,  dy:  0,   vel: .25, sentido: -1, color: '93,170,255',  grosor: 1,   estela: .8, inclinacion: .9 }
    ];

    const particulas = Array.from({ length: 46 }, () => ({
        a: Math.random() * PI2,
        r: .18 + Math.random() * .32,
        v: (.05 + Math.random() * .18) * (Math.random() < .5 ? -1 : 1),
        t: .6 + Math.random() * 1.6,
        f: Math.random() * PI2
    }));

    function iniciar(lienzo) {

        const ctx = lienzo.getContext('2d');
        let ancho = 0, alto = 0, dpr = 1;
        let visible = true, inicio = null;

        const logo = new Image();
        let logoListo = false;
        logo.onload = () => { logoListo = true; };
        if (lienzo.dataset.logo) logo.src = lienzo.dataset.logo;

        function medir() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            const caja = lienzo.getBoundingClientRect();
            ancho = Math.max(200, caja.width);
            alto = Math.max(180, caja.height);
            lienzo.width = Math.round(ancho * dpr);
            lienzo.height = Math.round(alto * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function elipse(cx, cy, rx, ry, a0, a1, rot) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, rot || 0, a0, a1);
        }

        function cuadro(marca) {

            if (inicio === null) inicio = marca;
            const t = reducido ? 1.2 : (marca - inicio) / 1000;
            const lado = Math.min(ancho, alto * 1.12);
            const cx = ancho / 2, cy = alto / 2;

            ctx.clearRect(0, 0, ancho, alto);

            // Resplandor central que "respira"
            const pulso = 1 + .06 * Math.sin(t * 1.6);
            const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, lado * .42 * pulso);
            halo.addColorStop(0, 'rgba(15,139,141,.34)');
            halo.addColorStop(.55, 'rgba(15,139,141,.10)');
            halo.addColorStop(1, 'rgba(15,139,141,0)');
            ctx.fillStyle = halo;
            ctx.fillRect(0, 0, ancho, alto);

            // Marcas del anillo exterior (tipo escala de instrumento)
            const mx = lado * .50, my = lado * .185, n = 36;
            for (let i = 0; i < n; i++) {
                const a = (i / n) * PI2 + t * .08;
                const largo = i % 3 === 0 ? 12 : 7;
                ctx.beginPath();
                ctx.moveTo(cx + mx * Math.cos(a), cy + my * Math.sin(a));
                ctx.lineTo(cx + (mx + largo) * Math.cos(a), cy + (my + largo * .4) * Math.sin(a));
                ctx.strokeStyle = i % 3 === 0 ? 'rgba(242,201,76,.65)' : 'rgba(15,139,141,.5)';
                ctx.lineWidth = i % 3 === 0 ? 2 : 1.2;
                ctx.stroke();
            }

            // Anillos base + estelas tipo cometa
            PLANOS.forEach((p) => {
                const rx = lado * p.rx, ry = lado * p.ry, dy = lado * p.dy;
                const rot = p.inclinacion ? -.35 : 0;
                elipse(cx, cy + dy, rx, ry, 0, PI2, rot);
                ctx.strokeStyle = 'rgba(' + p.color + ',.16)';
                ctx.lineWidth = p.grosor;
                ctx.stroke();

                const ang = p.sentido * t * p.vel * (PI2 / 3);
                const pasos = 26;
                for (let i = 0; i < pasos; i++) {
                    const a0 = ang - ((i + 1) / pasos) * p.estela;
                    const a1 = ang - (i / pasos) * p.estela;
                    elipse(cx, cy + dy, rx, ry, a0, a1, rot);
                    ctx.strokeStyle = 'rgba(' + p.color + ',' + ((1 - i / pasos) * .9).toFixed(2) + ')';
                    ctx.lineWidth = p.grosor + 1.2;
                    ctx.stroke();
                }

                // Punto brillante en la cabeza del cometa
                const hx = cx + rx * Math.cos(ang) * Math.cos(rot) - ry * Math.sin(ang) * Math.sin(rot);
                const hy = cy + dy + rx * Math.cos(ang) * Math.sin(rot) + ry * Math.sin(ang) * Math.cos(rot);
                ctx.beginPath();
                ctx.arc(hx, hy, 3.2, 0, PI2);
                ctx.fillStyle = 'rgba(' + p.color + ',1)';
                ctx.shadowColor = 'rgba(' + p.color + ',.9)';
                ctx.shadowBlur = 14;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Partículas en suspensión
            particulas.forEach((q) => {
                const a = q.a + t * q.v;
                const x = cx + Math.cos(a) * lado * q.r * 1.5;
                const y = cy + Math.sin(a) * lado * q.r * .55 + Math.sin(t + q.f) * 5;
                ctx.beginPath();
                ctx.arc(x, y, q.t, 0, PI2);
                ctx.fillStyle = 'rgba(200,235,235,' + (.25 + .5 * Math.abs(Math.sin(t * .8 + q.f))).toFixed(2) + ')';
                ctx.fill();
            });

            // Logo al centro con brillo
            if (logoListo) {
                const maxAncho = lado * .46, maxAlto = lado * .22;
                const r = Math.min(maxAncho / logo.width, maxAlto / logo.height);
                const w = logo.width * r, h = logo.height * r;
                ctx.save();
                ctx.shadowColor = 'rgba(15,139,141,.85)';
                ctx.shadowBlur = 26;
                ctx.drawImage(logo, cx - w / 2, cy - h / 2, w, h);
                ctx.restore();
            }

            if (!reducido && visible) window.requestAnimationFrame(cuadro);
        }

        medir();
        window.requestAnimationFrame(cuadro);

        if ('ResizeObserver' in window) new ResizeObserver(() => { medir(); if (reducido) window.requestAnimationFrame(cuadro); }).observe(lienzo);

        if ('IntersectionObserver' in window && !reducido) {
            new IntersectionObserver((entradas) => {
                const ahora = entradas[0].isIntersecting;
                if (ahora && !visible) { visible = true; window.requestAnimationFrame(cuadro); }
                visible = ahora;
            }).observe(lienzo);
        }
    }

    document.querySelectorAll('canvas.hud').forEach(iniciar);

})();
