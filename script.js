// =========================================================
// LUMORA — interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ---------- World art: small original SVG scenes, one per show ---------- */
  /* Reused for both episode-card thumbnails and the show-switcher panel. */
  const worldArt = {
    emberfall: `<img src="assets/images/solo.jpg" alt="Solo Leveling artwork" loading="lazy">`,
    glasswood: `<img src="assets/images/artoria.jpg" alt="Artoria artwork" loading="lazy">`,
    starling: `<img src="assets/images/maki-rukia.jpg" alt="Anime character artwork" loading="lazy">`,
    tidecaller: `<img src="assets/images/saber.jpg" alt="Saber artwork" loading="lazy">`
  };

  function paintWorldArt(scope){
    scope.querySelectorAll('.ep-art').forEach(art => {
      const card = art.closest('.ep-card');
      const key = card ? card.dataset.show : null;
      if (key && worldArt[key]) art.innerHTML = worldArt[key];
    });
  }
  paintWorldArt(document);

  /* ---------- Show data + tab switcher ---------- */
  const shows = {
    emberfall: {
      genre: 'Fantasy adventure',
      title: 'Emberfall Chronicles',
      desc: 'A dragon-rider with more grudges than allies defends a village that only exists at dusk — one flame, and one hard choice, at a time.',
      seasons: '2', episodes: '24', rating: 'All ages'
    },
    glasswood: {
      genre: 'Cozy mystery',
      title: 'The Glasswood',
      desc: 'A forest where lost things go to be found. Moss, a gentle golem guide, helps every visitor track down what — or who — they\'re really looking for.',
      seasons: '1', episodes: '16', rating: 'All ages'
    },
    starling: {
      genre: 'Space fantasy',
      title: 'Starling & the Nine Realms',
      desc: 'Starling Vale hops between nine floating realms with Nyx, her shape-shifting fox-spirit, hunting for a way home that keeps changing shape.',
      seasons: '3', episodes: '36', rating: 'All ages'
    },
    tidecaller: {
      genre: 'Ocean fantasy',
      title: 'Tidecaller',
      desc: 'Young Captain Wren commands a living coral ship across the Salt Divide, where the tide keeps its own memory of every sailor who\'s crossed it.',
      seasons: '1', episodes: '12', rating: 'All ages'
    }
  };

  const showTabs = document.querySelectorAll('.show-tab');
  const showPanel = document.getElementById('showPanel');

  function renderShow(key){
    const s = shows[key];
    showPanel.innerHTML = `
      <div class="show-panel-art">${worldArt[key]}</div>
      <div class="show-panel-body">
        <span class="show-genre">${s.genre}</span>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <div class="show-stats">
          <div><strong>${s.seasons}</strong><span>Season${s.seasons > 1 ? 's' : ''}</span></div>
          <div><strong>${s.episodes}</strong><span>Episodes</span></div>
          <div><strong>${s.rating}</strong><span>Rating</span></div>
        </div>
        <button class="btn btn-primary" data-open-modal data-modal-title="${s.title}" data-modal-sub="Watch the latest episode">
          <i class="fa-solid fa-play"></i>Watch trailer
        </button>
      </div>
    `;
    bindModalTriggers(showPanel);
  }

  showTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      renderShow(tab.dataset.show);
    });
  });

  renderShow('emberfall');

  /* ---------- Episode filters ---------- */
  const filterChips = document.querySelectorAll('.filter-chip');
  const episodeCards = document.querySelectorAll('.ep-card');

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;

      episodeCards.forEach(card => {
        const match = filter === 'all' || card.dataset.show === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---------- Character cards: tap-to-flip for touch devices ---------- */
  const charCards = document.querySelectorAll('.char-card');
  charCards.forEach(card => {
    card.addEventListener('click', () => {
      // Only toggle manually on touch devices; hover already handles desktop
      if (window.matchMedia('(hover: none)').matches){
        charCards.forEach(c => { if (c !== card) c.classList.remove('is-flipped'); });
        card.classList.toggle('is-flipped');
      }
    });
  });

  /* ---------- Video modal ---------- */
  const modal = document.getElementById('videoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const modalVideo = document.getElementById('modalVideo');
  const trailerSrc = 'assets/videos/lumora-trailer.mp4';

  function openModal(title, sub, poster){
    modalTitle.textContent = title || 'Now playing';
    modalSub.textContent = sub || '';
    if (modalVideo){
      modalVideo.pause();
      modalVideo.src = trailerSrc;
      if (poster) modalVideo.poster = poster;
      modalVideo.load();
      modalVideo.play().catch(() => {});
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    if (modalVideo){
      modalVideo.pause();
      modalVideo.removeAttribute('src');
      modalVideo.load();
    }
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function bindModalTriggers(scope){
    scope.querySelectorAll('[data-open-modal]').forEach(el => {
      if (el.dataset.modalBound === 'true') return;
      el.dataset.modalBound = 'true';
      el.addEventListener('click', () => {
        const image = el.querySelector('img') || el.closest('.ep-card')?.querySelector('.ep-art img') || el.closest('.show-panel')?.querySelector('.show-panel-art img');
        const poster = image?.getAttribute('src') || 'assets/images/solo.jpg';
        openModal(el.dataset.modalTitle, el.dataset.modalSub, poster);
      });
    });
  }

  bindModalTriggers(document);

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- Hero parallax (subtle, desktop, mouse-driven only) ---------- */
  const screen = document.querySelector('.liquid-screen');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (screen && !reduceMotion && window.matchMedia('(hover: hover)').matches){
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = document.querySelector('.hero').getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      screen.style.transform = `rotate(${x * 3}deg) translate(${x * 10}px, ${y * 10}px)`;
    });
  }

  /* ---------- Comments ---------- */
  const commentAvatarColors = ['#E8B85C', '#7BC9A6', '#9B5DE5', '#E86B9B', '#34D9C0'];
  let comments = [
    { name: 'Priya K.', show: 'Emberfall Chronicles', time: '2 days ago', text: 'The Final Ember made me tear up, not gonna lie. Ember\'s arc this season has been so worth the wait.', likes: 24 },
    { name: 'Owen R.', show: 'The Glasswood', time: '4 days ago', text: 'Moss is the most comforting character on television. "What Moss Remembers" is my new favorite episode of anything.', likes: 15 },
    { name: 'Aiko T.', show: 'Starling & the Nine Realms', time: '1 week ago', text: 'Nine doors and I still can\'t predict which one Starling opens next. The Ninth Door twist was unreal.', likes: 31 },
    { name: 'Marcus D.', show: 'Tidecaller', time: '1 week ago', text: 'Only 12 episodes so far but Tidecaller has the best world-building of the four shows imo. More Captain Wren please.', likes: 9 }
  ];

  const commentList = document.getElementById('commentList');
  const commentsCount = document.getElementById('commentsCount');
  const commentForm = document.getElementById('commentForm');
  const commentNameInput = document.getElementById('commentName');
  const commentTextInput = document.getElementById('commentText');

  function initials(name){
    return name.split(' ').filter(Boolean).slice(0,2).map(p => p[0].toUpperCase()).join('');
  }

  function renderComments(){
    commentsCount.textContent = `${comments.length} comment${comments.length === 1 ? '' : 's'}`;
    commentList.innerHTML = comments.map((c, i) => `
      <div class="comment">
        <div class="comment-avatar" style="background:${commentAvatarColors[i % commentAvatarColors.length]}">${initials(c.name)}</div>
        <div class="comment-body">
          <div class="comment-head">
            <span class="comment-name">${c.name}</span>
            ${c.show ? `<span class="comment-show">${c.show}</span>` : ''}
            <span class="comment-time">${c.time}</span>
          </div>
          <p class="comment-text">${c.text}</p>
          <div class="comment-actions">
            <button type="button" class="comment-like" data-index="${i}"><i class="fa-regular fa-heart"></i><span>${c.likes}</span></button>
            <button type="button" class="comment-reply-btn">Reply</button>
          </div>
        </div>
      </div>
    `).join('');

    commentList.querySelectorAll('.comment-like').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const liked = btn.classList.toggle('liked');
        comments[idx].likes += liked ? 1 : -1;
        btn.querySelector('i').className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        btn.querySelector('span').textContent = comments[idx].likes;
      });
    });
  }

  if (commentForm){
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = commentNameInput.value.trim();
      const text = commentTextInput.value.trim();
      if (!name || !text) return;

      comments.unshift({ name, show: null, time: 'Just now', text, likes: 0 });
      renderComments();
      commentForm.reset();
      commentNameInput.focus();
    });

    renderComments();
  }

});
