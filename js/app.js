/* ============================
   ICON HELPER — Lucide CDN
   ============================ */
function icon(name, size = 24) {
  return `<i data-lucide="${name}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px"></i>`;
}

function applyIcons(el) {
  if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', attrs: {}, icons: {}, ...{} });
}

/* ============================
   STATE
   ============================ */
const state = {
  page: 'home',
  prevPage: null,
  buscarFilter: 'Todos',
  transportCity: 'Todas',
  mapaFilter: 'todos',
  selectedId: null,
  favorites: JSON.parse(localStorage.getItem('sj-favorites') || '[]'),
  map: null,
  mapMarkers: [],
  sheetOpen: false,
  carousel: { index: 0, timer: null },
};

/* ============================
   NAVIGATION
   ============================ */
function navigate(page, opts = {}) {
  state.prevPage = state.page;
  state.page = page;

  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + page)?.classList.add('active');

  if (page === 'mapa') {
    initMap();
    setTimeout(() => state.map && state.map.invalidateSize(), 220);
  }
  if (page === 'buscar' && opts.filter) {
    state.buscarFilter = opts.filter;
    renderBuscar();
  }
  if (page === 'detail' && opts.id != null) {
    state.selectedId = opts.id;
    renderDetail();
  }
}

/* ============================
   HOME PAGE
   ============================ */
