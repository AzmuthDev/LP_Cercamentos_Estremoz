document.addEventListener('DOMContentLoaded', () => {
    // Sticky Navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        const setMenuOpen = (open) => {
            navbar.classList.toggle('mobile-open', open);
            mobileBtn.setAttribute('aria-expanded', open);
            // Change icon
            const icon = mobileBtn.querySelector('i');
            icon.classList.toggle('ph-list', !open);
            icon.classList.toggle('ph-x', open);
        };

        mobileBtn.addEventListener('click', () => {
            setMenuOpen(!navbar.classList.contains('mobile-open'));
        });

        // Fecha o menu ao tocar em um link
        navbar.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // No mobile os produtos viram carrossel horizontal: cards fora da tela nunca
                // cruzam o viewport, então revela o grupo inteiro de uma vez
                const group = entry.target.closest('.products-grid');
                const targets = group ? group.querySelectorAll('.animate-up') : [entry.target];
                targets.forEach(el => {
                    el.classList.add('in-view');
                    observer.unobserve(el);
                });
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-up:not(.scroll-text-block)');
    animatedElements.forEach(el => observer.observe(el));

    // Subtópicos das seções de vídeo: aparecem um a um, só quando já estão bem dentro da tela
    const textBlockObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -25% 0px', threshold: 0 });

    document.querySelectorAll('.scroll-text-block').forEach(el => textBlockObserver.observe(el));

    // Destaca o subtópico em foco enquanto o vídeo fica fixo
    const videoSections = document.querySelectorAll('.scroll-video-section');
    let activeTicking = false;

    const updateActiveBlocks = () => {
        activeTicking = false;
        videoSections.forEach(section => {
            const blocks = section.querySelectorAll('.scroll-text-block');
            const sectionRect = section.getBoundingClientRect();
            if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) {
                blocks.forEach(b => b.classList.remove('is-active'));
                return;
            }

            // No mobile o vídeo fica fixo no topo, então o foco é a área abaixo dele
            const sticky = section.querySelector('.scroll-video-sticky');
            const pinnedBottom = window.innerWidth <= 768 ? sticky.getBoundingClientRect().bottom : 0;
            const focusLine = pinnedBottom + (window.innerHeight - pinnedBottom) * 0.45;

            let closest = null;
            let closestDistance = Infinity;
            blocks.forEach(block => {
                const rect = block.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - focusLine);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = block;
                }
            });
            blocks.forEach(b => b.classList.toggle('is-active', b === closest));
        });
    };

    const requestActiveUpdate = () => {
        if (!activeTicking) {
            activeTicking = true;
            requestAnimationFrame(updateActiveBlocks);
        }
    };

    window.addEventListener('scroll', requestActiveUpdate, { passive: true });
    window.addEventListener('resize', requestActiveUpdate);
    updateActiveBlocks();

    // Função genérica para reproduzir vídeos automaticamente ao chegar na dobra
    const initScrollVideo = (videoId) => {
        const video = document.getElementById(videoId);
        if (!video) return;

        // Deixar mais rápido (2.5x)
        video.playbackRate = 2.5; 
        
        // 20 frames em um vídeo comum (30fps) são aproximadamente 0.67 segundos
        const stopTimeOffset = 0.67;
        let animationFrameId;

        const checkVideoTime = () => {
            if (video.duration && video.currentTime >= video.duration - stopTimeOffset) {
                video.pause();
                cancelAnimationFrame(animationFrameId);
                return;
            }
            if (!video.paused) {
                animationFrameId = requestAnimationFrame(checkVideoTime);
            }
        };
        
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play();
                    checkVideoTime();
                } else {
                    cancelAnimationFrame(animationFrameId);
                }
            });
        }, { threshold: 0.3 });
        
        videoObserver.observe(video);
    };

    initScrollVideo('scrollVideo');
    initScrollVideo('scrollVideo2');

    // Hero Video Playback Speed
    const heroBgVideo = document.querySelector('.hero-bg-video');
    if (heroBgVideo) {
        heroBgVideo.playbackRate = 0.65; // Deixa o vídeo mais lento
    }

    initModelPicker();

});

