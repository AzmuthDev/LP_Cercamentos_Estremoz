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
        mobileBtn.addEventListener('click', () => {
            navbar.classList.toggle('mobile-open');
            // Change icon
            const icon = mobileBtn.querySelector('i');
            if (navbar.classList.contains('mobile-open')) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
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
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-up');
    animatedElements.forEach(el => observer.observe(el));

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
    initScrollVideo('scrollVideo3');

    // Hero Video Playback Speed
    const heroBgVideo = document.querySelector('.hero-bg-video');
    if (heroBgVideo) {
        heroBgVideo.playbackRate = 0.65; // Deixa o vídeo mais lento
    }

});
