// infinite webentities list
import 'react-select/dist/react-select.css'
import './browser-stack-wes-list'

import React, { PropTypes } from 'react'
import Select from 'react-virtualized-select'
import { intlShape } from 'react-intl'
import cx from 'classnames'

class BrowserStackWesList extends React.Component {

  renderArrow = () => {
    return <span className="ti-exchange-vertical"></span>
  }

  renderOption = ({ focusedOption, focusOption, key, option, selectValue, style }) => {
    const w = option
    const className = cx('browser-stack-wes-item', {
      focused: option === focusedOption,
      viewed: w.viewed,
      selected: w.id === this.props.selectedWebentity.id
    })

    const events = option.disabled
      ? {}
      : {
        onClick: () => selectValue(option),
        onMouseOver: () => focusOption(option)
      }

    return (
      <div className={ className } key={ key } style={ style } { ...events }>
        <span className="we-name" title={ w.name }>{ w.name }</span>
        <span className="we-indegree">{ w.indegree }</span>
      </div>
    )
  }

  renderValue = (w) => {
    return (
      <div className="browser-stack-wes-value">
        <span className="we-name">{ w.name }</span>
        <span className="we-indegree">{ w.indegree }</span>
      </div>
    )
  }

  render () {
    const { formatMessage } = this.context.intl
    const { webentities, selectedWebentity, selectWebentity, loadingStack, loadingWE } = this.props
    const { renderArrow, renderOption, renderValue } = this
    const handleSelectWebentity = (v) => selectWebentity(v) 
    
    return (
      <Select className={ cx("browser-stack-wes-list", {loading: loadingStack}) }
        arrowRenderer={ renderArrow }
        clearable={ false }
        disabled={ loadingStack || loadingWE || !webentities.length }
        labelKey={ 'name' }
        // keep in sync with .Select-menu-outer, .Select-menu max-height
        maxHeight={ 490 }
        onChange={ handleSelectWebentity }
        options={ !loadingStack && webentities ? webentities : [] }
        optionRenderer={ renderOption }
        placeholder={ formatMessage({id : loadingStack ? 'loading' : 'select-stack' }) }
        searchable={ false }
        value={ selectedWebentity && selectedWebentity.id }
        valueKey={ 'id' }
        valueRenderer={ renderValue }
      />
    )
  }
}

BrowserStackWesList.contextTypes = {
  intl: intlShape
}

BrowserStackWesList.propTypes = {
  loadingStack: PropTypes.bool,
  loadingWE: PropTypes.bool,
  selectedWebentity: PropTypes.any,
  webentities: PropTypes.array,

  // actions
  selectWebentity: PropTypes.func
}

export default BrowserStackWesList
