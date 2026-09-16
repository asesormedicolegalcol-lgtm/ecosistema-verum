/*
===============================================================================
Ecosistema Verum — interacciones compartidas
Revelado al hacer scroll, contadores animados, sombra de encabezado,
botones flotantes (WhatsApp / volver arriba) y selector de necesidad
del inicio. Sin dependencias externas; se incluye igual en las 12 páginas.
===============================================================================
*/
(() => {

    const prefiereMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- Sombra de encabezado al desplazar --- */
    const cabecera = document.querySelector('.cabecera');
    if (cabecera) {
        const alDesplazarCabecera = () => cabecera.classList.toggle('con-sombra', window.scrollY > 8);
        alDesplazarCabecera();
        window.addEventListener('scroll', alDesplazarCabecera, { passive: true });
    }

    /* --- Revelado al hacer scroll --- */
    const objetivosRevelado = document.querySelectorAll(
        '.tarjeta, .producto, .seccion-titulo, .documento > h2, .documento > h3, .metrica-mini, .mockup-navegador, .selector-necesidad'
    );

    objetivosRevelado.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--retardo', (i % 6) * 70 + 'ms');
    });

    if (prefiereMovimientoReducido) {

        objetivosRevelado.forEach(el => el.classList.add('visible'));

    } else if ('IntersectionObserver' in window) {

        const observador = new IntersectionObserver((entradas) => {

            entradas.forEach(entrada => {

                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visible');
                    observador.unobserve(entrada.target);
                }

            });

        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        objetivosRevelado.forEach(el => observador.observe(el));

    } else {

        objetivosRevelado.forEach(el => el.classList.add('visible'));

    }

    /* --- Contadores animados: <span data-contador="120" data-sufijo="+">0</span> --- */
    const contadores = document.querySelectorAll('[data-contador]');

    const animarContador = (el) => {

        const destino = parseFloat(el.dataset.contador);
        const sufijo = el.dataset.sufijo || '';

        if (prefiereMovimientoReducido || !Number.isFinite(destino)) {
            el.textContent = destino + sufijo;
            return;
        }

        const duracion = 1200;
        const inicio = performance.now();

        const paso = (ahora) => {

            const progreso = Math.min(1, (ahora - inicio) / duracion);
            const valor = Math.round(destino * (1 - Math.pow(1 - progreso, 3)));

            el.textContent = valor + sufijo;

            if (progreso < 1) requestAnimationFrame(paso);

        };

        requestAnimationFrame(paso);

    };

    if (contadores.length) {

        if ('IntersectionObserver' in window) {

            const observadorContadores = new IntersectionObserver((entradas) => {

                entradas.forEach(entrada => {

                    if (entrada.isIntersecting) {
                        animarContador(entrada.target);
                        observadorContadores.unobserve(entrada.target);
                    }

                });

            }, { threshold: 0.6 });

            contadores.forEach(el => observadorContadores.observe(el));

        } else {

            contadores.forEach(animarContador);

        }

    }

    /* --- Botón flotante de WhatsApp (se inyecta en las 12 páginas) --- */
    if (!document.querySelector('.flotante-whatsapp')) {

        const enlace = document.createElement('a');

        enlace.href = 'https://wa.me/573202413579?text=Hola%2C%20escribo%20desde%20ecosistemaverum.com';
        enlace.target = '_blank';
        enlace.rel = 'noopener';
        enlace.className = 'flotante-whatsapp';
        enlace.setAttribute('aria-label', 'Escribir por WhatsApp');
        enlace.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12.02 2c-5.5 0-9.97 4.46-9.97 9.96 0 1.76.46 3.45 1.33 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.77 1.22h.01c5.5 0 9.97-4.46 9.97-9.96S17.52 2 12.02 2Zm0 18.2h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.26 8.26-8.26 2.2 0 4.28.86 5.84 2.42a8.2 8.2 0 0 1 2.42 5.84c0 4.55-3.71 8.24-8.27 8.24Zm4.52-6.16c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.15.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.47-.01-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.06s.88 2.39 1 2.56c.12.16 1.74 2.68 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>';

        document.body.appendChild(enlace);

    }

    /* --- Botón "volver arriba" --- */
    if (!document.querySelector('.flotante-arriba')) {

        const botonArriba = document.createElement('button');

        botonArriba.type = 'button';
        botonArriba.className = 'flotante-arriba';
        botonArriba.setAttribute('aria-label', 'Volver arriba');
        botonArriba.textContent = '↑';

        botonArriba.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefiereMovimientoReducido ? 'auto' : 'smooth' });
        });

        document.body.appendChild(botonArriba);

        const alDesplazarArriba = () => botonArriba.classList.toggle('visible', window.scrollY > 480);
        alDesplazarArriba();
        window.addEventListener('scroll', alDesplazarArriba, { passive: true });

    }

    /* --- Selector interactivo de necesidad (solo existe en index.html) --- */
    const selector = document.querySelector('.selector-necesidad');

    if (selector) {

        const chips = selector.querySelectorAll('[data-objetivo]');
        const productos = document.querySelectorAll('.producto');

        chips.forEach(chip => {

            chip.addEventListener('click', () => {

                const yaActivo = chip.classList.contains('activo');

                chips.forEach(c => c.classList.remove('activo'));
                productos.forEach(p => p.classList.remove('resaltado'));

                if (yaActivo) return;

                chip.classList.add('activo');

                const objetivo = chip.dataset.objetivo;
                let primero = null;

                productos.forEach(tarjeta => {

                    const necesidades = (tarjeta.dataset.necesidades || '').split(',');

                    if (necesidades.includes(objetivo)) {
                        tarjeta.classList.add('resaltado');
                        if (!primero) primero = tarjeta;
                    }

                });

                if (primero) {
                    primero.scrollIntoView({ behavior: prefiereMovimientoReducido ? 'auto' : 'smooth', block: 'center' });
                }

            });

        });

    }

})();
