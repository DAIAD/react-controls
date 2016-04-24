# react-controls

A collection of (hopefully) reusable React controls

## Controls based on react-bootstrap

### 1. Select Dropdown

A control that mimics the ordinary `<select>`, but in an more cross-browser look-n-feel.
It is built on Bootstrap's (`react-bootstrap`) dropdown button/menu funtionality.

#### Properties - Select Dropdown:

| Name | Required | Type | Description | Example |
| ---- | -------- | ---- | ----------- | --------|
| `id` | Yes | `String` | The DOM id of the dropdown element| `select-something` |
| `name` | No | `String` | The DOM name of the controlled input element (if given)| `something` |
| `width` | No | `Number`, `String` | The width of the (toggle) button| `4em` |
| `value` | No | `String` | The current value of this input (aka selected option) | `foo` |
| `placeholder` | No | `String` | The placeholder text to be shown when value is `null` | `select...` |
| `onChange` | Yes | `(val) => ()` | A callback to be invoked when input has changed|  |
| `onSelect` | No | `(val) => ()` | A callback to be invoked when an option was selected|  |

Notes:

- the `onChange` callback does not accept a synthetic event as 1st argument (as in `<select>`),
  but the changed value instead.
- the `onSelect` callback (does not exist in `<select>`) is invoked regardless of if the selected 
  value has changed. 

#### Example - Select Dropdown:

````javascript
var Select = require('react-controls/select-dropdown');
...
var Foo = React.createClass({
  ...
  // Assume Foo has the following props: timespan, setTimespan
  render: function () {
    return (
      <Select
        id={'select-timespan'}
        name={'timespan'}
        value={this.props.timespan}
        onChange={(val) => (this.props.setTimespan(val))}
       >
        <option key={'day'} value={'day'}>{'Day'}</option>
        <option key={'month'} value={'month'}>{'Month'}</option>
        <option key={'year'} value={'year'}>{'Year'}</option>
      </Select>
    );
});

````

