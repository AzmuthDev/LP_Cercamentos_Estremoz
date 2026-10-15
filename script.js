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

});
