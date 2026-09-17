(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.toLowerCase() === current) a.classList.add('active');
  });

  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
      btn.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    });
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.filter;
      document.querySelectorAll('.tour-card[data-category]').forEach(card => {
        card.classList.toggle('hidden', target !== 'all' && !card.dataset.category.split(' ').includes(target));
      });
    });
  });

  const form = document.querySelector('#inquiryForm');
  if (form) {
    const params = new URLSearchParams(location.search);
    const tour = params.get('tour');
    const type = params.get('type');
    const tourField = form.querySelector('[name="tour"]');
    const typeField = form.querySelector('[name="type"]');
    if (tour && tourField) tourField.value = tour;
    if (type && typeField) typeField.value = type;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const success = document.querySelector('#formSuccess');
      if (success) success.classList.add('show');
      form.querySelector('button[type="submit"]').textContent = '문의 내용 확인 완료';
      form.querySelector('button[type="submit"]').disabled = true;
      success?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();