// Seletor de modelos da barra de busca: lista os modelos da Estremoz com prévia ao vivo
// e envia a escolha (modelo + altura) para o WhatsApp no botão Buscar.
const WHATSAPP_NUMBER = '5531998366239';

// Alturas oferecidas no campo Altura; cada modelo pode ter as suas (ex.: Telas)
const DEFAULT_HEIGHTS = ['1,03m', '1,53m', '2,03m', '2,43m'];
const TELA_HEIGHTS = ['1,00m', '1,50m', '1,80m', '2,00m'];

const MODELS = [
    {
        id: 'gradil-pvc',
        group: 'Gradis',
        name: 'Gradil em PVC',
        hint: 'Residencial, comercial e industrial',
        accent: '#2f6b4f',
        thumb: '24 74 136 136',
        draw: () => drawGradilPvc(),
        description: 'Painéis de aço galvanizado com revestimento em PVC de alta aderência. Resiste à umidade, à ferrugem e à maresia, com manutenção mínima.',
        specs: [
            ['Malha', '5×20, 2,5×20 ou 1,25×20 cm'],
            ['Fio', '4,3 ou 5,1 mm'],
            ['Postes', '60×40 mm revestidos em PVC'],
        ],
    },
    {
        id: 'gradil-nr12',
        group: 'Gradis',
        name: 'Gradil NR12',
        hint: 'Proteção de máquinas',
        accent: '#e0a100',
        thumb: '44 92 128 128',
        draw: () => drawGradilNr12(),
        description: 'Gradis de proteção nas cores amarelo e preto para isolar máquinas e zonas de perigo, adequando a área de produção à norma NR12.',
        specs: [
            ['Cores', 'Amarelo e preto'],
            ['Uso', 'Isolamento de máquinas e equipamentos'],
            ['Instalação', 'Modular, sem solda'],
        ],
    },
    {
        id: 'tela-galvanizada',
        group: 'Telas',
        name: 'Tela com galvanização pesada',
        hint: 'Lotes, obras e áreas abertas',
        accent: '#7b8794',
        thumb: '36 80 136 136',
        draw: () => drawTela({ coated: false }),
        heights: TELA_HEIGHTS,
        description: 'Arame de aço eletrossoldado com galvanização tripla por imersão a quente. Segurança e economia para cercar lotes e obras.',
        specs: [
            ['Arame', 'Aço eletrossoldado'],
            ['Proteção', 'Galvanização tripla a quente'],
        ],
    },
    {
        id: 'tela-pvc',
        group: 'Telas',
        name: 'Tela revestida em PVC',
        hint: 'A conhecida tela emborrachada',
        accent: '#3a7d44',
        thumb: '36 92 128 128',
        draw: () => drawTela({ coated: true }),
        heights: TELA_HEIGHTS,
        description: 'Arame galvanizado por imersão a quente, eletrossoldado e revestido em PVC de alta aderência: mais durabilidade e um acabamento bonito.',
        specs: [
            ['Arame', 'Galvanizado e eletrossoldado'],
            ['Revestimento', 'PVC de alta aderência'],
        ],
    },
    {
        id: 'portoes',
        group: 'Portões',
        name: 'Portões sob medida',
        hint: 'Projetos especiais',
        accent: '#164894',
        thumb: '24 74 150 150',
        draw: () => drawPortao(),
        description: 'Fabricamos portões sob medida e desenvolvemos projetos especiais para combinar com o cercamento do seu espaço.',
        specs: [
            ['Fabricação', 'Sob medida'],
            ['Projeto', 'Desenvolvido para cada obra'],
        ],
    },
];

