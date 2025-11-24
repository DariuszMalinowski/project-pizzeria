/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars


'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product',
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },

  cart: {
    wrapperActive: 'active',
  },
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  },
  cart: {
    defaultDeliveryFee: 20,
  },
  db: {
    url: 'http://localhost:3131',
    products: 'products',
    orders: 'orders',
  },
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
};

class AmountWidget {
  constructor(element){
    const thisWidget = this;


    thisWidget.getElements(element);
    const startValue = thisWidget.input.value;
    if(startValue){
      thisWidget.setValue(startValue);
    } else {
      thisWidget.setValue(settings.amountWidget.defaultValue);
    }
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }


  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);

    if(!isNaN(newValue)
      && newValue >= settings.amountWidget.defaultMin
      && newValue <= settings.amountWidget.defaultMax){

      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;

      thisWidget.element.dispatchEvent(new Event('updated'));
    } else {
      // jeśli wpisano tekst lub bzdurę przywraca do poprzedniej wartości
      thisWidget.input.value = thisWidget.value;
    }
  }
  

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new Event('updated');
    thisWidget.element.dispatchEvent(event);
  }
}

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

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


class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    // --- zapisujemy wszystkie najważniejsze właściwości z menuProduct ---
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.params = menuProduct.params;

    // --- generowanie referencji do elementów w HTML ---
    thisCartProduct.getElements(element);
  }

  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    // Główny wrapper wygenerowany w koszyku
    thisCartProduct.dom.wrapper = element;

    // Pobieramy elementy wewnątrz produktu w koszyku
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.amountWidget
    );

    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );

    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );

    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
  }

  initAmountWidget(){
    const thisCartProduct = this;

    // tworzymy nową instancję AmountWidget dla elementu w koszyku
    thisCartProduct.amountWidgetInstance = new AmountWidget(thisCartProduct.dom.amountWidget);

    // nasłuchujemy eventu 'updated'
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
    // aktualizacja ilości w instancji
      thisCartProduct.amount = thisCartProduct.amountWidgetInstance.value;
      // aktualizacja ceny produktu w koszyku
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

      // możemy wysłać event do klasy Cart, jeśli będziemy chcieli aktualizować podsumowanie koszyka
      const event = new CustomEvent('cart-update', {
        bubbles: true,
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    });
  }

  getData() {
    const thisCartProduct = this;

    return {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      params: thisCartProduct.params,
    };
  }

}

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

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

  }

  renderInMenu(){
    const thisProduct = this;
    // wygenerowanie HTML opartego o template
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(generatedHTML);
    // stworzenie elementu using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    // znalezienie container menu
    const menuContainer = document.querySelector(select.containerOf.menu);
    // dodanie elementu do menu
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click',function(event){
    /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);

    let price = thisProduct.data.price;

    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      for(let optionId in param.options){
        const option = param.options[optionId];

        //sprawdzenie zaznaczenia opcji
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        //Jeśli wybrane to dodaj cenę (jeśli nie domyślne)
        if(optionSelected && !option.default){
          price += option.price;
        }

        if(!optionSelected && option.default){
          price -= option.price;
        }

        //znalezienie zdjęć
        const optionImages = thisProduct.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);

        //pokazywanie i ukrywanie zdjęć
        if(optionSelected){
          for(let img of optionImages){
            img.classList.add(classNames.menuProduct.imageVisible);
          }
        }else{
          for(let img of optionImages){
            img.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = price;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const paramsSummary = {};

    // zabezpieczenie gdy brak parametrów w danych produktu
    if(!thisProduct.data.params) return paramsSummary;

    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      // przygotuj strukturę dla tej kategorii
      paramsSummary[paramId] = {
        label: param.label,
        options: {}
      };

      // przejdź po opcjach parametru
      for(let optionId in param.options){
        const option = param.options[optionId];

        // sprawdź, czy opcja jest zaznaczona w formularzu
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected){
          // dodaj do summary: key = optionId, value = pełna nazwa opcji (label)
          paramsSummary[paramId].options[optionId] = option.label;
        }
      }

      // jeśli nie wybrano żadnej opcji w tej kategorii, usuń pusty obiekt options
      if(Object.keys(paramsSummary[paramId].options).length === 0){
        delete paramsSummary[paramId];
      }
    }

    return paramsSummary;
  }


  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    //const preparedProduct = thisProduct.prepareCartProduct();

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);

  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;

    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.priceSingle * productSummary.amount;

    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;
  }

}
app.init();
