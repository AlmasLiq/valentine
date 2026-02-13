// ===== Replace placeholders below with your real data =====
const PROFILE = {
  girlName: "Кристина", // TODO: replace with her name
  myName: "Алмас", // TODO: replace with your name
  importantDate: "17 июня", // TODO: replace with important date
  place: "DrinkIt", // TODO: replace with place/city
};

// ===== Watermark switch =====
const SHOW_WATERMARK = true; // set false to hide watermark

// ===== Local photo paths (keep inside /assets) =====
const ASSETS = {
  her1: "./assets/her-1.png",
  us1: "./assets/us-1.png",
  her2: "./assets/her-2.png",
  us2: "./assets/us-2.png",
  us3: "./assets/us-3.png",
  glasses: "./assets/glasses.png",
  extra1: "./assets/extra-1.png",
  extra2: "./assets/extra-2.png",
  almas: "./assets/almas.png",
};

const state = {
  currentSlide: 0,
  quietMode: false,
  touchStartX: 0,
  touchDeltaX: 0,
  touching: false,
  secretBuffer: "",
  secretShown: false,
};

const slides = [
  {
    title: "Слайд 1",
    image: ASSETS.her1,
    caption: "Есть люди, рядом с которыми мир становится мягче.",
    whisper: "Вот здесь я подумал: как же мне повезло.",
  },
  {
    title: "Слайд 2",
    image: ASSETS.us1,
    caption: "С тобой даже обычный день выглядит как маленький праздник.",
    whisper: "Хочу запоминать такие моменты снова и снова.",
  },
  {
    title: "Слайд 3",
    image: ASSETS.her2,
    caption: "Я люблю, как ты умеешь радоваться мелочам.",
    whisper: "Твоя улыбка делает мой день легче.",
  },
  {
    title: "Слайд 4",
    image: ASSETS.us2,
    caption: "Наши моменты - мои любимые воспоминания.",
    whisper: "Здесь внутри было тихое счастье.",
    memoryNote: "Сохранить этот момент: {IMPORTANT_DATE} - {PLACE}",
  },
  {
    title: "Слайд 5",
    image: ASSETS.us3,
    caption: "И мне хочется собирать их дальше. Спокойно. Надолго.",
    whisper: "С тобой хочется просто быть настоящим.",
  },
  {
    title: "Мини-финал",
    image: ASSETS.glasses,
    caption: "Готова к валентинке?",
    whisper: "Я сделал её с любовью.",
    isFinal: true,
  },
];

const refs = {
  intro: document.getElementById("intro"),
  app: document.getElementById("app"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  loadingProgress: document.getElementById("loadingProgress"),
  slidesTrack: document.getElementById("slidesTrack"),
  slideTitle: document.getElementById("slideTitle"),
  dots: document.getElementById("dots"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  storySection: document.getElementById("storySection"),
  cardSection: document.getElementById("cardSection"),
  sparkBtn: document.getElementById("sparkBtn"),
  easterEgg: document.getElementById("easterEgg"),
  floatingHearts: document.getElementById("floatingHearts"),
  effectCanvas: document.getElementById("effectCanvas"),
  watermark: document.getElementById("watermark"),
  viewport: document.getElementById("slidesViewport"),
  almasOverlay: document.getElementById("almasOverlay"),
  almasClose: document.getElementById("almasClose"),
};

function injectTextPlaceholders() {
  document.querySelectorAll("[data-girl-name]").forEach((el) => {
    el.textContent = PROFILE.girlName;
  });
  document.querySelectorAll("[data-my-name]").forEach((el) => {
    el.textContent = PROFILE.myName;
  });
}

function fillTemplate(text) {
  return text
    .replaceAll("{GIRL_NAME}", PROFILE.girlName)
    .replaceAll("{MY_NAME}", PROFILE.myName)
    .replaceAll("{IMPORTANT_DATE}", PROFILE.importantDate)
    .replaceAll("{PLACE}", PROFILE.place);
}

function preloadImages(urls, onProgress) {
  let loadedCount = 0;
  const total = urls.length;

  if (!total) {
    onProgress(100);
    return Promise.resolve();
  }

  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const image = new Image();
          const done = () => {
            loadedCount += 1;
            const progress = Math.round((loadedCount / total) * 100);
            onProgress(progress);
            resolve();
          };
          image.onload = done;
          image.onerror = done;
          image.src = url;
        }),
    ),
  );
}

