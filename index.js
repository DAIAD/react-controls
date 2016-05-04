// Lazy-load the requested controls
module.exports = {
  get ['select-dropdown'] () {
    return require('./src/js/components/select-dropdown')
  },
};
