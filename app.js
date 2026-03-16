import ScrollReveal from 'https://unpkg.com/scrollreveal@4.0.9/dist/scrollreveal.esm.js';

const stats = [
  { selector: '.stat-years', value: 9 },
  { selector: '.stat-institutions', value: 5 },
  { selector: '.stat-languages', value: 3 },
];

const animateNumeric = (element, target) => {
  let current = 0;
  const duration = 800;
  const increment = Math.max(1, Math.floor(target / (duration / 16)));

  const update = () => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      return;
    }
    element.textContent = current;
    requestAnimationFrame(update);
  };

  update();
};

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const stat = stats.find((s) => entry.target.matches(s.selector));
        const targetValue = stat ? stat.value : parseInt(entry.target.textContent, 10) || 0;
        animateNumeric(entry.target, targetValue);
        entry.target.dataset.animated = 'true';
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

stats.forEach((stat) => {
  const target = document.querySelector(stat.selector);
  if (target) {
    observer.observe(target);
  }
});

ScrollReveal().reveal('.reveal', {
  origin: 'bottom',
  distance: '35px',
  duration: 700,
  easing: 'cubic-bezier(0.5, 0, 0, 1)',
  interval: 120,
});

const tilts = document.querySelectorAll('.project-card, .skill-card');
if (tilts.length && window.VanillaTilt) {
  VanillaTilt.init(tilts, {
    max: 12,
    speed: 450,
    glare: true,
    'max-glare': 0.25,
  });
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const status = contactForm.querySelector('.form-status');
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };
    status.textContent = 'Sending…';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Submission failed');
      }
      status.textContent = 'Thank you! Your message has been received.';
      contactForm.reset();
    } catch (error) {
      status.textContent = 'Something went wrong—please email directly.';
      console.error(error);
    }
  });
}
