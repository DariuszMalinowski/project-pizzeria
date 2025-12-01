import { settings, select, } from '../settings.js';
//import utils from '../utils.js';

//import Product from './Product.js';
//import Cart from './Cart.js';
//import CartProduct from './CartProduct.js';
//import AmountWidget from './components/AmountWidget.js';




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

export default AmountWidget;