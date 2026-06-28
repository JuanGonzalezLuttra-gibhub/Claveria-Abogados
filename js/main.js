/* ============================================================
   CLAVERÍA ABOGADOS — Main JavaScript
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================
const state = {
  diagAnswers: { area: null, urgency: null, concern: null },
  formData: { area: null, urgency: null, concern: null },
  currentDiagStep: 1,
  currentFormStep: 1,
  formUrgencySelected: false,
  formConcernSelected: false,
};

// ============================================================
// HEADER BEHAVIOR
// ============================================================
(function initHeader() {
  const header = document.getElementById('header');
  const heroSection = document.getElementById('hero');

  function updateHeader() {
    const scrolled = window.scrollY > 60;
    const heroBottom = heroSection ? heroSection.offsetHeight - 80 : 400;
    const pastHero = window.scrollY > heroBottom;

    header.classList.toggle('scrolled', scrolled);

    if (pastHero) {
      header.classList.remove('hero-mode');
    } else {
      header.classList.add('hero-mode');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
})();

// ============================================================
// MOBILE MENU
// ============================================================
(function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  const close = document.getElementById('mobileMenuClose');
  const links = menu.querySelectorAll('.mobile-menu__link');

  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('mobile-menu-active');
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-active');
  }


  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  close.addEventListener('click', closeMenu);

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

// ============================================================
// HERO IMAGE PARALLAX + LOADED STATE
// ============================================================
(function initHero() {
  const hero = document.getElementById('hero');
  const heroImg = document.getElementById('heroImage');

  if (heroImg) {
    heroImg.addEventListener('load', () => {
      hero.classList.add('loaded');
    });
    if (heroImg.complete) {
      hero.classList.add('loaded');
    }
  }

  // Subtle parallax on scroll
  window.addEventListener('scroll', () => {
    if (heroImg && window.scrollY < window.innerHeight) {
      heroImg.style.transform = `scale(1.04) translateY(${window.scrollY * 0.12}px)`;
    }
  }, { passive: true });
})();

// ============================================================
// SCROLL ANIMATIONS — IntersectionObserver
// All animations RESET when element leaves viewport,
// so they replay on re-scroll.
// ============================================================
(function initScrollAnimations() {
  const animClasses = [
    '.fade-up', '.fade-in', '.slide-left', '.slide-right', '.scale-in'
  ];

  const elements = document.querySelectorAll(animClasses.join(', '));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        // Reset: replay on re-scroll
        entry.target.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

// ============================================================
// ANIMATED COUNTERS
// ============================================================
(function initCounters() {
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      } else {
        // Reset counter when out of view so it animates again
        const el = entry.target;
        const decimals = parseInt(el.dataset.decimals || 0);
        el.textContent = decimals > 0 ? (0).toFixed(decimals) : '0';
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || 0);
    const duration = 2000;
    const start = performance.now();

    // Easing: ease-out cubic
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = target * eased;

      el.textContent = decimals > 0
        ? current.toFixed(decimals)
        : Math.floor(current).toString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = decimals > 0 ? target.toFixed(decimals) : Math.floor(target).toString();
      }
    }

    requestAnimationFrame(step);
  }
})();

// ============================================================
// DIAGNOSTIC WIZARD
// ============================================================
const diagResults = {
  familia: {
    urgente: {
      coste:       { title: 'Tu caso tiene opciones urgentes', text: 'Los procedimientos familiares urgentes requieren actuación inmediata. Podemos orientarte sobre medidas cautelares y calcular los costes reales desde el primer momento.' },
      tiempo:      { title: 'Entendemos que el tiempo importa', text: 'En procesos familiares urgentes actuamos con rapidez. Podemos iniciar el procedimiento en días y mantenerte informado en cada paso.' },
      resultado:   { title: 'Tu caso tiene solución', text: 'En derecho de familia, el resultado depende de la estrategia. Analizaremos tu situación concreta y te diremos con honestidad qué puedes esperar.' },
      informacion: { title: 'Estás en el lugar correcto', text: 'No tienes que entender la ley, para eso estamos nosotros. En la primera consulta te explicamos todo en lenguaje claro y sin rodeos.' },
    },
    'no-urgente': {
      coste:       { title: 'Podemos planificarlo sin prisas', text: 'Si el caso no es urgente, podemos diseñar la estrategia más eficiente en costes. Transparencia total en honorarios desde el primer día.' },
      tiempo:      { title: 'Un proceso planificado es más eficaz', text: 'Sin urgencia, podemos buscar acuerdos y soluciones amistosas que acorten significativamente los plazos. Menos tiempo, menos coste.' },
      resultado:   { title: 'Tu caso tiene opciones reales', text: 'Los asuntos familiares bien planificados suelen resolverse con mejores resultados. Analizaremos tus opciones con calma y rigor.' },
      informacion: { title: 'La información es poder', text: 'Entiende tu situación antes de tomar ninguna decisión. Una consulta bien informada puede ahorrarte meses de incertidumbre.' },
    },
  },
  herencias: {
    urgente: {
      coste:       { title: 'Las herencias tienen plazos fiscales', text: 'Algunos plazos en sucesiones pueden generar costes adicionales si se incumplen. Actuamos rápido para proteger tu patrimonio y optimizar la fiscalidad.' },
      tiempo:      { title: 'Hay plazos legales que respetar', text: 'En herencias, el tiempo es clave para evitar sanciones fiscales. Actuamos con urgencia para proteger tus derechos y los de tu familia.' },
      resultado:   { title: 'Tu herencia merece protección', text: 'Protegeremos tus derechos hereditarios con rigor. Analizamos el testamento, la masa hereditaria y tus opciones reales.' },
      informacion: { title: 'Los trámites de herencia son complejos', text: 'Hay muchos pasos en una herencia: aceptación, impuestos, reparto... Te guiamos en cada uno sin que tengas que entender la ley.' },
    },
    'no-urgente': {
      coste:       { title: 'Planificamos la sucesión a tu ritmo', text: 'Si tienes tiempo, podemos diseñar la estrategia fiscal más eficiente y minimizar el impuesto de sucesiones dentro de la ley.' },
      tiempo:      { title: 'Una herencia bien gestionada es más rápida', text: 'Sin urgencia, podemos preparar todo correctamente desde el principio, evitando errores que luego alargan el proceso.' },
      resultado:   { title: 'Tu patrimonio, protegido', text: 'Una buena planificación sucesoria puede marcar una gran diferencia en el resultado final. Analizamos todas las opciones.' },
      informacion: { title: 'Las herencias generan muchas dudas', text: 'Es normal no saber por dónde empezar. En la primera consulta te explicamos cada paso con claridad y sin tecnicismos.' },
    },
  },
  laboral: {
    urgente: {
      coste:       { title: 'Hay plazos muy cortos en despidos', text: 'En despidos, solo tienes 20 días hábiles para reclamar. Actuamos de inmediato y calculamos tu indemnización real desde el primer momento.' },
      tiempo:      { title: 'Los plazos laborales son críticos', text: 'En derecho laboral, los plazos son cortos y fatales. Actuamos con urgencia para no perder tus derechos.' },
      resultado:   { title: 'Tu indemnización puede ser mayor de lo que crees', text: 'Muchas personas aceptan indemnizaciones insuficientes. Calculamos lo que te corresponde y actuamos para conseguirlo.' },
      informacion: { title: 'Conoce tus derechos laborales', text: 'Muchas personas no saben que tienen derechos tras un despido o conflicto laboral. Te los explicamos con claridad.' },
    },
    'no-urgente': {
      coste:       { title: 'Maximizamos tu indemnización', text: 'Sin urgencia inmediata, podemos estudiar tu situación con detalle y diseñar la estrategia que maximice tu compensación.' },
      tiempo:      { title: 'Aún tienes tiempo para actuar', text: 'Si no hay urgencia inmediata, podemos planificar la mejor estrategia para tu situación laboral.' },
      resultado:   { title: 'Tu caso laboral tiene opciones', text: 'Analizamos tu contrato, situación y objetivos para diseñar la estrategia más efectiva.' },
      informacion: { title: 'Entiende tu situación laboral', text: 'El derecho laboral tiene muchos matices. En la primera consulta te explicamos qué derechos tienes y cuáles son tus opciones.' },
    },
  },
  civil: {
    urgente: {
      coste:       { title: 'Actuamos con eficiencia en reclamaciones urgentes', text: 'Las reclamaciones civiles urgentes requieren medidas cautelares o actuación inmediata. Te orientamos sobre costes reales desde el primer momento.' },
      tiempo:      { title: 'Los plazos en derecho civil son importantes', text: 'Algunas reclamaciones tienen plazos de prescripción. Actuamos con rapidez para proteger tus derechos.' },
      resultado:   { title: 'Tu reclamación tiene opciones', text: 'Analizamos la viabilidad de tu caso con honestidad. Si hay base legal, actuamos con determinación para conseguir el mejor resultado.' },
      informacion: { title: 'Las reclamaciones civiles pueden ser complejas', text: 'Te explicamos qué opciones tienes, qué probabilidad tienen y cuáles son los pasos a seguir.' },
    },
    'no-urgente': {
      coste:       { title: 'Diseñamos la estrategia más eficiente', text: 'Sin urgencia inmediata, podemos buscar vías extrajudiciales más económicas o diseñar el litigio de forma eficiente.' },
      tiempo:      { title: 'Una reclamación bien preparada es más eficaz', text: 'Con tiempo, podemos preparar un caso sólido que aumente las probabilidades de éxito y reduzca el tiempo total.' },
      resultado:   { title: 'Tu caso civil tiene solución', text: 'Analizamos tu situación concreta, los documentos disponibles y las opciones reales que tienes.' },
      informacion: { title: 'Entendemos tu situación', text: 'Antes de decidir si actuar, te explicamos exactamente qué tienes, qué opciones existen y qué puedes esperar de cada una.' },
    },
  },
  inmobiliario: {
    urgente: {
      coste:       { title: 'Protegemos tu patrimonio con urgencia', text: 'Los conflictos inmobiliarios urgentes pueden tener grandes consecuencias económicas. Actuamos de inmediato con presupuesto claro.' },
      tiempo:      { title: 'Los plazos inmobiliarios son críticos', text: 'Algunos procedimientos inmobiliarios (lanzamientos, cautelares) tienen plazos muy cortos. Actuamos con rapidez.' },
      resultado:   { title: 'Tu propiedad merece la mejor defensa', text: 'Analizamos tu situación concreta y diseñamos la estrategia que mejor protege tus intereses inmobiliarios.' },
      informacion: { title: 'Los conflictos inmobiliarios generan muchas dudas', text: 'Contratos, arrendamientos, comunidades... Te explicamos todo con claridad para que tomes decisiones informadas.' },
    },
    'no-urgente': {
      coste:       { title: 'Planificamos con eficiencia', text: 'Sin urgencia, diseñamos la estrategia inmobiliaria más eficiente en costes, explorando vías extrajudiciales cuando sea posible.' },
      tiempo:      { title: 'Una operación inmobiliaria bien gestionada', text: 'Con tiempo, podemos revisar contratos, negociar condiciones y proteger tus intereses antes de que el problema se complique.' },
      resultado:   { title: 'Tu patrimonio inmobiliario, protegido', text: 'Analizamos tu situación y tus objetivos para diseñar la estrategia que mejor protege tu inversión.' },
      informacion: { title: 'El derecho inmobiliario tiene muchos matices', text: 'Compraventa, arrendamiento, comunidades, hipotecas... Te explicamos qué aplica a tu situación concreta.' },
    },
  },
  otro: {
    urgente: {
      coste:       { title: 'Te orientamos cueste lo que cueste', text: 'Aunque no tengas claro tu situación, podemos orientarte rápidamente. La primera consulta puede ser el inicio de la solución.' },
      tiempo:      { title: 'Actuamos con urgencia desde la primera llamada', text: 'No importa si no sabes exactamente qué tipo de problema tienes. Escuchamos, analizamos y actuamos.' },
      resultado:   { title: 'Hay opciones aunque no lo sepas aún', text: 'Muchas personas llegan sin saber si tienen un problema legal. Nuestra primera tarea es orientarte con honestidad.' },
      informacion: { title: 'La incertidumbre es lo primero que resolvemos', text: 'Si no sabes por dónde empezar, empieza por aquí. En la primera consulta te damos el mapa completo de tu situación.' },
    },
    'no-urgente': {
      coste:       { title: 'Exploramos tu situación sin prisas', text: 'Sin urgencia, podemos analizar tu situación con detalle y orientarte sobre si existe un problema legal y cómo abordarlo.' },
      tiempo:      { title: 'Con calma, encontramos la solución correcta', text: 'Tomamos el tiempo necesario para entender tu situación y recomendarte el camino más adecuado.' },
      resultado:   { title: 'Siempre hay opciones', text: 'Aunque ahora no tengas claro tu situación, podemos ayudarte a entenderla y encontrar el camino correcto.' },
      informacion: { title: 'Eso es exactamente lo que hacemos', text: 'Orientarte, informarte y ayudarte a tomar decisiones con seguridad. Sin tecnicismos, sin rodeos.' },
    },
  },
};

// Default fallback result
const defaultResult = {
  title: 'Tu caso tiene solución',
  text: 'Basándonos en tu situación, podemos orientarte desde el primer momento. Nuestros abogados especializados te explicarán tus opciones con claridad.',
};

// Label maps (declared here so they're available to showDiagResult and form summary)
const areaLabels = {
  familia:      'Derecho de Familia',
  herencias:    'Herencias y Sucesiones',
  laboral:      'Derecho Laboral',
  civil:        'Derecho Civil',
  inmobiliario: 'Derecho Inmobiliario',
  otro:         'Orientación general',
};

const urgencyLabels = {
  'urgente':    'Sí, es urgente',
  'no-urgente': 'Puedo esperar',
};

const concernLabels = {
  coste:       'El coste',
  tiempo:      'El tiempo',
  resultado:   'El resultado',
  informacion: 'La información',
};

function getResult() {
  const { area, urgency, concern } = state.diagAnswers;
  try {
    return diagResults[area][urgency][concern] || defaultResult;
  } catch (e) {
    return defaultResult;
  }
}

// Select option in diagnostic
window.selectDiagOption = function(btn, step) {
  const parent = btn.closest('.diagnostic__options, .diagnostic__step');
  const opts = parent ? parent.querySelectorAll('.diagnostic__option') : [];

  opts.forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');

  const value = btn.dataset.value;

  if (step === 1) {
    state.diagAnswers.area = value;
    document.getElementById('diag-next-1').disabled = false;
  } else if (step === 2) {
    state.diagAnswers.urgency = value;
    document.getElementById('diag-next-2').disabled = false;
  } else if (step === 3) {
    state.diagAnswers.concern = value;
    document.getElementById('diag-next-3').disabled = false;
  }
};

function setDiagProgress(step) {
  const fill = document.getElementById('diagProgress');
  const percent = step === 'result' ? 100 : ((step - 1) / 3) * 100;
  fill.style.width = percent + '%';
}

window.nextDiagStep = function(step) {
  document.getElementById(`diag-step-${step - 1}`).classList.remove('active');
  document.getElementById(`diag-step-${step}`).classList.add('active');
  setDiagProgress(step);
  state.currentDiagStep = step;
};

window.prevDiagStep = function(step) {
  document.getElementById(`diag-step-${step + 1}`).classList.remove('active');
  document.getElementById(`diag-step-${step}`).classList.add('active');
  setDiagProgress(step);
  state.currentDiagStep = step;
};

window.showDiagResult = function() {
  document.getElementById(`diag-step-3`).classList.remove('active');
  const result = getResult();
  const { area, urgency, concern } = state.diagAnswers;

  document.getElementById('diag-result-title').textContent = result.title;
  document.getElementById('diag-result-text').textContent = result.text;

  // Populate summary block
  const summaryBlock = document.getElementById('diag-result-summary');
  if (summaryBlock && area) {
    document.getElementById('diag-sum-area').textContent = areaLabels[area] || area;
    document.getElementById('diag-sum-urgency').textContent = urgencyLabels[urgency] || urgency;
    document.getElementById('diag-sum-concern').textContent = concernLabels[concern] || concern;
    summaryBlock.style.display = 'block';
  }

  document.getElementById(`diag-result`).classList.add('active');
  setDiagProgress('result');
};

window.resetDiag = function() {
  ['diag-step-2', 'diag-step-3', 'diag-result'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
  document.getElementById('diag-step-1').classList.add('active');
  setDiagProgress(1);
  state.diagAnswers = { area: null, urgency: null, concern: null };
  document.querySelectorAll('.diagnostic__option').forEach(o => o.classList.remove('selected'));
  document.getElementById('diag-next-1').disabled = true;
  document.getElementById('diag-next-2').disabled = true;
  document.getElementById('diag-next-3').disabled = true;
  state.currentDiagStep = 1;
};

// ============================================================
// FORM — Multi-step with diagnostic pre-fill
// ============================================================


// Pre-fill form from diagnostic answers — jumps directly to step 3
window.prefillForm = function() {
  const { area, urgency, concern } = state.diagAnswers;

  if (area) {
    state.formData.area = area;
    const opts = document.querySelectorAll('#form-area-options .form__option');
    opts.forEach(o => o.classList.toggle('selected', o.dataset.value === area));
    document.getElementById('form-next-1').disabled = false;
  }

  if (urgency) {
    state.formData.urgency = urgency;
    const opts = document.querySelectorAll('#form-urgency-options .form__option');
    opts.forEach(o => o.classList.toggle('selected', o.dataset.value === urgency));
    state.formUrgencySelected = true;
    document.getElementById('form-next-2').disabled = false;
  }

  if (concern) {
    state.formData.concern = concern;
    const opts = document.querySelectorAll('#form-concern-options .form__option');
    opts.forEach(o => o.classList.toggle('selected', o.dataset.value === concern));
    state.formConcernSelected = true;
  }

  checkFormStep2();

  // Update summary values first
  updateFormSummary();

  // Jump directly to step 3 — skip steps 1 and 2
  ['form-step-1', 'form-step-2', 'form-step-3'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
  document.getElementById('form-step-3').classList.add('active');
  state.currentFormStep = 3;

  // Mark steps 1 and 2 as completed, step 3 as active
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`form-dot-${i}`);
    dot.classList.remove('active', 'completed');
    if (i < 3) dot.classList.add('completed');
    if (i === 3) dot.classList.add('active');
  }

  // Scroll to the contact section smoothly
  const contactSection = document.getElementById('contacto');
  if (contactSection) {
    setTimeout(() => {
      const offset = 80;
      const top = contactSection.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  }

  // Focus name field after scroll
  setTimeout(() => {
    const nameField = document.getElementById('contact-name');
    if (nameField) nameField.focus();
  }, 600);
};

function checkFormStep2() {
  const hasUrgency = state.formData.urgency !== null;
  const hasConcern = state.formData.concern !== null;
  document.getElementById('form-next-2').disabled = !(hasUrgency && hasConcern);
}

window.selectFormOption = function(btn, type, step) {
  const groupId = type === 'area' ? 'form-area-options'
    : type === 'urgency' ? 'form-urgency-options'
    : 'form-concern-options';

  const opts = document.querySelectorAll(`#${groupId} .form__option`);
  opts.forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');

  const value = btn.dataset.value;

  if (type === 'area') {
    state.formData.area = value;
    document.getElementById('form-next-1').disabled = false;
  } else if (type === 'urgency') {
    state.formData.urgency = value;
    state.formUrgencySelected = true;
    checkFormStep2();
  } else if (type === 'concern') {
    state.formData.concern = value;
    state.formConcernSelected = true;
    checkFormStep2();
  }
};

function updateFormDots(step) {
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`form-dot-${i}`);
    dot.classList.remove('active', 'completed');
    if (i < step) dot.classList.add('completed');
    if (i === step) dot.classList.add('active');
  }
}

window.nextFormStep = function(step) {
  document.getElementById(`form-step-${step - 1}`).classList.remove('active');
  document.getElementById(`form-step-${step}`).classList.add('active');
  updateFormDots(step);
  state.currentFormStep = step;

  // When reaching step 3, show diagnostic summary
  if (step === 3) {
    updateFormSummary();
  }
};

// Update summary block in form step 3 — always show with current values
function updateFormSummary() {
  const { area, urgency, concern } = state.formData;

  const areaEl = document.getElementById('form-sum-area');
  const urgencyEl = document.getElementById('form-sum-urgency');
  const concernEl = document.getElementById('form-sum-concern');

  if (areaEl) areaEl.textContent = areaLabels[area] || '—';
  if (urgencyEl) urgencyEl.textContent = urgencyLabels[urgency] || '—';
  if (concernEl) concernEl.textContent = concernLabels[concern] || '—';
}

window.prevFormStep = function(step) {
  document.getElementById(`form-step-${step + 1}`).classList.remove('active');
  document.getElementById(`form-step-${step}`).classList.add('active');
  updateFormDots(step);
  state.currentFormStep = step;
};

window.submitForm = function() {
  const name = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const email = document.getElementById('contact-email').value.trim();

  if (!name || !phone || !email) {
    // Basic validation
    if (!name) document.getElementById('contact-name').focus();
    else if (!phone) document.getElementById('contact-phone').focus();
    else if (!email) document.getElementById('contact-email').focus();
    return;
  }

  // In production: send data to backend/email service here
  console.log('Form submission:', {
    ...state.formData,
    name,
    phone,
    email,
  });

  // Show success
  document.getElementById('form-step-3').classList.remove('active');
  document.getElementById('form-success').classList.add('active');
  document.getElementById('formStepsIndicator').style.display = 'none';

  // Update dots to completed
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`form-dot-${i}`).classList.add('completed');
    document.getElementById(`form-dot-${i}`).classList.remove('active');
  }
};

// ============================================================
// FAQ ACCORDION
// ============================================================
window.toggleFaq = function(btn) {
  const item = btn.closest('.faq-item');
  const body = item.querySelector('.faq-item__body');
  const isOpen = item.classList.contains('open');

  // Close all open items smoothly
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    const openBody = openItem.querySelector('.faq-item__body');
    openItem.classList.remove('open');
    // Collapse: animate height to 0
    openBody.style.height = openBody.scrollHeight + 'px';
    requestAnimationFrame(() => {
      openBody.style.height = '0';
      openBody.style.opacity = '0';
      openBody.style.transform = 'translateY(-8px)';
    });
  });

  // Open this one if it was closed
  if (!isOpen) {
    item.classList.add('open');
    // Expand: measure real height and animate to it
    body.style.height = '0';
    body.style.opacity = '0';
    body.style.transform = 'translateY(-8px)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targetH = body.scrollHeight;
        body.style.height = targetH + 'px';
        body.style.opacity = '1';
        body.style.transform = 'translateY(0)';
        // After transition ends, release height constraint for dynamic content
        body.addEventListener('transitionend', function cleanup(e) {
          if (e.propertyName === 'height') {
            body.style.height = 'auto';
            body.removeEventListener('transitionend', cleanup);
          }
        });
      });
    });
  }
};

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // header height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ============================================================
// FEATURED REVIEW ROTATOR
// (Placeholder until real reviews are added)
// ============================================================
(function initReviewRotator() {
  const reviews = [
    {
      text: '"Gran despacho. Llevaron mi caso de manera profesional y cercana. Me mantuvieron informado en todo momento."',
      name: 'Cliente verificado',
      initials: 'C.V.',
    },
    {
      text: '"Muy satisfecho con el resultado. Me explicaron todo desde el primer momento y resolvieron mi caso con eficacia."',
      name: 'Cliente verificado',
      initials: 'C.V.',
    },
    {
      text: '"Trato cercano y muy profesional. Sin duda los recomendaría a cualquiera que necesite asesoramiento jurídico."',
      name: 'Cliente verificado',
      initials: 'C.V.',
    },
  ];

  // NOTE: Replace placeholder reviews with real Google reviews before launch
  let currentIdx = 0;
  const textEl = document.getElementById('featuredReview');
  const nameEl = document.getElementById('featuredName');
  const initialEl = document.getElementById('featuredInitial');

  if (!textEl) return;

  function rotateReview() {
    currentIdx = (currentIdx + 1) % reviews.length;
    const review = reviews[currentIdx];

    // Fade out
    textEl.style.opacity = '0';
    nameEl.style.opacity = '0';

    setTimeout(() => {
      textEl.textContent = review.text;
      nameEl.textContent = review.name;
      initialEl.textContent = review.initials;
      textEl.style.opacity = '1';
      nameEl.style.opacity = '1';
    }, 400);
  }

  textEl.style.transition = 'opacity 0.4s ease';
  nameEl.style.transition = 'opacity 0.4s ease';

  setInterval(rotateReview, 5000);
})();

// ============================================================
// MICRO-INTERACTIONS — Area cards cursor effect
// ============================================================
(function initCardMicroInteractions() {
  const cards = document.querySelectorAll(
    '.area-card, .process-step, .case-card, .testimonial-card, .team-card--editorial'
  );

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.matchMedia("(max-width: 768px)").matches) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      card.style.transform = `translateY(-4px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        card.style.transition = '';
      }, 300);
    });
  });
})();

// ============================================================
// MOBILE TOUCH FEEDBACK
// ============================================================
(function initMobileTouchFeedback() {
  const targets = document.querySelectorAll(
    '.area-card, .process-step, .case-card, .testimonial-card, .team-card--editorial, .form__option, .btn'
  );

  targets.forEach(el => {
    el.addEventListener('touchstart', () => {
      el.style.transition = 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 120ms ease';
      el.style.transform = 'scale(0.98) translateY(1px)';
      el.style.boxShadow = 'var(--shadow-sm)';
    }, { passive: true });

    const resetFeedback = () => {
      el.style.transition = 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 250ms ease';
      el.style.transform = '';
      el.style.boxShadow = '';
      setTimeout(() => {
        el.style.transition = '';
      }, 250);
    };

    el.addEventListener('touchend', resetFeedback, { passive: true });
    el.addEventListener('touchcancel', resetFeedback, { passive: true });
  });
})();


// ============================================================
// DIAGNOSTIC — Scroll into view when area card clicked
// ============================================================
(function initAreaCardLinks() {
  document.querySelectorAll('.area-card').forEach(card => {
    card.addEventListener('click', () => {
      const diagSection = document.getElementById('diagnostico');
      if (diagSection) {
        const offset = 80;
        const top = diagSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

// ============================================================
// ACCESSIBILITY — Keyboard navigation for FAQ
// ============================================================
(function initKeyboardFaq() {
  document.querySelectorAll('.faq-item__toggle').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.toggleFaq(btn);
      }
    });
  });
})();

// ============================================================
// CONSOLE BRANDING
// ============================================================
console.log(
  '%c Clavería Abogados ',
  'background: #111110; color: #2B6CB0; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 4px;'
);
console.log('%c Desarrollado con precisión jurídica. ', 'color: #6B6B67; font-size: 12px;');
