import { templates, select, settings } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.selectedTable = null;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([fetch(urls.booking), fetch(urls.eventsCurrent), fetch(urls.eventsRepeat)])
      .then(allResponses => Promise.all(allResponses.map(res => res.json())))
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        bookings = bookings || [];
        eventsCurrent = eventsCurrent || [];
        eventsRepeat = eventsRepeat || [];

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      })
      .catch(err => console.error('Błąd pobierania danych booking:', err));
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
    thisBooking.initTables(); 
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (!thisBooking.booked[date][hourBlock]) {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    const date = thisBooking.datePickerWidget.value;
    const hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    for (let table of thisBooking.dom.tables) {
      const tableId = parseInt(table.getAttribute('data-table'));

      if (
        thisBooking.booked[date] &&
        thisBooking.booked[date][hour] &&
        thisBooking.booked[date][hour].includes(tableId)
      ) {
        table.classList.add('booked');
        table.classList.remove('selected'); // NIE pozwól, by zaznaczony był też booked
      } else {
        table.classList.remove('booked');
        table.classList.remove('selected'); // usuwamy selected dla wolnych po zmianie daty/godziny
      }
    }

    // Jeśli wybrany stolik stał się zajęty → reset
    if (thisBooking.selectedTable) {
      const selectedId = parseInt(thisBooking.selectedTable.getAttribute('data-table'));

      if (
        thisBooking.booked[date] &&
        thisBooking.booked[date][hour] &&
        thisBooking.booked[date][hour].includes(selectedId)
      ) {
        thisBooking.selectedTable.classList.remove('selected');
        thisBooking.selectedTable = null;
      }
    }
  }

  initTables() {
    const thisBooking = this;

    thisBooking.dom.tablesWrapper.addEventListener('click', function (event) {
      const clicked = event.target.closest('.table');
      if (!clicked) return;

      const tableId = parseInt(clicked.getAttribute('data-table'));
      const date = thisBooking.datePickerWidget.value;
      const hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

      // jeśli stolik jest zajęty → blokada
      if (
        thisBooking.booked[date] &&
        thisBooking.booked[date][hour] &&
        thisBooking.booked[date][hour].includes(tableId)
      ) {
        return;
      }

      // kliknięto ten sam stolik → odznacz
      if (thisBooking.selectedTable === clicked) {
        clicked.classList.remove('selected');
        thisBooking.selectedTable = null;
        return;
      }

      // kliknięto inny stolik → usuń selected z poprzedniego
      if (thisBooking.selectedTable) {
        thisBooking.selectedTable.classList.remove('selected');
      }

      clicked.classList.add('selected');
      thisBooking.selectedTable = clicked;
    });

    // Reset wyboru przy zmianie daty/godziny/liczby osób
    const resetSelection = () => {
      if (thisBooking.selectedTable) {
        thisBooking.selectedTable.classList.remove('selected');
        thisBooking.selectedTable = null;
      }
    };

    thisBooking.datePickerWidget.dom.wrapper.addEventListener('updated', resetSelection);
    thisBooking.hourPickerWidget.dom.wrapper.addEventListener('updated', resetSelection);
    thisBooking.peopleAmountWidget.dom.wrapper.addEventListener('updated', resetSelection);
    thisBooking.hoursAmountWidget.dom.wrapper.addEventListener('updated', resetSelection);
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector('.floor-plan');
    thisBooking.dom.tables = thisBooking.dom.tablesWrapper.querySelectorAll('.table');
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.datePickerWidget.dom.wrapper.addEventListener('updated', () => {
      thisBooking.updateDOM();
    });

    thisBooking.hourPickerWidget.dom.wrapper.addEventListener('updated', () => {
      thisBooking.updateDOM();
    });

    //thisBooking.initTables();
    thisBooking.getData();
  }
}

export default Booking;
