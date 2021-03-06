var wv = wv || {};
wv.date = wv.date || {};

wv.date.model = wv.date.model || function (config, spec) {
  spec = spec || {};

  var self = {};
  self.events = wv.util.events();
  self.selected = null;

  self.monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  var init = function () {
    var initial = spec.initial || wv.util.today();
    self.select(initial);
  };

  self.string = function () {
    return wv.util.toISOStringDate(self.selected);
  };

  self.select = function (date) {
    date = self.clamp(wv.util.clearTimeUTC(date));
    var updated = false;
    if (!self.selected || date.getTime() !== self.selected.getTime()) {
      self.selected = date;
      self.events.trigger('select', date);
      updated = true;
    }
    return updated;
  };

  self.add = function (interval, amount) {
    self.select(wv.util.dateAdd(self.selected, interval, amount));
  };

  self.clamp = function (date) {
    if (date > wv.util.today()) {
      date = wv.util.today();
    }
    if (config.startDate) {
      startDate = wv.util.parseDateUTC(config.startDate);
      if (date < startDate) {
        date = startDate;
      }
    }
    return date;
  };

  self.isValid = function (date) {
    if (date > wv.util.today()) {
      return false;
    }
    if (config.startDate) {
      startDate = wv.util.parseDateUTC(config.startDate);
      if (date < startDate) {
        return false;
      }
    }
    return true;
  };

  self.minDate = function () {
    if (config.startDate) {
      return wv.util.parseDateUTC(config.startDate);
    }
    return wv.util.minDate();
  };

  self.maxDate = function () {
    return wv.util.today();
  };

  self.save = function (state) {
    state.t = self.selected.toISOString()
      .split('T')[0];
    if (self.selectedZoom) {
      state.z = self.selectedZoom.toString();
    }
  };

  self.load = function (state) {
    if (state.t) {
      self.select(state.t);
    }
    if (state.z) {
      self.selectedZoom = Number(state.z);
    }
  };
  init();
  return self;
};
