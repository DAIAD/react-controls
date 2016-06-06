'use strict'

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

var _ = require('lodash');
var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var {Dropdown, MenuItem} = require('react-bootstrap');

var PropTypes = React.PropTypes;

var sameMap = function (map1, map2)
{
  // We consider 2 maps equal if they contain the same (k,v) pairs with
  // exactly the same order
  var a1 = Array.from(map1.entries()), a2 = Array.from(map2.entries());
  return _.zip(a1, a2).every(p => (_.isEqual(...p)));
}

var randomString = () => (parseInt(Math.random() * 1e+9).toString(36));

var Select = React.createClass({
  
  mixins: [
    PureRenderMixin,
  ],

  propTypes: {
    id: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    // Options: if supplied, has precedence over children <option>s
    options: PropTypes.oneOfType([
      PropTypes.instanceOf(Map), 
      PropTypes.arrayOf(
        PropTypes.shape({
          group: PropTypes.string,
          options: PropTypes.instanceOf(Map),
        })
      ),
    ]),
    // Appearence
    className: PropTypes.string,
    textClassName: PropTypes.string,
    textWidth: PropTypes.oneOfType(PropTypes.string, PropTypes.number),
    // Behavior
    allowEmptyGroups: PropTypes.bool,
    // Callbacks
    onSelect: PropTypes.func,
    onChange: PropTypes.func,
  },

  getInitialState: function () {
    var options = this.constructor.makeOptions(this.props);
    var value = this.props.value, defaultValue = this.props.defaultValue;
    return {
      id: this.props.id || ('select-dropdown-' + randomString()),
      value: this.constructor.validateOption(value, options)? value : defaultValue,
      options: options,
    };
  },
  
  getDefaultProps: function () {
    return {
      textClassName: 'text',
      allowEmptyGroups: false,
    };
  },
  
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.id != this.props.id) {
      throw new Error('The `id` property is not supposed to be updated');
    }
    
    var updated = {};
    
    var nextOptions = this.constructor.makeOptions(nextProps);
    if (!sameMap(this.state.options, nextOptions)) {
      updated.options = nextOptions;
    }
    
    var value = nextProps.value;
    if (this.constructor.validateOption(value, nextOptions)) {
      updated.value = value;
    } else {
      updated.value = nextProps.defaultValue;
    }

    if (!_.isEmpty(updated)) {
      this.setState(updated);
    }
  },

  render: function () {
    var {value, options} = this.state;
    
    var currentOption = this.constructor.findOption(value, options);
    var text = (currentOption == null)? this.props.placeholder : currentOption.toString();
   
    var classname = 'select-dropdown' + (
      (this.props.className)? (' ' + this.props.className) : (''));
    
    var textprops = {
      className: this.props.textClassName +
        ((!currentOption || (_.isObject(currentOption) && !currentOption.value))? ' empty-value' : ''),
      style: {
        width: this.props.textWidth,
        display: 'inline-block',
        verticalAlign: 'top',
        textAlign: 'left',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
    };
     
    // Maintain a controlled <input> in order to be compatible with an ordinary forms
    
    var input = (this.props.name)? 
      (<input type="hidden" name={this.props.name} value={value || ''}/>) : null;
    
    // Build menu items
    
    var groupBuilder = (group, i) => {
      if (!this.props.allowEmptyGroups && !group.options.size)
        return [];
      
      var header = (group.group)? 
        (<MenuItem key={"optgroup-" + i} header>{group.group}</MenuItem>) : null;
      var items = Array.from(group.options.keys()).map((v) => {
        var o = group.options.get(v);
        var p = {
          key: v,
          eventKey: v,
          disabled: (o.disabled || null),
          className: v?  null : 'empty-value', 
        };
        return (<MenuItem {...p}>{o.toString()}</MenuItem>);
      });
      
      return (header)? [].concat([header], items) : items;
    };
    
    var menu = [].concat(...options.map(groupBuilder));
    
    // Render

    return (
      <Dropdown 
        className={classname}
        id={this.state.id}
        onSelect={(ev, val) => (this._handleSelection(val))} 
       >
        {input}
        <Dropdown.Toggle>
          <span {...textprops}>{text || ''}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {menu}
        </Dropdown.Menu>
      </Dropdown>
    );
  },

  // Callbacks
  
  _handleSelection: function (val) {
    
    var changed = (val != this.state.value);
    var controlled = (this.props.value != null);

    // Change own state (if in uncontrolled mode)

    if (changed && !controlled) {
      this.setState({value: val})
    }

    // Fire the supplied callbacks

    if (_.isFunction(this.props.onSelect)) {
      this.props.onSelect.call(undefined, val);
    }
    
    if (changed && _.isFunction(this.props.onChange)) {
      this.props.onChange.call(undefined, val);
    }

    return false;
  },

  // Public methods
  
  getValue: function () {
    return this.state.value;
  },

  // Helpers
  
  statics: {

    findOption: function (value, options) {
      if (value == null)
        return null;
      
      var i = options.findIndex(group => (group.options.has(value)));
      return (i < 0)? null : options[i].options.get(value);
    },
    
    validateOption: function (value, options) {
      return (
        (value != null) &&
        (options.some(group => (group.options.has(value))))
      );
    },

    makeOption: function (optionElement) {
      var o = {
        value: optionElement.props.value,
        text: optionElement.props.children.toString(),
      };
      
      if (optionElement.props.disabled)
        o.disabled = optionElement.props.disabled;
      
      o.toString = () => (o.text);
      return o;
    },
    
    makeOptions: function (props) {
      var options = [];

      if (props.options) { 
        if (props.options instanceof Map) {
          // add all options into default group
          options = [
            {group: null, options: props.options}
          ];
        } else if (_.isArray(props.options)) {
          // no need to convert anything
          options = props.options;
        } 
      } else if (props.children != null) {
        var rootgroup = {group: null, options: new Map()};
        options.push(rootgroup);
        var children = _.isArray(props.children)? props.children : [props.children];
        children.forEach((c) => {
          if (c.type == 'option') {
            rootgroup.options.set(c.props.value, this.makeOption(c));
          } else if (c.type == 'optgroup') {
            var opts1 = c.props.children;
            if (opts1 != null) {
              opts1 = _.isArray(opts1)? opts1 : [opts1];
              options.push({
                group: c.props.label, 
                options: new Map(opts1.map(c1 => (
                  [c1.props.value, this.makeOption(c1)]
                )))
              });
            }
          } else {
            console.assert(false,
              'Expected children as <option> or <optgroup> elements!'
            );
          }
        });
      }

      return options;
    },
  },

});

module.exports = Select;
