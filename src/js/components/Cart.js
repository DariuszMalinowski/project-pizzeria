import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  //Zbiera wszystkie dane dla koszyka
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    // suma bez kosztów dostawy
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    // końcowa cena — **kilka elementów naraz**, bo są dwa w HTML
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    // liczba sztuk w koszyku
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    //nowe
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.formSubmit = thisCart.dom.wrapper.querySelector(select.cart.formSubmit);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  //dodaje listenery na koszyk i zmiany ilosci
  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    document.addEventListener('add-to-cart', function(event) {
      thisCart.add(event.detail.product);
    });

    thisCart.dom.wrapper.addEventListener('cart-update', function () {
      thisCart.update();
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  //aktualizuje koszyk
  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    const cartProduct = new CartProduct(menuProduct, generatedDOM);
    cartProduct.initAmountWidget();

    cartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      cartProduct.dom.wrapper.remove();
      const index = thisCart.products.indexOf(cartProduct);
      if(index !== -1) thisCart.products.splice(index, 1);
      thisCart.update();
    });

    thisCart.products.push(cartProduct);
    thisCart.update();
  }

  //przelicza liczbe produktow
  update() {
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for(let product of thisCart.products){
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;

    if (totalNumber > 0) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.deliveryFee = deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }

    // AKTUALIZACJA DOM 

    // liczba sztuk
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    // koszt dostawy
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

    // cena bez dostawy
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    // cena całkowita — kilka elementów naraz
    for (let elem of thisCart.dom.totalPrice) {
      elem.innerHTML = thisCart.totalPrice;
    }
  }

  //wysyła zamówienie do API
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('order response:', parsedResponse);
      });
  }

}

export default Cart;