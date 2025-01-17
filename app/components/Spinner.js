import '../css/spinner'

import React, { PropTypes } from 'react'
import { FormattedMessage as T } from 'react-intl'

class Spinner extends React.Component {
  render () {
    return (
      <div className="spinner">
        <div className="spinner-anim">
          <div className="sk-folding-cube">
            <div className="sk-cube1 sk-cube"></div>
            <div className="sk-cube2 sk-cube"></div>
            <div className="sk-cube4 sk-cube"></div>
            <div className="sk-cube3 sk-cube"></div>
          </div>
        </div>
        <div className="spinner-text">
          { this.props.textId ? <T id={ this.props.textId } /> : null }
        </div>
      </div>
    )
  }
}

Spinner.propTypes = {
  textId: PropTypes.string
}

export default Spinner
