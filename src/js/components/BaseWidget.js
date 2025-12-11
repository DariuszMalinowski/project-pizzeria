//import AmountWidget from "./AmountWidget";


class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  //getter zwraca aktualną wartość widgetu
  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  //ustawia nową wartosc widgetu
  set value(value){
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    if(thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.renderValue();
      thisWidget.announce();
    }
  }

  //ustawia value
  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  //parsuje wartosc
  parseValue(value){
    return parseInt(value);
  }

  //sprawdza poprawność ()
  isValid(value){
    return !isNaN(value);
  }

  // implementuje 
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.correctValue;
  }

  // wysyla event updated
  announce(){
    const thisWidget = this;
    if(thisWidget.dom.wrapper) {
      const event = new Event('updated');
      thisWidget.dom.wrapper.dispatchEvent(event);
    }
  }

}
export default BaseWidget;
