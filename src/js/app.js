import { settings, select } from './settings.js';
//import utils from './utils.js';

import Product from './components/Product.js';
import Cart from './components/Cart.js';
//import CartProduct from './components/CartProduct.js';
//import AmountWidget from './components/AmountWidget.js';


const app = {

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

    thisApp.initData();
    thisApp.initCart();
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
