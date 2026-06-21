const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.55 }
);

document.querySelectorAll("video").forEach((video) => {
  video.pause();
  videoObserver.observe(video);
});

if (!prefersReducedMotion) {
  let animationFrame = null;
  let startY = window.scrollY;
  let targetY = window.scrollY;
  let startTime = 0;
  const duration = 460;

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  const stopAnimation = () => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };

  const step = (time) => {
    if (startTime === 0) {
      startTime = time;
    }

    const progress = Math.min(1, (time - startTime) / duration);
    const nextY = startY + (targetY - startY) * easeOutQuart(progress);
    window.scrollTo(0, nextY);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(step);
    } else {
      animationFrame = null;
      startTime = 0;
      startY = targetY;
    }
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.metaKey || event.defaultPrevented) {
        return;
      }

      const absY = Math.abs(event.deltaY);
      const likelyTrackpad = absY > 0 && absY < 18;
      if (likelyTrackpad) {
        stopAnimation();
        targetY = window.scrollY;
        startY = targetY;
        return;
      }

      event.preventDefault();

      const modeMultiplier = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = event.deltaY * modeMultiplier;
      targetY = Math.max(0, Math.min(maxScroll(), targetY + delta * 1.08));
      startY = window.scrollY;
      startTime = 0;

      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(step);
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      const scrollKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (scrollKeys.includes(event.key)) {
        stopAnimation();
        targetY = window.scrollY;
        startY = targetY;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (animationFrame === null) {
        targetY = window.scrollY;
        startY = targetY;
      }
    },
    { passive: true }
  );
}