// Desenhos técnicos dos modelos (SVG em traço, estilo planta). Coordenadas em um quadro 480×360,
// chão em y = 300. As classes stage-* controlam a ordem em que o desenho "se constrói".
const svgLine = (x1, y1, x2, y2, cls = 'ln') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" pathLength="1"/>`;
const svgRect = (x, y, w, h, cls, rx = 0) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}" pathLength="1"/>`;
const range = (from, to, step) => {
    const out = [];
    for (let v = from; v <= to + 0.01; v += step) out.push(Math.round(v * 10) / 10);
    return out;
};

const drawGround = () => `
    <g class="stage-0">
        ${svgLine(16, 300, 464, 300, 'ln ink w2')}
        ${range(26, 460, 14).map(x => svgLine(x, 301, x - 8, 310, 'ln hatch')).join('')}
    </g>`;

// Cota de desenho técnico: texto apoiado em um traço, ligado ao detalhe por uma linha de chamada.
// `from` é o ponto do detalhe; a chamada sobe na vertical até o traço sob o texto.
const NOTE_CHAR_WIDTH = 8.6;
const drawNote = (from, label, tx, ty, anchor = 'start') => {
    const [fx, fy] = from;
    const width = label.length * NOTE_CHAR_WIDTH;
    const lineY = ty + 7;
    const [ux0, ux1] = anchor === 'end' ? [tx - width, tx] : [tx, tx + width];
    return `
    <g class="d-note">
        <polyline points="${fx},${fy} ${fx},${lineY}" class="note-line"/>
        <polyline points="${ux0},${lineY} ${ux1},${lineY}" class="note-line"/>
        <circle cx="${fx}" cy="${fy}" r="3" class="note-dot"/>
        <text x="${tx}" y="${ty}" text-anchor="${anchor}">${label}</text>
    </g>`;
};

function drawGradilPvc() {
    const posts = [40, 200, 360];
    const folds = [124, 204, 268];
    const panels = posts.slice(0, -1).map((p, i) => [p + 16, posts[i + 1] - 2]);
    return `
        ${drawGround()}
        <g class="stage-1">
            ${panels.map(([x0, x1]) => `
                ${range(x0 + 4, x1 - 2, 9).map(x => svgLine(x, 92, x, 288, 'ln w1')).join('')}
                ${range(92, 288, 28).map(y => svgLine(x0, y, x1, y, 'ln w1')).join('')}
            `).join('')}
        </g>
        <g class="stage-2">
            ${panels.map(([x0, x1]) => folds.map(y =>
                svgLine(x0, y - 3, x1, y - 3, 'ln w2') + svgLine(x0, y + 3, x1, y + 3, 'ln w2')).join('')).join('')}
            <path d="M424 92 V118 L434 124 L424 130 V198 L434 204 L424 210 V262 L434 268 L424 274 V288"
                class="ln w2" pathLength="1"/>
        </g>
        <g class="stage-fill">
            ${posts.map(p => `
                ${svgRect(p, 72, 16, 228, 'fill-accent')}
                ${svgRect(p - 2, 66, 20, 7, 'fill-ink', 2)}
                ${[104, 196, 276].map(y => svgRect(p - 3, y - 5, 22, 10, 'fill-clip', 2)).join('')}
            `).join('')}
        </g>
        ${drawNote([120, 150], 'malha 5×20 cm', 22, 38)}
        ${drawNote([368, 66], 'poste 60×40 mm', 466, 38, 'end')}
        ${drawNote([434, 268], 'dobra em V', 466, 336, 'end')}`;
}

