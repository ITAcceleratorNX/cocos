(() => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Mobile Navigation Toggle
     -------------------------------------------------------------------------- */
  const burgerBtn = document.getElementById('burger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = !mobileNav.hidden;
      mobileNav.hidden = isOpen;
      burgerBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileNav.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('click', () => {
        mobileNav.hidden = true;
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. Catalog Filter Pills
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-pills [data-filter]');
  const catalogCards = document.querySelectorAll('#catalog-grid [data-category]');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
      catalogCards.forEach((card) => {
        const match = target === 'all' || card.dataset.category === target;
        card.hidden = !match;
      });
    });
  });

  /* --------------------------------------------------------------------------
     3. Interactive 9 Layers of Protection
     -------------------------------------------------------------------------- */
  const LAYERS = [
    {
      num: 'Слой 01 из 09',
      title: 'Хлопковый мягкий антибактериальный слой',
      text: 'Непосредственно соприкасается с кожей. Изготовлен из 100% обезжиренного медицинского хлопка, не натирает, не вызывает зуда и раздражений даже при повышенной чувствительности.',
      tags: ['0% хлора', '0% отдушек', 'Гипоаллергенно'],
    },
    {
      num: 'Слой 02 из 09',
      title: 'Безворсовая защитная упаковка',
      text: 'Гигиеничный барьерный слой удерживает волокна внутри и сохраняет идеальную гладкость поверхности при движении.',
      tags: ['Без ворса', 'Стерильно'],
    },
    {
      num: 'Слой 03 из 09',
      title: 'Слой быстрого проникновения и распределения',
      text: 'Мгновенно отводит влагу от поверхности вглубь и равномерно распределяет её по всей длине, предотвращая локальное намокание.',
      tags: ['Впитывание за 3 сек', 'Сухая поверхность'],
    },
    {
      num: 'Слой 04 из 09',
      title: 'Обезжиренный хлопок + SAP-абсорбент',
      text: 'Первый впитывающий контур превращает жидкость в плотный гель и не даёт ей вернуться обратно на поверхность.',
      tags: ['SAP нового поколения', 'Без протеканий'],
    },
    {
      num: 'Слой 05 из 09',
      title: 'Медицинский обезжиренный хлопок + SAP-ядро',
      text: 'Основной удерживающий центр: работает даже в самые обильные дни и ночью (до 8 часов сухости), при этом прокладка остаётся ультратонкой.',
      tags: ['До 8 часов сухости', 'Толщина 1 мм'],
    },
    {
      num: 'Слой 06 из 09',
      title: 'Дополнительный слой хлопок + SAP',
      text: 'Страхует от протеканий при резких движениях, спорте и сне на боку или спине.',
      tags: ['Защита 360°', 'Не комкается'],
    },
    {
      num: 'Слой 07 из 09',
      title: 'Слой быстрого впитывания и отвода',
      text: 'Стабилизирует распределение влаги внутри сердцевины и сохраняет анатомическую форму прокладки.',
      tags: ['Держит форму', 'Анатомический крой'],
    },
    {
      num: 'Слой 08 из 09',
      title: 'Нижняя безворсовая бумажная обёртка',
      text: 'Дополнительная герметичная фиксация абсорбирующего ядра — ничего не сбивается и не скручивается.',
      tags: ['Надёжная фиксация', 'Без скручивания'],
    },
    {
      num: 'Слой 09 из 09',
      title: 'Дышащая мембрана с микропорами',
      text: 'Выпускает тёплый воздух и пар, но не пропускает влагу на бельё. Кожа дышит без «парникового эффекта».',
      tags: ['Циркуляция воздуха', 'Широкий клей'],
    },
  ];

  const layerBtns = document.querySelectorAll('#layers-list .layer-btn');
  const layerDetail = document.getElementById('layer-detail');

  if (layerDetail && layerBtns.length) {
    layerBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.layer);
        const item = LAYERS[idx];
        if (!item) return;

        layerBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        layerDetail.querySelector('.layer-detail__num').textContent = item.num;
        layerDetail.querySelector('.layer-detail__title').textContent = item.title;
        layerDetail.querySelector('.layer-detail__text').textContent = item.text;
        const meta = layerDetail.querySelector('.layer-detail__meta');
        meta.innerHTML = item.tags.map((t) => `<span>${t}</span>`).join('');
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. Native <dialog> Modals + Mandatory Light-Dismiss Fallback
     -------------------------------------------------------------------------- */
  const openDialogButtons = document.querySelectorAll('[data-open-dialog]');
  openDialogButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = document.getElementById(btn.dataset.openDialog);
      if (dialog instanceof HTMLDialogElement && !dialog.open) {
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog instanceof HTMLDialogElement) dialog.close();
    });
  });

  // Certificate Lightbox
  const certDialog = document.getElementById('cert-dialog');
  const certDialogImg = document.getElementById('cert-dialog-img');
  const certDialogTitle = document.getElementById('cert-dialog-title');

  document.querySelectorAll('[data-cert-src]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!(certDialog instanceof HTMLDialogElement)) return;
      certDialogImg.src = btn.dataset.certSrc;
      certDialogImg.alt = btn.dataset.certTitle || 'Сертификат качества CoCo’s';
      certDialogTitle.textContent = btn.dataset.certTitle || 'Сертификат качества';
      certDialog.showModal();
    });
  });

  // Fallback for browsers without native <dialog closedby="any"> support (e.g. Safari)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const isOutside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    document.querySelectorAll('dialog[closedby="any"]').forEach((dialog) => {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = isOutside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && isOutside(e, dialog)) {
          dialog.close();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. Partner Form Submission Feedback
     -------------------------------------------------------------------------- */
  const partnerForm = document.getElementById('partner-form');
  const formStatus = document.getElementById('form-status');

  if (partnerForm && formStatus) {
    partnerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!partnerForm.checkValidity()) {
        formStatus.textContent = 'Пожалуйста, заполните имя, телефон и email.';
        formStatus.classList.add('is-error');
        partnerForm.reportValidity();
        return;
      }
      const name = partnerForm.elements.name.value.trim();
      formStatus.classList.remove('is-error');
      formStatus.textContent = `Спасибо, ${name}! Заявка принята — менеджер CoCo’s свяжется с вами в ближайшее время.`;
      partnerForm.reset();
    });
  }

  /* --------------------------------------------------------------------------
     6. Floating Contact Widget
     -------------------------------------------------------------------------- */
  const floatingTrigger = document.getElementById('floating-trigger');
  const floatingMenu = document.getElementById('floating-menu');

  if (floatingTrigger && floatingMenu) {
    floatingTrigger.addEventListener('click', () => {
      const nextHidden = !floatingMenu.hidden;
      floatingMenu.hidden = nextHidden;
      floatingTrigger.setAttribute('aria-expanded', String(!nextHidden));
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#floating-widget') && !floatingMenu.hidden) {
        floatingMenu.hidden = true;
        floatingTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. Scroll Reveal Fallback (only when native CSS view() timeline unsupported)
     -------------------------------------------------------------------------- */
  if (
    !CSS.supports('(animation-timeline: view()) and (animation-range: entry)') &&
    matchMedia('(prefers-reduced-motion: no-preference)').matches
  ) {
    const items = document.querySelectorAll('.reveal');
    items.forEach((el) => el.classList.add('is-js-hidden'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-js-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => observer.observe(el));
  }
})();
