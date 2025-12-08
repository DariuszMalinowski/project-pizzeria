import { templates, select, settings } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

getData(){
  const thisBooking = this;

  const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
  const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

  const params = {
    booking: [
      startDateParam,
      endDateParam,
    ],
    eventsCurrent: [
      settings.db.notRepeatParam,
      startDateParam,
      endDateParam,
    ],
    eventsRepeat: [
      settings.db.repeatParam,
      endDateParam,
    ],
  };

  const urls = {
    booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
    eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
    eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
  }

  Promise.all([
  fetch(urls.booking)
  ])
    .then(function(allResponses){
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    })
    .then(function([bookings, eventsCurrent, eventsRepeat]){
      console.log(bookings);
      console.log(eventsCurrent);
      console.log(eventsRepeat);
    });
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

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );

    // input dla HourPicker
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
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

    thisBooking.datePickerWidget = new DatePicker(
      thisBooking.dom.datePicker
    );

    // Hour Picker
    thisBooking.hourPickerWidget = new HourPicker(
      thisBooking.dom.hourPicker
    );

    // nasłuchiwacze — mogą być puste
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      // na razie pusto — zgodnie z instrukcją
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      // na razie pusto — zgodnie z instrukcją
    });

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      console.log('Booking widget updated!');
    });
  }
}

export default Booking;