function buildHome() {
  const page = document.getElementById('page-home');
  page.innerHTML = `
    <div class="home-body">
      <div class="home-hero">
        <div class="home-hero__bg"></div>
        <div class="home-hero__title">
          <h1>SÃO JOÃO</h1>
          <p>- EM ARCOVERDE -</p>
        </div>
      </div>

      <div class="home-carousel" id="homeCarousel">
        <div class="carousel-viewport">
          <div class="carousel-track" id="carouselTrack">
            ${CAROUSEL_SLIDES.map((s, i) => `
              <div class="carousel-slide" style="background:${s.color}">
                <div class="carousel-slide__content">
                  <div class="carousel-slide__title">${s.title}</div>
                  <div class="carousel-slide__subtitle">${s.sub}</div>
                </div>
                <button class="carousel-btn" data-id="${s.id}" aria-label="Ver ${s.title}">
                  ${icon('arrow-up-right', 30)}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="carousel-dots" id="carouselDots">
          ${CAROUSEL_SLIDES.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
        </div>
      </div>

      <div class="home-content">
        <div class="quick-actions">
          <button class="quick-action" data-nav="mapa">
            ${icon('map-pin', 30)}
            <span>Mapa</span>
          </button>
          <button class="quick-action" data-filter="shows">
            ${icon('music', 30)}
            <span>Shows</span>
          </button>
          <button class="quick-action" data-filter="restaurantes">
            ${icon('pizza', 30)}
            <span>Comida</span>
          </button>
          <button class="quick-action" data-filter="transporte">
            ${icon('bus', 30)}
            <span>Transporte</span>
          </button>
        </div>
        <div class="promo-banner">
          <p>O MELHOR SÃO JOÃO DE PERNAMBUCO!</p>
          <div class="promo-banner__line"></div>
        </div>
      </div>
    </div>

    ${buildNav('home')}
  `;

  lucide.createIcons();
  initCarousel();

  page.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const nav = btn.dataset.nav;
      const filter = btn.dataset.filter;
      if (nav) { navigate(nav); return; }
      if (filter === 'transporte') {
        state.buscarFilter = 'Transporte';
        state.transportCity = 'Todas';

        navigate('buscar');
        renderBuscar();
      } else if (filter) {
        const cap = filter.charAt(0).toUpperCase() + filter.slice(1);
        navigate('buscar', { filter: cap });
      }
    });
  });

  page.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('detail', { id: Number(btn.dataset.id) }));
  });

  bindNav(page);
}

/* ============================
   CAROUSEL
   ============================ */
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const dotsEl = document.getElementById('carouselDots');
  if (!track || !dotsEl) return;

  let idx = 0;
  let startX = 0;

  function goTo(i) {
    idx = ((i % CAROUSEL_SLIDES.length) + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, di) => d.classList.toggle('active', di === idx));
    state.carousel.index = idx;
  }

  function startTimer() {
    clearInterval(state.carousel.timer);
    state.carousel.timer = setInterval(() => goTo(idx + 1), 4000);
  }

  const vp = track.parentElement;
  vp.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    clearInterval(state.carousel.timer);
  }, { passive: true });
  vp.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? idx + 1 : idx - 1);
    startTimer();
  }, { passive: true });

  goTo(0);
  startTimer();
}

/* ============================
   BUSCAR PAGE
   ============================ */
function buildBuscar() {
  const page = document.getElementById('page-buscar');
  page.innerHTML = `
    <div class="page-header">
      <div class="page-header__top">
        <button class="btn-back" id="buscarBack">${icon('chevron-left', 24)}</button>
        <h2 id="buscarTitle">Todos</h2>
        <div class="btn-spacer"></div>
      </div>
      <div class="filter-pills" id="buscarPills"></div>
    </div>
    <div class="items-list" id="buscarList"></div>
    ${buildNav('buscar')}
  `;

  lucide.createIcons();
  document.getElementById('buscarBack').addEventListener('click', () => navigate(state.prevPage || 'home'));
  bindNav(page);
  renderBuscar();
}

function renderBuscar() {
  const list = document.getElementById('buscarList');
  const pills = document.getElementById('buscarPills');
  const titleEl = document.getElementById('buscarTitle');
  if (!list) return;

  const f = state.buscarFilter;

  if (f === 'Transporte') {
    if (titleEl) titleEl.textContent = 'Transporte';
    if (pills) {
      pills.innerHTML = TRANSPORT_CITIES.map(c =>
        `<button class="pill ${c === state.transportCity ? 'active' : ''}" data-city="${c}">${c}</button>`
      ).join('');
      pills.querySelectorAll('.pill').forEach(p => {
        p.addEventListener('click', () => {
          state.transportCity = p.dataset.city;
          renderBuscar();
        });
      });
    }
    const filtered = state.transportCity === 'Todas'
      ? TRANSPORTE
      : TRANSPORTE.filter(t => t.city === state.transportCity);
    list.innerHTML = filtered.length
      ? filtered.map(renderTransportCard).join('')
      : '<p style="color:var(--text-gray);text-align:center;padding:48px 0;font-size:14px">Nenhum transporte encontrado</p>';
    lucide.createIcons();
    return;
  }

  if (pills) {
    pills.innerHTML = DATE_FILTERS.map(df =>
      `<button class="pill ${df === f ? 'active' : ''}" data-filter="${df}">${df}</button>`
    ).join('');
    pills.querySelectorAll('.pill').forEach(p => {
      p.addEventListener('click', () => {
        state.buscarFilter = p.dataset.filter;
        renderBuscar();
      });
    });
  }

  let items = ITEMS;
  let title = 'Todos';

  if (f === 'Shows') {
    items = ITEMS.filter(i => i.type === 'shows');
    title = 'Shows';
  } else if (f === 'Restaurantes') {
    items = ITEMS.filter(i => i.type === 'restaurantes');
    title = 'Restaurantes';
  } else if (f !== 'Todos') {
    items = ITEMS.filter(i => i.dateFilter === f);
    title = f;
  }

  if (titleEl) titleEl.textContent = title;

  list.innerHTML = items.length
    ? items.map(renderCard).join('')
    : '<p style="color:var(--text-gray);text-align:center;padding:48px 0;font-size:14px">Nenhum item encontrado</p>';

  list.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => navigate('detail', { id: Number(btn.dataset.id) }));
  });
}

/* ============================
   MAPA PAGE
   ============================ */
function buildMapa() {
  const page = document.getElementById('page-mapa');
  page.innerHTML = `
    <div class="mapa-body">
      <div id="map"></div>

      <div class="mapa-header">
        <div class="page-header__top">
          <button class="btn-back" id="mapaBack">${icon('chevron-left', 24)}</button>
          <h2>Mapa</h2>
          <div class="btn-spacer"></div>
        </div>
        <div class="filter-pills" id="mapaPills">
          ${['todos', 'shows', 'comidas', 'turismo'].map(f => `
            <button class="pill ${f === state.mapaFilter ? 'active' : ''}" data-filter="${f}">
              ${f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="map-sheet collapsed" id="mapSheet">
        <div class="sheet-handle-row" id="sheetHandle">
          <div class="sheet-handle"></div>
        </div>
        <div class="sheet-list" id="sheetList"></div>
      </div>
    </div>
    ${buildNav('mapa')}
  `;

  lucide.createIcons();

  document.getElementById('mapaBack').addEventListener('click', () => navigate(state.prevPage || 'home'));

  page.querySelectorAll('#mapaPills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      state.mapaFilter = pill.dataset.filter;
      page.querySelectorAll('#mapaPills .pill').forEach(p => p.classList.toggle('active', p.dataset.filter === state.mapaFilter));
      renderMapaSheet();
      renderMapMarkers();
    });
  });

  const sheet = document.getElementById('mapSheet');
  const handle = document.getElementById('sheetHandle');

  handle.addEventListener('click', () => {
    state.sheetOpen = !state.sheetOpen;
    sheet.classList.toggle('collapsed', !state.sheetOpen);
  });

  let sheetTouchY = 0;
  handle.addEventListener('touchstart', e => { sheetTouchY = e.touches[0].clientY; }, { passive: true });
  handle.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientY - sheetTouchY;
    if (Math.abs(diff) > 30) {
      state.sheetOpen = diff < 0;
      sheet.classList.toggle('collapsed', !state.sheetOpen);
    }
  }, { passive: true });

  bindNav(page);
  renderMapaSheet();
}