function drawGradilNr12() {
    const posts = [56, 240, 424];
    const panels = posts.slice(0, -1).map((p, i) => [p + 14, posts[i + 1] - 2]);
    return `
        ${drawGround()}
        <g class="stage-0">
            <circle cx="150" cy="190" r="40" class="ln muted w2" pathLength="1"/>
            <circle cx="150" cy="190" r="14" class="ln muted w2" pathLength="1"/>
            ${range(0, 315, 45).map(a => {
                const r = a * Math.PI / 180;
                return svgLine(Math.round(150 + Math.cos(r) * 40), Math.round(190 + Math.sin(r) * 40),
                    Math.round(150 + Math.cos(r) * 52), Math.round(190 + Math.sin(r) * 52), 'ln muted w4');
            }).join('')}
            ${svgRect(300, 150, 90, 100, 'ln muted w2', 6)}
            ${svgLine(316, 172, 374, 172, 'ln muted w2')}
        </g>
        <g class="stage-1">
            ${panels.map(([x0, x1]) => `
                ${range(x0 + 12, x1 - 6, 12).map(x => svgLine(x, 96, x, 276, 'ln w1')).join('')}
                ${range(108, 268, 12).map(y => svgLine(x0, y, x1, y, 'ln w1')).join('')}
            `).join('')}
        </g>
        <g class="stage-2">
            ${panels.map(([x0, x1]) => svgRect(x0, 96, x1 - x0, 180, 'ln w4')).join('')}
        </g>
        <g class="stage-fill">
            ${posts.map(p => `
                ${svgRect(p, 80, 14, 220, 'fill-ink')}
                ${svgRect(p - 8, 295, 30, 5, 'fill-ink', 1)}
                ${[112, 260].map(y => `<circle cx="${p + 7}" cy="${y}" r="3" class="fill-accent"/>`).join('')}
            `).join('')}
        </g>
        ${drawNote([63, 112], 'montagem sem solda', 22, 38)}
        ${drawNote([400, 96], 'amarelo e preto', 466, 38, 'end')}`;
}

function drawTela({ coated }) {
    const posts = [50, 240, 430];
    const cellW = coated ? 14 : 16;
    const cellH = coated ? 22 : 16;
    const wire = coated ? 'ln w2' : 'ln w1';
    const postFill = coated ? 'fill-accent' : 'fill-steel';
    return `
        ${drawGround()}
        <g class="stage-1">
            ${range(posts[0] + 4, posts[2], cellW).map(x => svgLine(x, 90, x, 292, wire)).join('')}
            ${range(90, 292, cellH).map(y => svgLine(posts[0], y, posts[2], y, wire)).join('')}
        </g>
        <g class="stage-2">
            ${svgLine(posts[0], 88, posts[2] + 8, 88, 'ln w3')}
            ${svgLine(posts[0], 294, posts[2] + 8, 294, 'ln w3')}
            ${coated ? '' : svgLine(58, 118, 118, 298, 'ln ink w3') + svgLine(432, 118, 372, 298, 'ln ink w3')}
        </g>
        <g class="stage-fill">
            ${posts.map(p => `
                ${svgRect(p, 78, 10, 222, postFill, 5)}
                <circle cx="${p + 5}" cy="78" r="6" class="${postFill}"/>
            `).join('')}
        </g>
        ${coated
            ? drawNote([100, 160], 'revestida em PVC', 22, 38) +
              drawNote([400, 150], 'arame galvanizado', 466, 38, 'end')
            : drawNote([150, 154], 'arame eletrossoldado', 22, 38) +
              drawNote([435, 110], 'galvanização tripla a quente', 466, 38, 'end')}`;
}

