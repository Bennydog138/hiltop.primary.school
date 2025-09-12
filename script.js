/* Hiltop Primary — interactive behavior & JSON-driven content
   This file:
   - Renders staff, leadership, vacancies, events and gallery from JS arrays
   - Handles menu toggle, modal, lightbox, contact & apply forms
   - Updates the footer year
*/

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Utils ----------
  const el = (s) => document.querySelector(s);
  const els = (s) => Array.from(document.querySelectorAll(s));

  // Fill current year across pages
  const years = els('[id^="currentYear"]');
  years.forEach(y => y.textContent = new Date().getFullYear());

  // ---------- Mobile nav ----------
  const menuToggle = el('#menuToggle');
  const primaryNav = el('#primaryNav');
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      primaryNav.style.display = expanded ? '' : 'block';
    });
    // Close nav on link click (mobile)
    els('.nav-list a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth < 920) {
        primaryNav.style.display = '';
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    }));
  }

  // ---------- Data (replace/extend these arrays as needed) ----------
  const STAFF = [
    { name: 'Mrs Jane Smith', role: 'Headteacher', photo: 'images/headteacher.jpg', bio: 'Headteacher since 2014. Focuses on curriculum, inclusion and staff development.' },
    { name: 'Mr Tom Harris', role: 'Year 4 Teacher', photo: 'images/staff-1.jpg', bio: 'Leads maths and runs after-school chess and coding clubs.' },
    { name: 'Ms Rachel Green', role: 'SENCo', photo: 'images/staff-2.jpg', bio: 'Experienced SENDCo supporting children and families.' },
    { name: 'Mr Daniel Brooks', role: 'PE Lead', photo: 'images/staff-3.jpg', bio: 'Leads PE, sport and outdoor learning.' }
  ];

  const LEADERSHIP = [
    { name: 'Mrs Jane Smith', role: 'Headteacher', photo: 'images/headteacher.jpg', bio: 'Provides strategic leadership and drives school improvement.' },
    { name: 'Mr Tom Williams', role: 'Deputy Head', photo: 'images/deputy.jpg', bio: 'Leads teaching & learning and staff professional development.' }
  ];

  const VACANCIES = [
    { id: 1, title: 'KS2 Class Teacher', type: 'Full time', start: 'January 2026', closing: '2025-10-30', desc: 'Experienced teacher required for KS2' },
    { id: 2, title: 'Learning Support Assistant (LSA)', type: 'Part time', start: 'ASAP', closing: 'Open', desc: 'Support pupils with additional needs.' }
  ];

  const EVENTS = [
    { date: '2025-10-15', title: 'Open Morning', time: '09:30', desc: 'Prospective parents are welcome to tour the school.' },
    { date: '2025-11-03', title: 'Harvest Festival', time: '14:00', desc: 'Community harvest celebration.' },
    { date: '2025-12-18', title: 'End of Term Concert', time: '15:30', desc: 'Whole-school concert for families.' }
  ];

  const GALLERY = [
    { src: 'images/gallery-1.jpg', caption: 'Reception art day' },
    { src: 'images/gallery-2.jpg', caption: 'Sports Day' },
    { src: 'images/gallery-3.jpg', caption: 'Year 3 museum trip' },
    { src: 'images/gallery-4.jpg', caption: 'Science fair' }
  ];

  // ---------- Render staff preview (on index) ----------
  const staffPreview = el('#staffPreview');
  if (staffPreview) {
    staffPreview.innerHTML = STAFF.slice(0, 3).map(s => `
      <article class="card staff-card">
        <img src="${s.photo}" alt="${escapeHtml(s.name)} — ${escapeHtml(s.role)}" />
        <h3>${escapeHtml(s.name)}</h3>
        <p class="role small">${escapeHtml(s.role)}</p>
        <p class="small">${escapeHtml(s.bio)}</p>
      </article>
    `).join('');
  }

  // ---------- Render staff list (staff.html) with filter ----------
  const staffGrid = el('#staffGrid');
  const staffFilter = el('#staffFilter');
  if (staffGrid) {
    const renderStaff = (list) => {
      staffGrid.innerHTML = list.map(s => `
        <article class="card staff-card">
          <img src="${s.photo}" alt="${escapeHtml(s.name)} — ${escapeHtml(s.role)}" />
          <h3>${escapeHtml(s.name)}</h3>
          <p class="role">${escapeHtml(s.role)}</p>
          <p class="bio small">${escapeHtml(s.bio)}</p>
        </article>
      `).join('');
    };
    renderStaff(STAFF);
    if (staffFilter) {
      staffFilter.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        renderStaff(STAFF.filter(s => `${s.name} ${s.role} ${s.bio}`.toLowerCase().includes(q)));
      });
    }
  }

  // ---------- Leadership render ----------
  const leadershipGrid = el('#leadershipGrid');
  if (leadershipGrid) {
    leadershipGrid.innerHTML = LEADERSHIP.map(l => `
      <article class="card bio-card">
        <img src="${l.photo}" alt="${escapeHtml(l.name)} — ${escapeHtml(l.role)}" />
        <div>
          <h3>${escapeHtml(l.name)}</h3>
          <p class="role">${escapeHtml(l.role)}</p>
          <p class="small">${escapeHtml(l.bio)}</p>
        </div>
      </article>
    `).join('');
  }

  // ---------- Vacancies render & apply modal ----------
  const vacancyList = el('#vacancyList');
  if (vacancyList) {
    vacancyList.innerHTML = VACANCIES.map(v => `
      <article class="card vacancy">
        <h3>${escapeHtml(v.title)}</h3>
        <p class="small">${escapeHtml(v.type)} — Start: ${escapeHtml(v.start)} — Closing: ${escapeHtml(v.closing)}</p>
        <p>${escapeHtml(v.desc)}</p>
        <div class="vacancy-actions">
          <button class="btn apply-btn" data-id="${v.id}">Apply</button>
          <a class="link-more" href="mailto:hr@hiltop.school?subject=Application%20for%20${encodeURIComponent(v.title)}">Email HR</a>
        </div>
      </article>
    `).join('');

    // Apply modal wiring
    const applyModal = el('#applyModal');
    const applyForm = el('#applyForm');
    const applyPosition = el('#applyPosition');
    const applyResult = el('#applyResult');
    const openApply = (title) => {
      if (!applyModal) return;
      applyPosition.value = title;
      applyModal.setAttribute('aria-hidden', 'false');
    };
    const closeModal = () => applyModal?.setAttribute('aria-hidden', 'true');

    els('.apply-btn').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const vac = VACANCIES.find(v => String(v.id) === id);
      openApply(vac ? vac.title : btn.dataset.role || 'Vacancy');
    }));

    // Close buttons
    els('.modal-close').forEach(bt => bt.addEventListener('click', closeModal));
    if (applyModal) {
      applyModal.addEventListener('click', (ev) => { if (ev.target === applyModal) closeModal(); });
    }

    // Minimal submit handler (demo)
    if (applyForm) {
      applyForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        // Here you would POST to a server. We'll simulate success.
        applyResult.classList.remove('hidden');
        applyResult.textContent = 'Thank you — your application has been sent (demo).';
        applyForm.reset();
        setTimeout(() => { applyResult.classList.add('hidden'); closeModal(); }, 1800);
      });
    }
  }

  // ---------- Events: render + month filter ----------
  const eventsList = el('#eventsList');
  const eventMonth = el('#eventMonth');
  if (eventsList) {
    const parseMonth = (isoDate) => new Date(isoDate).toLocaleString(undefined, { month: 'long', year: 'numeric' });
    // populate month select
    const months = Array.from(new Set(EVENTS.map(e => parseMonth(e.date))));
    if (eventMonth) {
      months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m; opt.textContent = m;
        eventMonth.appendChild(opt);
      });
      eventMonth.addEventListener('change', () => renderEvents(eventMonth.value));
    }
    const renderEvents = (filter) => {
      const list = EVENTS.filter(ev => filter === 'all' || parseMonth(ev.date) === filter);
      eventsList.innerHTML = list.map(ev => `<li><time datetime="${ev.date}">${new Date(ev.date).toLocaleDateString()}</time> — <strong>${escapeHtml(ev.title)}</strong> ${ev.time ? '— ' + ev.time : ''} <div class="small">${escapeHtml(ev.desc)}</div></li>`).join('');
    };
    renderEvents('all');
  }

  // ---------- Gallery lightbox ----------
  const galleryGrid = el('#galleryGrid');
  if (galleryGrid) {
    // render gallery from GALLERY
    galleryGrid.innerHTML = GALLERY.map((g, i) => `
      <figure class="card" data-idx="${i}">
        <img src="${g.src}" alt="${escapeHtml(g.caption)}" />
        <figcaption>${escapeHtml(g.caption)}</figcaption>
      </figure>
    `).join('');

    const lightbox = el('#lightbox');
    const lightboxImg = el('#lightboxImg');
    const lightboxCaption = el('#lightboxCaption');
    const openLightbox = (src, caption) => {
      if (!lightbox) return;
      lightboxImg.src = src;
      lightboxImg.alt = caption;
      lightboxCaption.textContent = caption;
      lightbox.setAttribute('aria-hidden', 'false');
    };
    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
      lightboxCaption.textContent = '';
    };

    els('#galleryGrid figure').forEach(f => f.addEventListener('click', () => {
      const i = Number(f.dataset.idx);
      openLightbox(GALLERY[i].src, GALLERY[i].caption);
    }));

    const lbClose = el('.lightbox-close');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (ev) => { if (ev.target === lightbox) closeLightbox(); });
  }

  // ---------- Contact form handling (client-side only demo) ----------
  const contactForm = el('#contactForm');
  const contactResult = el('#contactResult');
  if (contactForm) {
    contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // Basic validation
      const form = new FormData(contactForm);
      if (!form.get('name') || !form.get('email') || !form.get('message')) {
        contactResult.classList.remove('hidden');
        contactResult.textContent = 'Please complete required fields.';
        return;
      }
      // Simulate success
      contactResult.classList.remove('hidden');
      contactResult.textContent = 'Thanks — your message has been sent (demo).';
      contactForm.reset();
      setTimeout(() => contactResult.classList.add('hidden'), 2200);
    });
  }

  // ---------- Helpers ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]);
    });
  }
});
