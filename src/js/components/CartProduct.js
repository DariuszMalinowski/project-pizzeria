import { select } from '../settings.js';
//import utils from '../utils.js';

//import Product from './Product.js';
//import Cart from './Cart.js';
//import CartProduct from './components/CartProduct.js';
import AmountWidget from './AmountWidget.js';

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

export default CartProduct;