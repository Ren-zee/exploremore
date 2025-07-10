new Swiper('.card-wrapper', {

  loop: true,
  spaceBetween: 30,

  autoplay: {
    delay: 3000, // time in milliseconds (3000 = 3 seconds)
    disableOnInteraction: false, // keeps autoplay going after user interacts
  },

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    dynamicBullets: true
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // responsive breakpoints
  breakpoints: {
    0: {
        slidesPerView:1
    },
    768: {
        slidesPerView:2
    },
    1024: {
        slidesPerView:3
    }
  }


});

/*-----------------------------------------------*/

// Handle modal open and close
document.querySelectorAll('.open-modal-button').forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();
    const modalId = button.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  });
});

// Handle modal close when clicking the "x" or outside the modal
document.querySelectorAll('.modal').forEach(modal => {
  const closeBtn = modal.querySelector('.close-button');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});
