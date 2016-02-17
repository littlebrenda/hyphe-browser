import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'
import { isWebUri } from 'valid-url'

import { highlightUrlHTML, urlToLru, lruToUrl, longestMatching, parseLru } from '../../utils/lru'
import { getSearchUrl } from '../../utils/search-web'

class BrowserTabUrlField extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      url: props.initialUrl,
      editing: false,
      focusInput: false,
      overPrefixUntil: -1,
      userPrefixUntil: -1
    }
  }

  componentWillReceiveProps ({ initialUrl, prefixSelector }) {
    if (prefixSelector && !this.props.prefixSelector) {
      // Reset prefix information before rendering prefix selector
      this.setState({ overPrefixUntil: -1, userPrefixUntil: -1 })
    }
    if (initialUrl !== this.props.initialUrl && initialUrl !== this.state.url) {
      // Really a new URL (a priori incoming from Redux)
      this.setState({ url: initialUrl })
    }
  }

  shouldComponentUpdate ({ initialUrl, lruPrefixes, prefixSelector, loading }, { url, editing, overPrefixUntil }) {
    return this.state.url !== initialUrl || this.state.url !== url // update only if URL *really* changes
      // Standard conditions on other props/state
      || this.props.lruPrefixes !== lruPrefixes
      || this.props.loading !== loading
      || this.state.editing !== editing
      || this.props.prefixSelector !== prefixSelector
      || this.state.overPrefixUntil !== overPrefixUntil
  }

  componentDidUpdate () {
    if (this.state.editing && this.state.focusInput) {
      findDOMNode(this).querySelector('input').select()
    }
  }

  onSubmit (e) {
    e.preventDefault()

    this.setState({ editing: false })

    const url = ((u) => {
      if (!isWebUri(u)) {
        const httpu = 'http://' + u
        if (isWebUri(httpu)) {
          this.setState({ url: httpu })
          return httpu
        } else {
          const searchu = getSearchUrl(u)
          this.setState({ url: searchu })
          return searchu
        }
      } else {
        return u
      }
    })(this.state.url)

    this.props.onSubmit(url)
  }

  onChange (e) {
    e.stopPropagation()

    this.setState({ url: e.target.value, focusInput: false })
  }

  renderField () {
    if (this.props.prefixSelector) {
      return this.renderPrefixSelector()
    } else if (this.state.editing) {
      return this.renderFieldInput()
    } else {
      return this.renderFieldHighlighted()
    }
  }

  // Read-write field: standard input
  renderFieldInput () {
    return <input
      className={ cx('form-control btn btn-large', { loading: this.props.loading }) }
      type="text"
      value={ this.state.url }
      onBlur={ () => this.setState({ editing: false }) }
      onChange={ (e) => this.onChange(e) } />
  }

  // Read-only field with highlights: click to edit
  renderFieldHighlighted () {
    const className = cx('form-control btn btn-large browser-tab-url', { loading: this.props.loading })
    const onClick = () => this.setState({ editing: true, focusInput: true })

    if (!this.props.lruPrefixes) {
      return <span className={ className } onClick={ onClick }>{ this.state.url || <span className="browser-tab-url-placeholder">enter address</span> }</span>
    }

    return <span className={ className } onClick={ onClick }
      dangerouslySetInnerHTML={ {
        __html: highlightUrlHTML(this.props.lruPrefixes, this.state.url)
      } } />
  }

  // LRU selector by prefix: click to select
  renderPrefixSelector () {
    const matching = longestMatching(this.props.lruPrefixes, this.state.url)
    const lru = (matching && matching.lru) || parseLru({})
    const url = urlToLru(this.state.url)

    const parts = [ [ 'scheme', url.scheme + '://', url.scheme === lru.scheme ] ]
      .concat(url.host.map((h, i) => [ 'host', '.' + h, url.host[i] === lru.host[i] ]))
      .concat([ [ 'port', url.port && (':' + url.port), url.port === lru.port ] ])
      .concat((url.path.length === 0 && (url.query || url.fragment))
        ? [ [ 'path', '/', lru.path.length === 0 && (lru.query || lru.fragment) ] ]
        : url.path.map((p, i) => [ 'path', '/' + p, url.path[i] === lru.path[i] ]))
      .concat([ [ 'query', url.query && ('?' + url.query), url.query === lru.query ] ])
      .concat([ [ 'fragment', url.fragment && ('#' + url.fragment), url.fragment === lru.fragment ] ])

    return (
      <div className="form-control btn btn-large browser-tab-prefix-selector">
        <div className="btn-group" onMouseOut={ () => this.setState({ overPrefixUntil: -1 }) }>
          { parts.map((p, i, a) => this.renderPrefixSelectorButton(p, i, a, lruToUrl(lru))) }
        </div>
      </div>
    )
  }

  // One part of the prefix selector: hover to overview, click to choose
  renderPrefixSelectorButton ([ prop, label, selected ], index, allParts, originalLruUrl) {
    if (label) {
      const classes = [
        'btn btn-default prefix',
        { 'prefix-selected': (this.state.userPrefixUntil >= 0) ? (index <= this.state.userPrefixUntil) : selected },
        { 'prefix-over': index <= this.state.overPrefixUntil }
      ]
      return (
        <button key={ 'prefix-selector-' + index } className={ cx(classes) }
          disabled={ index <= 1 } // can't be limited to protocol and tld
          onMouseOver={ () => this.setState({ overPrefixUntil: index }) }
          onClick={ () => this.selectPrefix(allParts, index, originalLruUrl) }>
          { label }
        </button>
      )
    } else {
      return null
    }
  }

  selectPrefix (parts, index, originalLruUrl) {
    const selected = parts.slice(0, index + 1)

    // Build URL prefix from this
    const lru = selected.reduce((o, [prop, value]) => {
      o[prop] = {
        scheme: () => value.substring(0, value.length - 3), // remove '://'
        host: () => (o.host || []).concat([ value.substring(1) ]), // remove '.' and concat
        port: () => value.substring(1), // remove ':'
        path: () => (o.path || []).concat([ value.substring(1) ]), // remove '.' and concat
        query: () => value.substring(1), // remove '?'
        fragment: () => value.substring(1) // remove '#'
      }[prop]()
      return o
    }, {})
    const lruUrl = lruToUrl(lru)

    this.props.onSelectPrefix(lruUrl, lruUrl !== originalLruUrl)
    this.setState({ userPrefixUntil: index })
  }

  render () {
    return (
      <form onSubmit={ (e) => this.onSubmit(e) }>
        { this.renderField() }
      </form>
    )
  }
}

BrowserTabUrlField.propTypes = {
  initialUrl: PropTypes.string.isRequired,
  lruPrefixes: PropTypes.arrayOf(PropTypes.string),
  onSubmit: PropTypes.func.isRequired,
  prefixSelector: PropTypes.bool.isRequired,
  onSelectPrefix: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
}

export default BrowserTabUrlField
