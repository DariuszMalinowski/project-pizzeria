import { templates } from '../settings.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    // 1. wygeneruj HTML z szablonu
    const generatedHTML = templates.bookingWidget();

    // 2. przygotuj obiekt dom
    thisBooking.dom = {};

    // 3. dodaj wrapper z referencją do kontenera
    thisBooking.dom.wrapper = element;

    // 4. wstaw HTML do kontenera
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets() {
    console.log('Booking.initWidgets — działa');
  }
}

export default Booking;

