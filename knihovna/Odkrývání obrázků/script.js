/**
 * VIRGO TKALCOVNA — Sdílený JavaScript
 * Obsahuje: navigace, hamburger, scroll reveal, article viewer, načtení blogu na homepage
 */

/* ================================================================
   1. NAVIGACE — Scroll efekt & Hamburger menu
   ================================================================ */

(function initNavigation() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    // Přidání třídy .scrolled při scrollování
    if (navbar) {
        const handleScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Inicializace při načtení stránky
    }

    // Hamburger menu toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Zavření kliknutím na odkaz
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Escape klávesa
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                hamburger.focus();
            }
        });

        // Zavření kliknutím mimo menu (na overlay pozadí)
        navLinks.addEventListener('click', e => {
            if (e.target === navLinks) {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
})();


/* ================================================================
   2. SCROLL REVEAL — IntersectionObserver
   ================================================================ */

(function initReveal() {
    const revealItems = document.querySelectorAll('.reveal');
    if (!revealItems.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animace jen jednou
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(el => observer.observe(el));
})();


/* ================================================================
   3. ARTICLE VIEWER — Sdílená komponenta
   ================================================================ */

const ArticleViewer = (function () {
    const viewer    = document.getElementById('articleViewer');
    const closeBtn  = document.getElementById('closeViewer');
    const viewTitle = document.getElementById('viewTitle');
    const viewTag   = document.getElementById('viewTag');
    const viewBody  = document.getElementById('viewBody');

    if (!viewer) return { open: () => {}, close: () => {} };

    // Otevření vieweru
    function open(articleId, title, tag) {
        if (!viewer || !viewBody) return;

        viewTitle.textContent = title || 'Článek';
        viewTag.textContent   = tag   || '';

        viewBody.innerHTML = '<p style="opacity:0.4; font-style:italic;">Načítám článek…</p>';

        // Zobrazení panelu
        viewer.hidden = false;
        // Malé zpoždění pro přechod CSS
        requestAnimationFrame(() => {
            viewer.classList.add('active');
        });
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();

        // Načtení markdown souboru
        fetch(`clanky/${articleId}.md`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then(markdown => {
                viewBody.innerHTML = marked.parse(markdown);
                // innerHTML ignoruje <script> tagy — musíme je ručně přepsat do nových DOM elementů
                executeInlineScripts(viewBody);
            })
            .catch(() => {
                viewBody.innerHTML = `
                    <p style="color: var(--med); font-style:italic;">
                        Článek se nepodařilo načíst. Zkuste to prosím znovu.
                    </p>`;
            });
    }

    // Zavření vieweru
    function close() {
        viewer.classList.remove('active');
        document.body.style.overflow = '';
        // Skrytí po skončení animace
        viewer.addEventListener('transitionend', () => {
            viewer.hidden = true;
        }, { once: true });
    }

    // Události zavírání
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && viewer.classList.contains('active')) close();
    });
    // Kliknutí mimo obsah vieweru (na pozadí)
    viewer.addEventListener('click', e => {
        if (e.target === viewer) close();
    });

    return { open, close };
})();


/* ================================================================
   4. HOMEPAGE — Načtení a vykreslení blogu
   ================================================================ */

(function initHomepageBlog() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return; // Nejsme na homepage

    const LIMIT = 5; // Počet článků na hlavní stránce

    fetch('seznam.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(posts => {
            // Unikátní ID — filtrujeme duplikáty
            const unique = Array.from(
                new Map(posts.map(p => [p.id, p])).values()
            );
            renderHomePosts(unique.slice(0, LIMIT));
            handleUrlArticle(unique);
        })
        .catch(err => {
            console.error('Blog: chyba při načítání:', err);
            blogGrid.innerHTML = '<p style="opacity:0.5; text-align:center;">Nepodařilo se načíst články.</p>';
        });

    function renderHomePosts(posts) {
        if (!posts.length) {
            blogGrid.innerHTML = '<p style="opacity:0.5; text-align:center;">Zatím žádné články.</p>';
            return;
        }

        blogGrid.innerHTML = posts.map((post, i) => `
            <article class="blog-card${i === 0 ? ' featured' : ''}"
                     role="button"
                     tabindex="0"
                     data-id="${escHtml(post.id)}"
                     data-tag="${escHtml(post.tag || '')}"
                     data-title="${escHtml(post.title || '')}"
                     aria-label="Otevřít článek: ${escHtml(post.title || '')}">
                <div class="card-img" style="background-image: url('${escHtml(post.image || '')}')"></div>
                <div class="card-overlay" aria-hidden="true"></div>
                <div class="card-content">
                    <span class="tag">${escHtml(post.tag || '')}</span>
                    <h3>${escHtml(post.title || 'Bez názvu')}</h3>
                    <p>${escHtml(post.perex || '')}</p>
                    <span class="read-more" aria-hidden="true">Přečíst článek —</span>
                </div>
            </article>
        `).join('');

        attachCardEvents(blogGrid);
    }

    // Otevření článku z URL parametru (?article=id)
    function handleUrlArticle(posts) {
        const params    = new URLSearchParams(window.location.search);
        const articleId = params.get('article');
        if (!articleId) return;

        const post = posts.find(p => p.id === articleId);
        if (post) {
            setTimeout(() => ArticleViewer.open(post.id, post.title, post.tag), 300);
        }
    }
})();


/* ================================================================
   5. POMOCNÉ FUNKCE (exportovány globálně)
   ================================================================ */

/**
 * Spustí <script> tagy vložené přes innerHTML — prohlížeč je jinak tiše ignoruje.
 * Potřebné pro interaktivní widgety (kalkulačky apod.) v markdown článcích.
 * @param {HTMLElement} container
 */
function executeInlineScripts(container) {
    container.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr =>
            newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
    });
}

/**
 * Připojí click/keydown události na karty blogu v daném kontejneru.
 * @param {HTMLElement} container
 */
function attachCardEvents(container) {
    container.querySelectorAll('.blog-card').forEach(card => {
        const handler = () => {
            ArticleViewer.open(
                card.dataset.id,
                card.dataset.title,
                card.dataset.tag
            );
        };
        card.addEventListener('click', handler);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler();
            }
        });
    });
}

/**
 * Escapování HTML speciálních znaků — prevence XSS při vkládání dat z JSON.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