function initMap() {
  if (state.map) return;
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  const { center, zoom } = MAP_CONFIG;
  state.map = L.map('map', { zoomControl: true, attributionControl: false })
    .setView([center.lat, center.lng], zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(state.map);
  renderMapMarkers();
}

function renderMapMarkers() {
  if (!state.map) return;
  state.mapMarkers.forEach(m => m.remove());
  state.mapMarkers = [];

  const show = state.mapaFilter === 'todos' || state.mapaFilter === 'shows';
  const rest = state.mapaFilter === 'todos' || state.mapaFilter === 'comidas';
  const filtered = ITEMS.filter(i => (i.type === 'shows' && show) || (i.type === 'restaurantes' && rest));

  filtered.forEach(item => {
    const color = item.type === 'shows' ? '#ff713d' : '#be410b';
    const html = `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`;
    const divIcon = L.divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 28] });
    const marker = L.marker([item.lat, item.lng], { icon: divIcon }).addTo(state.map);
    marker.bindPopup(`<strong>${item.title}</strong><br><small>${item.location}</small>`);
    marker.on('click', () => {
      state.sheetOpen = true;
      document.getElementById('mapSheet')?.classList.remove('collapsed');
    });
    state.mapMarkers.push(marker);
  });
}

function renderMapaSheet() {
  const list = document.getElementById('sheetList');
  if (!list) return;

  const show = state.mapaFilter === 'todos' || state.mapaFilter === 'shows';
  const rest = state.mapaFilter === 'todos' || state.mapaFilter === 'comidas';
  const filtered = ITEMS.filter(i => (i.type === 'shows' && show) || (i.type === 'restaurantes' && rest));

  list.innerHTML = filtered.map(renderCard).join('');
  list.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => navigate('detail', { id: Number(btn.dataset.id) }));
  });
}

/* ============================
   DETAIL PAGE
   ============================ */
function buildDetail() {
  const page = document.getElementById('page-detail');
  page.innerHTML = `
    <div class="page-header">
      <div class="page-header__top">
        <button class="btn-back" id="detailBack">${icon('chevron-left', 24)}</button>
        <h2 id="detailPageTitle">Shows</h2>
        <div class="btn-spacer"></div>
      </div>
    </div>
    <div class="detail-scroll" id="detailScroll"></div>
    ${buildNav('detail')}
  `;

  lucide.createIcons();
  document.getElementById('detailBack').addEventListener('click', () => navigate(state.prevPage || 'buscar'));
  bindNav(page);
}

