/**
 * RESTAURANT ISTANBUL DREUX — ATELIER CORE SCRIPT
 * Complete bilingual engine, category tab filter, review carousel & reservation handler
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. State Management
  const state = {
    lang: 'fr',
    currentCategory: 'sandwichs',
    carouselIndex: 0,
    carouselCardsPerView: getCardsPerView()
  };

  // Google Reviews Data (Dreux authentic verified reviews)
  const reviewsData = [
    {
      name: "Mehdi B.",
      date: "Il y a 2 mois",
      dateEn: "2 months ago",
      rating: 5,
      comment: "Meilleur kebab de Dreux sans hésiter ! Viande savoureuse, pain croustillant cuit sur place et accueil toujours au top. Les assiettes sont très copieuses. Je recommande les yeux fermés.",
      commentEn: "Undoubtedly the best kebab in Dreux! Exceptionally flavorful meat, fresh bread baked on site, and always warm hospitality. Very generous portions. Highly recommended!"
    },
    {
      name: "Sophie Laurent",
      date: "Il y a 3 mois",
      dateEn: "3 months ago",
      rating: 5,
      comment: "Superbe découverte au cœur de Dreux ! Le lahmacun et les brochettes d'agneau sont délicieux. Service rapide et avec le sourire. Très propre et convivial.",
      commentEn: "Wonderful find in the heart of Dreux! The crispy lahmacun and lamb skewers are delicious. Quick and smiling service. Spotlessly clean and friendly."
    },
    {
      name: "Karim T.",
      date: "Il y a 1 mois",
      dateEn: "1 month ago",
      rating: 5,
      comment: "Client fidèle depuis des années. La qualité est constante depuis 1992, la broche est bien travaillée et l'accueil est exemplaire. Bravo à toute l'équipe !",
      commentEn: "Loyal customer for years. The quality has remained consistently top-notch since 1992. The spit is handcrafted and hospitality is exemplary. Bravo to the entire team!"
    },
    {
      name: "Émilie R.",
      date: "Il y a 4 mois",
      dateEn: "4 months ago",
      rating: 5,
      comment: "Une excellente adresse à Dreux. Viande marinée parfumée et jamais grasse, frites dorées et thé turc offert très apprécié. Ambiance très agréable.",
      commentEn: "An excellent spot in Dreux. Well-marinated, never greasy meat, golden fries, and complimentary Turkish tea that was very appreciated. Lovely atmosphere."
    },
    {
      name: "David Morvan",
      date: "Il y a 2 semaines",
      dateEn: "2 weeks ago",
      rating: 5,
      comment: "Assiette mixte royale généreuse et savoureuse, viandes tendres cuites à point au grill. Très bon rapport qualité-prix. Ouvert tard le soir, c'est idéal !",
      commentEn: "Generous and flavorful royal mixed platter, tender flame-grilled meats. Outstanding quality and portion size. Open late until 1 AM, simply ideal!"
    }
  ];

  // DOM Elements
  const header = document.querySelector('.header-site');
  const langBtns = document.querySelectorAll('.lang-btn');
  const menuTabsBar = document.getElementById('menu-tabs');
  const menuContainer = document.getElementById('menu-items-container');
  const menuNoticeBox = document.getElementById('menu-notice-box');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const reviewsTrack = document.getElementById('reviews-track');
  const prevReviewBtn = document.getElementById('prev-review');
  const nextReviewBtn = document.getElementById('next-review');
  const reviewsDots = document.getElementById('reviews-dots');
  const reservationForm = document.getElementById('reservation-form');
  const bookingModal = document.getElementById('booking-modal');
  const modalClose = document.getElementById('modal-close');
  const modalSummary = document.getElementById('modal-summary');
  const whatsappConfirmBtn = document.getElementById('btn-whatsapp-confirm');
  const backToTopBtn = document.getElementById('back-to-top');

  // Helper: Get cards per view for reviews carousel
  function getCardsPerView() {
    if (window.innerWidth < 860) return 1;
    if (window.innerWidth < 1080) return 2;
    return 3;
  }

  window.addEventListener('resize', () => {
    const newPerView = getCardsPerView();
    if (newPerView !== state.carouselCardsPerView) {
      state.carouselCardsPerView = newPerView;
      state.carouselIndex = Math.min(state.carouselIndex, reviewsData.length - state.carouselCardsPerView);
      if (state.carouselIndex < 0) state.carouselIndex = 0;
      updateReviewsCarousel();
    }
  });

  // ------------------------------------------------------------------------
  // 2. Language Switcher (i18n Engine)
  // ------------------------------------------------------------------------
  function setLanguage(lang) {
    if (!translations[lang]) return;
    state.lang = lang;
    document.documentElement.lang = lang === 'fr' ? 'fr-FR' : 'en-US';

    // Update active button state
    langBtns.forEach(btn => {
      const isTarget = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
    });

    const dict = translations[lang];

    // Update document title and meta description
    if (dict.meta) {
      document.title = dict.meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', dict.meta.desc);
    }

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getNestedTranslation(dict, key);
      if (val !== undefined) {
        el.textContent = val;
      }
    });

    // Update data-i18n-html elements
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getNestedTranslation(dict, key);
      if (val !== undefined) {
        el.innerHTML = val;
      }
    });

    // Update form placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getNestedTranslation(dict, key);
      if (val !== undefined) {
        el.setAttribute('placeholder', val);
      }
    });

    // Re-render menu category tabs text
    renderCategoryTabs();

    // Re-render visible food cards in current category
    renderMenuCategory(state.currentCategory);

    // Re-render reviews carousel
    renderReviewsCarousel();
  }

  function getNestedTranslation(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && targetLang !== state.lang) {
        setLanguage(targetLang);
      }
    });
  });

  // ------------------------------------------------------------------------
  // 3. Category Tabs & Food Cards Rendering
  // ------------------------------------------------------------------------
  function renderCategoryTabs() {
    if (!menuTabsBar) return;
    const catKeys = Object.keys(menuDatabase);
    const dict = translations[state.lang].menu.categories;

    menuTabsBar.innerHTML = '';
    catKeys.forEach(catKey => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `menu-tab-btn ${catKey === state.currentCategory ? 'active' : ''}`;
      btn.setAttribute('data-category', catKey);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', catKey === state.currentCategory ? 'true' : 'false');
      btn.textContent = dict[catKey] || catKey;

      btn.addEventListener('click', () => {
        if (state.currentCategory !== catKey) {
          state.currentCategory = catKey;
          document.querySelectorAll('.menu-tab-btn').forEach(b => {
            const isSel = b.getAttribute('data-category') === catKey;
            b.classList.toggle('active', isSel);
            b.setAttribute('aria-selected', isSel ? 'true' : 'false');
          });
          renderMenuCategory(catKey);
        }
      });

      menuTabsBar.appendChild(btn);
    });
  }

  function renderMenuCategory(catKey) {
    if (!menuContainer) return;
    const items = menuDatabase[catKey] || [];
    const dict = translations[state.lang].menu;

    // Notice Box Handling
    if (menuNoticeBox) {
      if (catKey === 'sandwichs' || catKey === 'panini') {
        menuNoticeBox.style.display = 'flex';
        menuNoticeBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>${dict.noticeSandwich}</span>
        `;
      } else if (catKey === 'assiettes') {
        menuNoticeBox.style.display = 'flex';
        menuNoticeBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>${dict.noticePlates}</span>
        `;
      } else if (catKey === 'menu-enfant') {
        menuNoticeBox.style.display = 'flex';
        menuNoticeBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>${dict.noticeKids}</span>
        `;
      } else {
        menuNoticeBox.style.display = 'none';
      }
    }

    // Render Cards with gentle fade
    menuContainer.style.opacity = '0';
    setTimeout(() => {
      menuContainer.innerHTML = '';

      items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'food-card';

        const name = item.name[state.lang] || item.name.fr;
        const desc = item.desc[state.lang] || item.desc.fr;
        const tag = item.tag ? (item.tag[state.lang] || item.tag.fr) : null;
        const extraNote = item.extraNote ? (item.extraNote[state.lang] || item.extraNote.fr) : null;

        // Pricing Block
        let priceHtml = '';
        if (item.pricing.type === 'dual') {
          priceHtml = `
            <div class="food-price-dual">
              <span class="price-item"><span class="label">${dict.soloLabel}</span> <span class="val">${item.pricing.solo}</span></span>
              <span class="price-divider">/</span>
              <span class="price-item"><span class="label">${dict.menuLabel}</span> <span class="val">${item.pricing.menu}</span></span>
            </div>
          `;
        } else {
          priceHtml = `<span class="food-price-single">${item.pricing.price}</span>`;
        }

        card.innerHTML = `
          <div class="food-thumb-wrapper">
            <img src="${item.img}" alt="${name}" loading="lazy" onerror="this.src='assets/images/hero-sandwich.jpg'">
          </div>
          <div class="food-details">
            <div>
              <div class="food-header">
                <div class="food-name-group">
                  <h3 class="food-title">${name}</h3>
                  ${tag ? `<span class="food-tag">${tag}</span>` : ''}
                </div>
                <div class="food-leader"></div>
                <div class="food-price-box">
                  ${priceHtml}
                </div>
              </div>
              <p class="food-desc">${desc}</p>
            </div>
            ${extraNote ? `
              <div class="food-extra-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>${extraNote}</span>
              </div>
            ` : ''}
          </div>
        `;

        menuContainer.appendChild(card);
      });

      menuContainer.style.transition = 'opacity 0.25s ease';
      menuContainer.style.opacity = '1';
    }, 120);
  }

  // ------------------------------------------------------------------------
  // 4. Google Reviews Carousel
  // ------------------------------------------------------------------------
  function renderReviewsCarousel() {
    if (!reviewsTrack) return;
    reviewsTrack.innerHTML = '';

    reviewsData.forEach(rev => {
      const card = document.createElement('div');
      card.className = 'review-card';

      const comment = state.lang === 'fr' ? rev.comment : rev.commentEn;
      const date = state.lang === 'fr' ? rev.date : rev.dateEn;
      const verifiedText = state.lang === 'fr' ? 'Avis vérifié Google' : 'Google Verified';

      card.innerHTML = `
        <div class="review-card-top">
          <div class="review-stars">
            ${'<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'.repeat(rev.rating)}
          </div>
          <p class="review-quote">“${comment}”</p>
        </div>
        <div class="review-author">
          <div class="author-info">
            <span class="author-name">${rev.name}</span>
            <span class="review-date">${date}</span>
          </div>
          <span class="google-verified-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ${verifiedText}
          </span>
        </div>
      `;

      reviewsTrack.appendChild(card);
    });

    renderCarouselDots();
    updateReviewsCarousel();
  }

  function renderCarouselDots() {
    if (!reviewsDots) return;
    reviewsDots.innerHTML = '';
    const maxIndex = reviewsData.length - state.carouselCardsPerView;
    const totalDots = Math.max(1, maxIndex + 1);

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `carousel-dot ${i === state.carouselIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => {
        state.carouselIndex = i;
        updateReviewsCarousel();
      });
      reviewsDots.appendChild(dot);
    }
  }

  function updateReviewsCarousel() {
    if (!reviewsTrack) return;
    const cardWidthPercent = 100 / state.carouselCardsPerView;
    const gapOffset = (24 * state.carouselIndex) / state.carouselCardsPerView;
    const translateX = -(state.carouselIndex * cardWidthPercent);

    reviewsTrack.style.transform = `translateX(calc(${translateX}% - ${gapOffset}px))`;

    // Update dots
    const dots = reviewsDots ? reviewsDots.querySelectorAll('.carousel-dot') : [];
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === state.carouselIndex);
    });
  }

  if (prevReviewBtn) {
    prevReviewBtn.addEventListener('click', () => {
      const maxIndex = Math.max(0, reviewsData.length - state.carouselCardsPerView);
      state.carouselIndex = state.carouselIndex > 0 ? state.carouselIndex - 1 : maxIndex;
      updateReviewsCarousel();
    });
  }

  if (nextReviewBtn) {
    nextReviewBtn.addEventListener('click', () => {
      const maxIndex = Math.max(0, reviewsData.length - state.carouselCardsPerView);
      state.carouselIndex = state.carouselIndex < maxIndex ? state.carouselIndex + 1 : 0;
      updateReviewsCarousel();
    });
  }

  // Autoplay with hover pause
  let carouselInterval = setInterval(() => {
    if (nextReviewBtn) nextReviewBtn.click();
  }, 5000);

  const carouselSection = document.querySelector('.reviews-section');
  if (carouselSection) {
    carouselSection.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    carouselSection.addEventListener('mouseleave', () => {
      clearInterval(carouselInterval);
      carouselInterval = setInterval(() => {
        if (nextReviewBtn) nextReviewBtn.click();
      }, 5000);
    });
  }

  // ------------------------------------------------------------------------
  // 5. Reservation Form & Direct Booking Modal
  // ------------------------------------------------------------------------
  if (reservationForm) {
    // Set default date to today
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.value = today;
    }

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('res-name').value.trim();
      const phone = document.getElementById('res-phone').value.trim();
      const email = document.getElementById('res-email').value.trim();
      const date = document.getElementById('res-date').value;
      const time = document.getElementById('res-time').value;
      const guests = document.getElementById('res-guests').value;
      const message = document.getElementById('res-message').value.trim();

      if (!name || !phone || !date || !time || !guests) {
        alert(state.lang === 'fr' ? 'Veuillez remplir tous les champs obligatoires (*)' : 'Please fill in all required fields (*)');
        return;
      }

      // Format summary text
      const isFr = state.lang === 'fr';
      if (modalSummary) {
        modalSummary.innerHTML = `
          <strong>${isFr ? 'Détails de la réservation :' : 'Reservation Details:'}</strong><br>
          • <strong>${isFr ? 'Client :' : 'Guest:'}</strong> ${name} (${phone})<br>
          • <strong>${isFr ? 'Date & Heure :' : 'Date & Time:'}</strong> ${date} à ${time}<br>
          • <strong>${isFr ? 'Couverts :' : 'Party Size:'}</strong> ${guests} ${isFr ? 'personne(s)' : 'guest(s)'}<br>
          ${message ? `• <strong>${isFr ? 'Demande :' : 'Note:'}</strong> ${message}` : ''}
        `;
      }

      // WhatsApp URL generation
      const waText = encodeURIComponent(
        isFr
          ? `Bonjour Restaurant Istanbul Dreux, je souhaite réserver une table :\n- Nom : ${name}\n- Téléphone : ${phone}\n- Date : ${date}\n- Heure : ${time}\n- Nombre de personnes : ${guests}${message ? `\n- Message : ${message}` : ''}`
          : `Hello Istanbul Restaurant Dreux, I would like to reserve a table:\n- Name: ${name}\n- Phone: ${phone}\n- Date: ${date}\n- Time: ${time}\n- Guests: ${guests}${message ? `\n- Note: ${message}` : ''}`
      );

      if (whatsappConfirmBtn) {
        whatsappConfirmBtn.href = `https://wa.me/33237558597?text=${waText}`;
      }

      // Open modal
      if (bookingModal) {
        bookingModal.classList.add('active');
        bookingModal.setAttribute('aria-hidden', 'false');
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (bookingModal) {
        bookingModal.classList.remove('active');
        bookingModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
        bookingModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ------------------------------------------------------------------------
  // 6. Mobile Drawer Navigation
  // ------------------------------------------------------------------------
  function openDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.add('open');
      drawerBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.remove('open');
      drawerBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ------------------------------------------------------------------------
  // 7. Header Scroll Behavior & Back to Top
  // ------------------------------------------------------------------------
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------------
  // 8. Initial Execution
  // ------------------------------------------------------------------------
  setLanguage('fr');
});