function renderSlides() {
  refs.slidesTrack.innerHTML = "";
  refs.dots.innerHTML = "";

  slides.forEach((slide, index) => {
    const slideEl = document.createElement("article");
    slideEl.className = "slide";
    slideEl.setAttribute("aria-label", `${index + 1} из ${slides.length}`);

    const frame = document.createElement("button");
    frame.type = "button";
    frame.className = "photo-frame";
    frame.setAttribute("aria-label", "Показать подпись-шепот");

    const img = document.createElement("img");
    img.src = slide.image;
    img.alt = `Фото ${index + 1}`;
    img.loading = "eager";

    const whisper = document.createElement("span");
    whisper.className = "whisper";
    whisper.textContent = slide.whisper;

    frame.append(img, whisper);
    frame.addEventListener("click", () => {
      frame.classList.toggle("tap-active");
      setTimeout(() => frame.classList.remove("tap-active"), 1800);
    });

    const caption = document.createElement("p");
    caption.className = "slide-caption";
    caption.textContent = fillTemplate(slide.caption);

    slideEl.append(frame, caption);

    if (slide.memoryNote) {
      const memory = document.createElement("p");
      memory.className = "memory-note";
      memory.textContent = fillTemplate(slide.memoryNote);
      slideEl.append(memory);
    }

    if (slide.isFinal) {
      const ctaWrap = document.createElement("div");
      ctaWrap.className = "final-cta";
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "open-card-btn";
      openBtn.textContent = "Открыть валентинку";
      openBtn.setAttribute("aria-label", "Открыть валентинку");
      openBtn.addEventListener("click", openCard);
      ctaWrap.append(openBtn);
      slideEl.append(ctaWrap);
    }

    refs.slidesTrack.append(slideEl);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    refs.dots.append(dot);
  });

  updateStoryUI();
}

function goToSlide(index) {
  const bounded = Math.max(0, Math.min(index, slides.length - 1));
  state.currentSlide = bounded;
  updateStoryUI();
}

function updateStoryUI() {
  const offsetPercent = state.currentSlide * -100;
  refs.slidesTrack.style.transform = `translateX(${offsetPercent}%)`;
  refs.slideTitle.textContent = slides[state.currentSlide].title;

  refs.prevBtn.disabled = state.currentSlide === 0;
  refs.nextBtn.disabled = state.currentSlide === slides.length - 1;

  [...refs.slidesTrack.children].forEach((slideEl, index) => {
    slideEl.classList.toggle("active", index === state.currentSlide);
  });
  [...refs.dots.children].forEach((dot, index) => {
    dot.classList.toggle("active", index === state.currentSlide);
  });
}

function bindStoryEvents() {
  refs.prevBtn.addEventListener("click", () => goToSlide(state.currentSlide - 1));
  refs.nextBtn.addEventListener("click", () => goToSlide(state.currentSlide + 1));

  document.addEventListener("keydown", (event) => {
    const cardVisible = !refs.cardSection.classList.contains("hidden");
    if (cardVisible) return;

    if (event.key === "ArrowLeft") goToSlide(state.currentSlide - 1);
    if (event.key === "ArrowRight") goToSlide(state.currentSlide + 1);
  });

  refs.viewport.addEventListener("touchstart", (event) => {
    state.touching = true;
    state.touchStartX = event.changedTouches[0].clientX;
    state.touchDeltaX = 0;
  });

  refs.viewport.addEventListener("touchmove", (event) => {
    if (!state.touching) return;
    const currentX = event.changedTouches[0].clientX;
    state.touchDeltaX = currentX - state.touchStartX;
  });

  refs.viewport.addEventListener("touchend", () => {
    if (!state.touching) return;
    if (state.touchDeltaX > 45) goToSlide(state.currentSlide - 1);
    if (state.touchDeltaX < -45) goToSlide(state.currentSlide + 1);
    state.touching = false;
    state.touchDeltaX = 0;
  });
}

function openAlmasOverlay() {
  state.secretShown = true;
  refs.almasOverlay.classList.remove("hidden");
  refs.almasOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  refs.almasClose.focus();
}

