import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';

//import Product from './components/Product.js';
//import Cart from './Cart.js';
//import CartProduct from './CartProduct.js';
import AmountWidget from './AmountWidget.js';


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

export default Product;