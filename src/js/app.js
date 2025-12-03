import { settings, select, classNames } from './settings.js';
//import utils from './utils.js';

import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
//import CartProduct from './components/CartProduct.js';
//import AmountWidget from './components/AmountWidget.js';


const app = {

  initBooking() {
    const thisApp = this;

    // znajdź kontener widgetu rezerwacji
    const bookingContainer = document.querySelector(select.containerOf.booking);

    // utwórz instancję Booking i przekaż kontener
    thisApp.booking = new Booking(bookingContainer);
  },

  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    //thisApp.activatePage(thisApp.pages[0].id);
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /*get id*/
        const id = clickedElement.getAttribute('href').replace('#', '');

        /*run thisApp.activePage with that id */
        thisApp.activatePage(id);

        /* Change url hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;
    /* add class active to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class active to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' +  pageId
      );
    }
  },

  initMenu: function(){
    const thisApp = this;
    // Przekazanie nazwy właściwości oraz obiektu.
    for(let productData in thisApp.data.products){
      //new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
 
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  init: function(){
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(res => res.json())
      .then(parsedResponse => {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();   // przeniesione tutaj
      });
  },
};

app.init();
