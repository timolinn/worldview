/**
 * @module wv.naturalEvents
 */
var wv = wv || {};
wv.naturalEvents = wv.naturalEvents || {};

/**
 * @class wv.naturalEvents.model
 */
wv.naturalEvents.model = wv.naturalEvents.model || function (models, config, ui) {
  var self = {};
  self.selected = null;
  self.active = false;
  self.layers = config.naturalEvents.layers;

  /**
   * Handler for events fired by this class.
   *
   * @attribute events {Events}
   * @readOnly
   * @type Events
   */
  self.events = wv.util.events();

  self.save = function (state) {
    if (self.active) {
      var id = ui.naturalEvents.selected.id;
      var date = ui.naturalEvents.selected.date;
      var value = id ? date ? [id, date].join(',') : id : true;
      state.e = value;
    }
  };

  self.load = function (state) {
    if (!state.e) return;
    models.wv.events.on('startup', function () {
      ui.sidebar.selectTab('events');
    });
    var values = state.e.split(',');
    var id = values[0] || '';
    var date = values[1] || '';
    id = id.match(/^EONET_[0-9]+/i) ? values[0] : null;
    date = date.match(/\d{4}-\d{2}-\d{2}/) ? values[1] : null;
    if (id) {
      self.events.on('hasData', function () {
        ui.naturalEvents.selectEvent(id, date);
      });
    }
  };

  return self;
};