function renderDetail() {
  const scroll = document.getElementById('detailScroll');
  const titleEl = document.getElementById('detailPageTitle');
  if (!scroll) return;

  const item = ITEMS.find(i => i.id === state.selectedId);
  if (!item) return;

  if (titleEl) titleEl.textContent = item.type === 'shows' ? 'Shows' : 'Restaurantes';

  const today = new Date('2026-05-19');
  const rawDate = item.date.includes('-') ? '16/06/2026' : item.date;
  const [d, m, y] = rawDate.split('/');
  const showDate = new Date(`${y}-${m}-${d}`);
  const daysLeft = Math.max(0, Math.round((showDate - today) / 86400000));

  const outros = ITEMS.filter(i => i.id !== item.id && i.type === item.type).slice(0, 3);

  scroll.innerHTML = `
    <div class="detail-img" style="background:${typeColor(item.type)}"></div>

    <div class="detail-info">
      <div class="detail-title-row">
        <div class="detail-name-group">
          <span class="detail-name">${item.title}</span>
          ${daysLeft > 0 ? `<span class="detail-days-badge">${daysLeft}d</span>` : ''}
        </div>
        <button class="btn-share" id="btnShare" aria-label="Compartilhar">
          ${icon('share-2', 20)}
        </button>
      </div>
      <div class="detail-date">${item.date}</div>
      <div class="detail-location" style="font-size:13px;color:var(--text-gray)">${item.location}</div>
      <button class="btn-saiba-mais" id="btnSaiba">
        Saiba mais ${icon('arrow-up-right', 20)}
      </button>
    </div>

    <p class="detail-outros-title">Outros</p>
    <div class="detail-outros-list">
      ${outros.map(renderCard).join('')}
    </div>
  `;

  lucide.createIcons();

  scroll.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => navigate('detail', { id: Number(btn.dataset.id) }));
  });

  document.getElementById('btnSaiba')?.addEventListener('click', () => {
    if (navigator.share) navigator.share({ title: item.title, text: `${item.title} — ${item.date} — ${item.location}` });
  });
  document.getElementById('btnShare')?.addEventListener('click', () => {
    if (navigator.share) navigator.share({ title: item.title, text: `${item.title} — ${item.date} — ${item.location}` });
  });
}

/* ============================
   SHARED HELPERS
   ============================ */
function renderCard(item) {
  const bg = typeColor(item.type);
  const meta = item.type === 'shows'
    ? `<span>${item.location}</span><span>Capacidade: ${item.capacity}</span>`
    : `<span>${item.location}</span><span>${item.capacity} lugares</span>`;

  return `
    <div class="item-card">
      <div class="item-card__img" style="background:${bg}"></div>
      <div class="item-card__body">
        <div class="item-card__info">
          <div class="item-card__title">${item.title}</div>
          <div class="item-card__meta">${meta}</div>
        </div>
        <button class="btn-details" data-id="${item.id}">Ver detalhes</button>
      </div>
    </div>
  `;
}

function renderTransportCard(t) {
  const vehicleIcon = t.vehicle === 'van' ? 'bus' : t.vehicle === 'moto' ? 'bike' : 'car';
  const vehicleLabel = { carro: 'Carro', van: 'Van', moto: 'Moto', taxi: 'Táxi' }[t.vehicle] || t.vehicle;
  return `
    <div class="transport-card">
      <div class="transport-card__icon">${icon(vehicleIcon, 26)}</div>
      <div class="transport-card__body">
        <div class="transport-card__title">${t.title}</div>
        <div class="transport-card__route">${t.route}</div>
        <div class="transport-card__info">
          <span class="transport-card__price">${t.price}</span>
          <span>•</span>
          <span>${vehicleLabel}</span>
        </div>
      </div>
      <a class="btn-contact" href="https://wa.me/55${t.contact}" target="_blank" rel="noopener" aria-label="WhatsApp ${t.title}">
        ${icon('message-circle', 18)}
      </a>
    </div>
  `;
}

function typeColor(type) {
  return type === 'shows' ? '#ff9169' : '#c89060';
}

function buildNav(active) {
  const items = [
    { nav: 'home',   icon: 'house',   label: 'Inicio' },
    { nav: 'buscar', icon: 'search',  label: 'Buscar' },
    { nav: 'mapa',   icon: 'map-pin', label: 'Mapa'   },
  ];
  return `
    <nav class="bottom-nav">
      ${items.map(i => `
        <button class="nav-item ${i.nav === active ? 'active' : ''}" data-nav="${i.nav}">
          ${icon(i.icon, 24)}<span>${i.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function bindNav(page) {
  page.querySelectorAll('.nav-item[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.dataset.nav;
      if (dest === 'buscar') {
        state.buscarFilter = 'Todos';
        navigate('buscar');
        renderBuscar();
      } else {
        navigate(dest);
      }
    });
  });
}

/* ============================
   INIT
   ============================ */
function init() {
  buildHome();
  buildBuscar();
  buildMapa();
  buildDetail();
  navigate('home');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
