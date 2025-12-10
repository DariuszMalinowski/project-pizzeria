//import { select } from '../settings.js';
/* global Flickity */
//import Flickity from 'flickity';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    thisHome.getElements();
    thisHome.initActions();
    thisHome.initCarousel();
  }

  getElements() {
    const thisHome = this;

    thisHome.dom.orderBox = thisHome.dom.wrapper.querySelector('.order-box');
    thisHome.dom.bookingBox = thisHome.dom.wrapper.querySelector('.booking-box');
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector('.carousel');

    // odwołania do linków w nav (używane do "aktywacji" linku)
    thisHome.dom.navOrderLink = document.querySelector('.main-nav a[href="#order"], .main-nav a[href="#/order"]');
    thisHome.dom.navBookingLink = document.querySelector('.main-nav a[href="#booking"], .main-nav a[href="#/booking"]');
  }

  initActions() {
    const thisHome = this;

    // Klik -> aktywacja strony ORDER (przez zasymulowanie kliknięcia w link w nav, 
    // dzięki temu istniejący handler w app.js ustawi aktywny link i hash poprawnie)
    if (thisHome.dom.orderBox) {
      thisHome.dom.orderBox.addEventListener('click', function () {
        // jeśli istnieje link nav do order, klikamy go; w przeciwnym razie ustawiamy hash
        if (thisHome.dom.navOrderLink) {
          thisHome.dom.navOrderLink.click();
        } else {
          window.location.hash = '#/order';
        }
      });
    }

    // Klik -> aktywacja strony BOOKING
    if (thisHome.dom.bookingBox) {
      thisHome.dom.bookingBox.addEventListener('click', function () {
        if (thisHome.dom.navBookingLink) {
          thisHome.dom.navBookingLink.click();
        } else {
          window.location.hash = '#/booking';
        }
      });
    }
  }

  initCarousel() {
    const thisHome = this;

    if (!thisHome.dom.carousel) return;

    // Flickity powinien być dołączony w index.html (script + css).
    // autoPlay w ms, wrapAround pozwala na nieskończoną pętlę.
    if (typeof Flickity !== 'undefined') {
      thisHome.carouselInstance = new Flickity(thisHome.dom.carousel, {
        cellAlign: 'center',
        contain: true,
        wrapAround: true,
        autoPlay: 3000, // 3s
        pauseAutoPlayOnHover: false,
        prevNextButtons: false,
        pageDots: true,
      });
    } else {
      // fallback: proste automatyczne przełączanie klasy active (jeśli Flickity nie załadowane)
      const slides = thisHome.dom.carousel.querySelectorAll('.carousel-cell');
      if (slides.length) {
        let idx = 0;
        slides.forEach((s, i) => s.classList.toggle('is-selected', i === 0));
        setInterval(() => {
          slides[idx].classList.remove('is-selected');
          idx = (idx + 1) % slides.length;
          slides[idx].classList.add('is-selected');
        }, 3000);
      }
    }
  }
}

export default Home;