function drawPortao() {
    const x0 = 72;
    const x1 = 384;
    return `
        ${drawGround()}
        <g class="stage-1">
            ${range(x0 + 14, x1 - 10, 14).map(x => svgLine(x, 96, x, 280, 'ln w2')).join('')}
            ${svgLine(x0, 188, x1, 188, 'ln w2')}
        </g>
        <g class="stage-2">
            ${svgRect(x0, 92, x1 - x0, 192, 'ln w4', 3)}
            ${svgLine(56, 298, 470, 298, 'ln ink w3')}
            <circle cx="122" cy="290" r="8" class="ln ink w2" pathLength="1"/>
            <circle cx="334" cy="290" r="8" class="ln ink w2" pathLength="1"/>
        </g>
        <g class="stage-fill">
            ${svgRect(36, 70, 18, 230, 'fill-accent')}
            ${svgRect(430, 70, 18, 230, 'fill-accent')}
            ${svgRect(392, 104, 38, 10, 'fill-ink', 2)}
        </g>
        <g class="d-note">
            <polyline points="${x0},84 ${x0},50" class="note-line"/>
            <polyline points="${x1},84 ${x1},50" class="note-line"/>
            <polyline points="${x0},58 ${x1},58" class="note-line dim"/>
            <text x="${(x0 + x1) / 2}" y="48" text-anchor="middle">largura sob medida</text>
        </g>`;
}

const renderDrawing = (model, { thumb = false } = {}) =>
    `<svg class="model-drawing${thumb ? ' is-thumb' : ''}" viewBox="${thumb ? model.thumb : '0 0 480 360'}"
        preserveAspectRatio="${thumb ? 'xMidYMid slice' : 'xMidYMid meet'}" style="--accent:${model.accent}"
        aria-hidden="true" focusable="false">${thumb ? model.draw().replace(/<g class="d-note">[\s\S]*?<\/g>/g, '') : model.draw()}</svg>`;