function closeAlmasOverlay() {
  state.secretShown = false;
  refs.almasOverlay.classList.add("hidden");
  refs.almasOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");
}

function bindSecretEasterEgg() {
  const secret = "ALMAS";

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.secretShown) {
      closeAlmasOverlay();
      return;
    }

    const target = event.target;
    const isTypingField =
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);
    if (isTypingField) return;

    const key = event.key.length === 1 ? event.key.toUpperCase() : "";
    if (!key) return;

    state.secretBuffer = (state.secretBuffer + key).slice(-secret.length);
    if (state.secretBuffer === secret) {
      state.secretBuffer = "";
      openAlmasOverlay();
    }
  });

  refs.almasClose.addEventListener("click", closeAlmasOverlay);
  refs.almasOverlay.addEventListener("click", (event) => {
    if (event.target === refs.almasOverlay) closeAlmasOverlay();
  });
}

function openCard() {
  refs.storySection.classList.add("hidden");
  refs.cardSection.classList.remove("hidden");
  refs.sparkBtn.focus();
}

function initFloatingHearts() {
  refs.floatingHearts.innerHTML = "";
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = i % 3 === 0 ? "❤" : "♡";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.setProperty("--delay", `${Math.random() * 9}s`);
    heart.style.setProperty("--duration", `${10 + Math.random() * 8}s`);
    heart.style.setProperty("--drift", `${-25 + Math.random() * 50}px`);
    heart.style.setProperty("--size", `${12 + Math.random() * 18}px`);
    refs.floatingHearts.append(heart);
  }
}

function setupParallax() {
  window.addEventListener("pointermove", (event) => {
    if (state.quietMode) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 9;
    const y = (event.clientY / window.innerHeight - 0.5) * 9;
    document.documentElement.style.setProperty("--parallax-x", `${x}px`);
    document.documentElement.style.setProperty("--parallax-y", `${y}px`);
  });
}

function launchHeartBurst() {
  if (state.quietMode) {
    refs.easterEgg.classList.remove("hidden");
    return;
  }

  const canvas = refs.effectCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    refs.easterEgg.classList.remove("hidden");
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particles = Array.from({ length: 900 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * 120,
    y: height * 0.55 + (Math.random() - 0.5) * 60,
    vx: (Math.random() - 0.5) * 5.2,
    vy: -2.2 - Math.random() * 3.3,
    size: 12 + Math.random() * 13,
    alpha: 0.8 + Math.random() * 0.2,
    drift: (Math.random() - 0.5) * 0.25,
    symbol: Math.random() > 0.35 ? "❤" : "♡",
    color: Math.random() > 0.5 ? "#ff2d55" : "#ff8fab",
  }));

  let start = 0;
  const duration = 2400;

  function tick(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.vx += p.drift;
      p.alpha *= 0.991;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.fillStyle = p.color;
      ctx.font = `${p.size}px "Segoe UI", sans-serif`;
      ctx.fillText(p.symbol, p.x, p.y);
    });

    ctx.globalAlpha = 1;

    if (elapsed < duration) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  requestAnimationFrame(tick);
  refs.easterEgg.classList.remove("hidden");
}

function initWatermark() {
  if (!SHOW_WATERMARK) refs.watermark.classList.add("hidden");
}

async function init() {
  injectTextPlaceholders();
  initWatermark();
  initFloatingHearts();
  setupParallax();

  const imagesToLoad = [
    ASSETS.her1,
    ASSETS.us1,
    ASSETS.her2,
    ASSETS.us2,
    ASSETS.us3,
    ASSETS.glasses,
    ASSETS.extra1,
    ASSETS.extra2,
    ASSETS.almas,
  ];

  const minIntroDelay = new Promise((resolve) => setTimeout(resolve, 2300));
  const loading = preloadImages(imagesToLoad, (progress) => {
    refs.progressBar.style.width = `${progress}%`;
    refs.progressText.textContent = `Загрузка фото: ${progress}%`;
    refs.loadingProgress.setAttribute("aria-valuenow", String(progress));
  });

  await Promise.all([loading, minIntroDelay]);

  refs.intro.classList.add("hidden");
  refs.app.classList.remove("hidden");

  renderSlides();
  bindStoryEvents();
  bindSecretEasterEgg();
  refs.sparkBtn.addEventListener("click", launchHeartBurst);
}

init();
