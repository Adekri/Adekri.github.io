/**
 * VIRGO TKALCOVNA — Blog stránka
 * Načtení článků, vyhledávání, filtrování, otevírání vieweru lokálně
 *
 * Závisí na: script.js (ArticleViewer, attachCardEvents, escHtml)
 */

(function initBlog() {
    const grid = document.getElementById('full-blog-grid');
    if (!grid) return; // Spouštíme jen na blog.html

    let allPosts   = [];
    let currentTag = 'all';
    let searchTerm = '';
    let searchTimeout;

    // ----------------------------------------------------------------
    // Načtení dat
    // ----------------------------------------------------------------
    fetch('seznam.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            // Filtrujeme duplikátní ID
            allPosts = Array.from(
                new Map(data.map(p => [p.id, p])).values()
            );
            renderPosts();
        })
        .catch(err => {
            console.error('Blog: chyba při načítání:', err);
            grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; opacity:0.5;">Nepodařilo se načíst články.</p>';
        });

    // ----------------------------------------------------------------
    // Vyhledávání — debounced pro výkon
    // ----------------------------------------------------------------
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchTerm = e.target.value.trim().toLowerCase();
                renderPosts();
            }, 250);
        });
    }

    // ----------------------------------------------------------------
    // Filtry — kategorie
    // ----------------------------------------------------------------
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            currentTag = btn.dataset.tag;
            renderPosts();
        });
    });

    // ----------------------------------------------------------------
    // Vykreslení článků
    // ----------------------------------------------------------------
    function renderPosts() {
        const filtered = allPosts.filter(post => {
            const matchesTag = currentTag === 'all' || post.tag === currentTag;
            const haystack   = `${post.title || ''} ${post.perex || ''}`.toLowerCase();
            const matchesSearch = !searchTerm || haystack.includes(searchTerm);
            return matchesTag && matchesSearch;
        });

        if (!filtered.length) {
            grid.innerHTML = `
                <p style="grid-column:1/-1; text-align:center; opacity:0.5; padding: 60px 0;">
                    Žádné články neodpovídají hledání.
                </p>`;
            return;
        }

        grid.innerHTML = filtered.map((post, i) => `
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

        // Připojíme události — ArticleViewer je definován v script.js
        attachCardEvents(grid);
    }
})();
