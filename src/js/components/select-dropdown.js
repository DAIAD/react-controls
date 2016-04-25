// A control that mimics the ordinary <select>, but in an more cross-browser look-n-feel.
// It is built on Bootstrap's (react-bootstrap) dropdown button/menu funtionality.

// Example:
//
//  <Select
//    id={'dropdown-timespan'}
//    name={'timespan'}
//    value={this.props.timespan}
//    onChange={(val) => (this.props.setTimespan(val))}
//   >
//    <option key={'day'} value={'day'}>{'Day'}</option>
//    <option key={'month'} value={'month'}>{'Month'}</option>
//    <option key={'year'} value={'year'}>{'Year'}</option>
//  </Select>

var _ = global.lodash || require('lodash');
var React = global.React || require('react');
var ReactBootstrap = global.ReactBootstrap || require('react-bootstrap');
var {Dropdown, MenuItem} = ReactBootstrap;

var PropTypes = React.PropTypes;

var isSameMap = function (map1, map2)
{
  // We consider 2 maps equal if they contain the same (k,v) pairs with
  // exactly the same order
  var a1 = Array.from(map1.entries()), a2 = Array.from(map2.entries());
  return _.zip(a1, a2).every(p => (_.isEqual(...p)));
}

var randomString = (d=9) => (
  parseInt(Math.random() * Math.pow(10, d)).toString(36)
);

var Select = React.createClass({
  
  mixins: [
    React.addons.pureRenderMixin,
  ],

  propTypes: {
    id: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    options: PropTypes.instanceOf(Map), // if supplied, has precedence over children <option>s
    // Appearence
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // Callbacks
    onSelect: PropTypes.func,
    onChange: PropTypes.func,
  },

  getInitialState: function () {
    var options = this.constructor.makeOptionMap(this.props);
    var value = this.props.value;
    return {
      id: this.props.id || randomString(),
      value: (value && options.has(value))? value : null,
      options: options,
    };
  },
  
  getDefaultProps: function () {
    return {
      onSelect: (val) => (console.info('Selected: ' + val)),
      width: '5em',
    };
  },
  
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.id != this.props.id) {
      throw new Error('The `id` property is not supposed to be updated');
    }
    
    var updated = {};
    
    var nextOptions = this.constructor.makeOptionMap(nextProps);
    if (!isSameMap(this.state.options, nextOptions)) {
      updated.options = nextOptions;
    }
    
    var value = nextProps.value;
    if (value && nextOptions.has(value)) {
      updated.value = value;
    }

    if (!_.isEmpty(updated)) {
      this.setState(updated);
    }
  },

  render: function () {
    var options = this.state.options; 
    var value = this.state.value;
    
    var textprops = 
    {
      className: 'title text',
      style: {
        width: this.props.width,
        display: 'inline-block',
        verticalAlign: 'top',
        textAlign: 'left',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
    };
    
    var text = value? (options.get(value)) : (this.props.placeholder || '');
     
    // Maintain a controlled <input> in order to be compatible with an ordinary forms
    var input = (this.props.name)? 
      (<input type="hidden" name={this.props.name} value={this.props.value || ''}/>) : null;
    
    var itemBuilder = (val) => (
      <MenuItem key={val} eventKey={val} value={val}>{options.get(val)}</MenuItem>
    );
    
    return (
      <Dropdown 
        id={this.state.id}
        onSelect={(ev, val) => (this._handleSelection(val))} 
       >
        {input}
        <Dropdown.Toggle>
          <span {...textprops}>{text}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Array.from(options.keys()).map(itemBuilder)}
        </Dropdown.Menu>
      </Dropdown>
    );
  },

  // Callbacks
  
  _handleSelection: function (val) {
    
    // Fire the supplied callbacks

    if (_.isFunction(this.props.onSelect)) {
      this.props.onSelect.call(undefined, val);
    }
    
    if (_.isFunction(this.props.onChange) && val != this.state.value) {
      this.props.onChange.call(undefined, val);
    }

    return false;
  },

  // Helpers
  
  statics: {
    
    makeOptionMap: function (props) {
      if (props.options) { 
        // No need to convert anything
        return props.options;
      }
      
      var children = props.children;
      if (children == null)
        return new Map([]);
      
      console.assert(
        children.every(c => (c.type == 'option')),
        'Expected all children to be plain <option> elements!'
      );

      return new Map(children.map((c) => (
        [c.props.value, c.props.children.toString()]
      )));
    },
  },

});

module.exports = Select;
