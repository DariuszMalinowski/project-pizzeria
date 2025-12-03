import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    // NEW: wejścia People Amount i Hours Amount
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
  }

  initWidgets() {
    const thisBooking = this;

    // tworzenie widgetu ilości osób
    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );

    // tworzenie widgetu ilości godzin
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );

    // nasłuchiwacze — mogą być puste
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      // na razie pusto — zgodnie z instrukcją
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      // na razie pusto — zgodnie z instrukcją
    });
  }
}

export default Booking;
