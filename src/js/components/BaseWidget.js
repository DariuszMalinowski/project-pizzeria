//import AmountWidget from "./AmountWidget";


class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value){
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    if(thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.renderValue();
      thisWidget.announce();
    }
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.correctValue;
  }

  announce(){
    const thisWidget = this;
    if(thisWidget.dom.wrapper) {
      const event = new Event('updated');
      thisWidget.dom.wrapper.dispatchEvent(event);
    }
  }

}
export default BaseWidget;
