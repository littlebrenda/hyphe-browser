import React from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'

import './browser-tab-webentity-name-field'

class BrowserTabWebentityNameField extends React.Component {

  constructor (props) {
    super(props)
    this.state = { dirty: false, editing: false }
  }

  // React told me:
  // "Well dude, you chose to make an uncontrolled input, now YOU control it yourself"
  // Had to agree
  componentWillReceiveProps ({ initialValue }) {
    if (!this.state.editing && !this.state.dirty) {
      findDOMNode(this).value = initialValue
    }
  }

  shouldComponentUpdate ({ initialValue, disabled, editable }) {
    if (disabled !== this.props.disabled) {
      return true
    }
    if (editable !== this.props.editable) {
      return true
    }
    if (!this.state.dirty && initialValue !== this.props.initialValue) {
      return true
    }
    return false
  }

  handleKeyUp = (e) => {
    if (~[13, 27].indexOf(e.keyCode)) {
      this.setState({ dirty: false, editing: false })
      e.target.blur()
      if (e.keyCode === 13) { // ENTER
        this.props.onChange(e.target.value)
      } else if (e.keyCode === 27) { // ESCAPE
        e.target.value = this.props.initialValue
      }
    }
  }

  handleChange = () => {
    this.setState({ dirty: true, editing: true })
  }

  handleFocus = () => {
    this.setState({ editing: true })
  }

  handleBlur = () => {
    this.setState({ editing: false })
  }


  render () {
    return (<input className={ cx('browser-tab-webentity-name over-overlay', { loading: !this.props.initialValue }) }
      disabled={ this.props.disabled } // PAGE_HYPHE_HOME
      defaultValue={ this.props.initialValue }
      readOnly={ !this.props.editable || !this.props.initialValue }
      onKeyUp={ this.handleKeyUp }
      onFocus={ this.handleFocus }
      onBlur={ this.handleBlur }
      onChange={ this.handleChange }
            />)
  }
}

BrowserTabWebentityNameField.propTypes = {
  initialValue: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  editable: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
}

BrowserTabWebentityNameField.defaultProps = {
  initialValue: ''
}

export default BrowserTabWebentityNameField