function initModelPicker() {
    const trigger = document.getElementById('modelTrigger');
    const picker = document.getElementById('modelPicker');
    if (!trigger || !picker) return;

    const panel = picker.querySelector('.model-picker-panel');
    const body = picker.querySelector('.model-picker-body');
    const list = picker.querySelector('.model-list');
    const preview = picker.querySelector('.model-preview');
    const previewMedia = preview.querySelector('.model-preview-media');
    const previewGroup = preview.querySelector('.model-preview-group');
    const previewName = preview.querySelector('.model-preview-name');
    const previewDesc = preview.querySelector('.model-preview-desc');
    const previewSpecs = preview.querySelector('.model-specs');
    const confirmBtn = picker.querySelector('[data-picker-confirm]');
    const triggerThumb = trigger.querySelector('.model-trigger-thumb');
    const triggerText = trigger.querySelector('.model-trigger-text');
    const searchBar = document.querySelector('.search-bar');
    const heightSelect = document.getElementById('heightSelect');
    const searchButton = document.getElementById('searchButton');

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const byId = (id) => MODELS.find(m => m.id === id);

    let selectedId = null;
    let previewId = null;
    let swapTimer = null;

    // Lista agrupada por material
    let currentGroup = null;
    MODELS.forEach(model => {
        if (model.group !== currentGroup) {
            currentGroup = model.group;
            const groupName = document.createElement('span');
            groupName.className = 'model-group-name';
            groupName.textContent = model.group;
            list.appendChild(groupName);
        }
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'model-option';
        option.setAttribute('role', 'radio');
        option.setAttribute('aria-checked', 'false');
        option.tabIndex = -1;
        option.dataset.id = model.id;
        option.innerHTML = `
            <span class="model-option-thumb">${renderDrawing(model, { thumb: true })}</span>
            <span>
                <span class="model-option-name">${model.name}</span>
                <span class="model-option-hint">${model.hint}</span>
            </span>
            <i class="ph-fill ph-check-circle" aria-hidden="true"></i>`;
        list.appendChild(option);
    });
    const options = [...list.querySelectorAll('.model-option')];
    options[0].tabIndex = 0;

    const renderPreview = (model) => {
        previewMedia.innerHTML = renderDrawing(model);
        previewMedia.setAttribute('role', 'img');
        previewMedia.setAttribute('aria-label', `Desenho técnico: ${model.name}`);
        previewGroup.textContent = model.group;
        previewName.textContent = model.name;
        previewDesc.textContent = model.description;
        previewSpecs.replaceChildren(...model.specs.flatMap(([label, value]) => {
            const dt = document.createElement('dt');
            dt.textContent = label;
            const dd = document.createElement('dd');
            dd.textContent = value;
            return [dt, dd];
        }));
    };

    const showPreview = (id, animate = true) => {
        if (!id || id === previewId) return;
        previewId = id;
        options.forEach(o => o.classList.toggle('is-previewed', o.dataset.id === id));
        const model = byId(id);
        clearTimeout(swapTimer);

        if (!animate || reducedMotion()) {
            preview.classList.remove('is-swapping');
            renderPreview(model);
            return;
        }
        // Troca suave: o desenho atual some e o novo se "constrói" traço a traço
        preview.classList.add('is-swapping');
        swapTimer = setTimeout(() => {
            renderPreview(model);
            previewMedia.classList.add('is-drawing');
            preview.classList.remove('is-swapping');
        }, 140);
    };

    // Troca as opções de Altura conforme o modelo, mantendo a escolha se ela ainda existir
    const updateHeights = (model) => {
        if (!heightSelect) return;
        const heights = model.heights || DEFAULT_HEIGHTS;
        const current = heightSelect.selectedIndex > 0 ? heightSelect.value : null;
        const placeholder = heightSelect.options[0];
        heightSelect.replaceChildren(placeholder, ...heights.map(h => new Option(h)));
        heightSelect.value = heights.includes(current) ? current : placeholder.value;
    };

    const setRovingFocus = (option) => {
        options.forEach(o => { o.tabIndex = o === option ? 0 : -1; });
    };

    const select = (id) => {
        selectedId = id;
        const model = byId(id);
        options.forEach(o => {
            const checked = o.dataset.id === id;
            o.setAttribute('aria-checked', String(checked));
            if (checked) setRovingFocus(o);
        });
        showPreview(id);
        triggerThumb.innerHTML = renderDrawing(model, { thumb: true });
        triggerThumb.hidden = false;
        triggerText.textContent = model.name;
        updateHeights(model);
        // No celular a prévia fica no topo da folha: volta até ela para mostrar a troca
        if (isMobile()) body.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    };

    // Posiciona o painel alinhado à barra de busca, abrindo para o lado com mais espaço
    const position = () => {
        if (isMobile()) {
            ['--picker-top', '--picker-left', '--picker-width', '--picker-origin', '--picker-shift', '--picker-list-max']
                .forEach(v => panel.style.removeProperty(v));
            return;
        }
        const bar = searchBar.getBoundingClientRect();
        const gap = 12;
        const navSpace = 100;
        const spaceAbove = bar.top - navSpace - gap;
        const spaceBelow = window.innerHeight - bar.bottom - gap * 2;

        // Mede a altura natural antes de decidir o lado; se não couber, a lista rola
        panel.style.removeProperty('--picker-list-max');
        const natural = panel.offsetHeight;
        const openUp = spaceAbove >= natural || (spaceBelow < natural && spaceAbove > spaceBelow);
        const available = openUp ? spaceAbove : spaceBelow;
        if (natural > available) {
            const listHeight = list.offsetHeight - (natural - available);
            panel.style.setProperty('--picker-list-max', `${Math.max(180, listHeight)}px`);
        }
        const height = panel.offsetHeight;
        const top = openUp ? Math.max(navSpace, bar.top - height - gap) : bar.bottom + gap;

        panel.style.setProperty('--picker-top', `${top}px`);
        panel.style.setProperty('--picker-left', `${bar.left}px`);
        panel.style.setProperty('--picker-width', `${bar.width}px`);
        panel.style.setProperty('--picker-origin', openUp ? 'bottom center' : 'top center');
        panel.style.setProperty('--picker-shift', openUp ? '10px' : '-10px');
    };

    // Se o painel não cabe acima nem abaixo da barra, rola a página até caber inteiro
    const makeRoom = () => {
        const bar = searchBar.getBoundingClientRect();
        const natural = panel.offsetHeight;
        const gap = 12;
        const navSpace = 100;
        const fitsAbove = bar.top - navSpace - gap >= natural;
        const fitsBelow = window.innerHeight - bar.bottom - gap * 2 >= natural;
        if (fitsAbove || fitsBelow) return;
        const scrollUp = bar.top - (navSpace + natural + gap);
        const target = window.scrollY + scrollUp;
        const delta = target >= 0 ? scrollUp : (bar.bottom + gap + natural) - (window.innerHeight - gap);
        window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
    };

    let positionTicking = false;
    const requestPosition = () => {
        if (positionTicking) return;
        positionTicking = true;
        requestAnimationFrame(() => { positionTicking = false; position(); });
    };

    const onKeydown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
            return;
        }
        // Mantém o foco dentro do painel enquanto ele está aberto
        if (e.key === 'Tab') {
            const focusables = [...panel.querySelectorAll('button')].filter(el => el.tabIndex !== -1);
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    };

    const open = () => {
        if (!picker.hidden) return;
        showPreview(selectedId || previewId || MODELS[0].id, false);
        picker.hidden = false;
        picker.setAttribute('aria-modal', String(isMobile()));
        if (!isMobile()) makeRoom();
        position();
        requestAnimationFrame(() => picker.classList.add('is-open'));
        trigger.setAttribute('aria-expanded', 'true');
        if (isMobile()) document.documentElement.style.overflow = 'hidden';

        const focusTarget = options.find(o => o.dataset.id === selectedId) || options[0];
        setRovingFocus(focusTarget);
        focusTarget.focus({ preventScroll: true });

        document.addEventListener('keydown', onKeydown);
        window.addEventListener('scroll', requestPosition, { passive: true });
        window.addEventListener('resize', requestPosition);
    };

    function close(returnFocus = true) {
        if (picker.hidden) return;
        picker.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('scroll', requestPosition);
        window.removeEventListener('resize', requestPosition);
        setTimeout(() => { if (!picker.classList.contains('is-open')) picker.hidden = true; }, 320);
        if (returnFocus) trigger.focus({ preventScroll: true });
    }

    trigger.addEventListener('click', () => (picker.hidden ? open() : close()));
    picker.querySelectorAll('[data-picker-close]').forEach(el => el.addEventListener('click', () => close()));

    confirmBtn.addEventListener('click', () => {
        if (previewId) select(previewId);
        close();
    });

    list.addEventListener('click', (e) => {
        const option = e.target.closest('.model-option');
        if (option) select(option.dataset.id);
    });

    // Prévia ao passar o mouse; ao sair da lista volta para o modelo escolhido
    list.addEventListener('mouseover', (e) => {
        const option = e.target.closest('.model-option');
        if (option && !isMobile()) showPreview(option.dataset.id);
    });
    list.addEventListener('mouseleave', () => {
        if (selectedId && !isMobile()) showPreview(selectedId);
    });
    list.addEventListener('focusin', (e) => {
        const option = e.target.closest('.model-option');
        if (option) showPreview(option.dataset.id);
    });

    // Setas percorrem os modelos; Enter ou Espaço escolhem
    list.addEventListener('keydown', (e) => {
        const index = options.indexOf(document.activeElement);
        if (index === -1) return;
        let next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = options[(index + 1) % options.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = options[(index - 1 + options.length) % options.length];
        if (e.key === 'Home') next = options[0];
        if (e.key === 'End') next = options[options.length - 1];
        if (next) {
            e.preventDefault();
            setRovingFocus(next);
            next.focus();
        }
    });

    // Buscar: envia modelo e altura escolhidos para o WhatsApp
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            if (!selectedId) {
                open();
                return;
            }
            const model = byId(selectedId);
            const height = heightSelect && heightSelect.selectedIndex > 0 ? heightSelect.value : null;
            let message = `Olá! Gostaria de um orçamento de ${model.name}`;
            if (height) message += ` com altura de ${height}`;
            message += '.';
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
        });
    }
}
