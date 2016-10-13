// lists of links at the bottom of the sidebar

import '../../../css/browser/side-bar-contextual-lists'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'

import { setTabUrl, openTab } from '../../../actions/tabs'
import {
  fetchMostLinked,
  fetchParents,
  fetchSubs,
  selectContextualList
} from '../../../actions/contextual-lists'

class _List extends React.Component {
  onClick (url) {
    const { activeTabId, name, setTabUrl, openTab } = this.props
    if (name === 'mostLinked') {
      setTabUrl(url, activeTabId)
    } else {
      openTab(url)
    }
  }

  render () {
    const { formatMessage } = this.context.intl
    const { name, links, activeTabUrl } = this.props

    return (
      <div className="browser-side-bar-contextual-list">
        <ul>
          { links.length ? links.map(link =>
            ( name === 'mostLinked' ? 
              <li key={ link.url }>
                { link.url.replace(/\/$/, '') !== activeTabUrl.replace(/\/$/, '') ?
                  <div className="link-url" onClick={ () => this.onClick(link.url) }>{ link.url }</div> :
                  <div className="link-url inactive" >{ link.url }</div>
                }
                { link.linked ? <div className="link-linked">
                  { formatMessage({ id: 'linked' }) }
                  <T className="link-linked" id="linkedtimes" values={ { count: link.linked } } />
                </div> :
                <br/> }
              </li> :
              <li key={ link.id }>
                <div className="link-name" onClick={ () => this.onClick(link.homepage) }>{ link.name }</div>
                <div className="link-url" onClick={ () => this.onClick(link.homepage) }>{ link.homepage }</div>
              </li>
            )
          ) : formatMessage({ id: 'none' }) }
        </ul>
      </div>
    )
  }
}

_List.contextTypes = {
  intl: intlShape
}

_List.propTypes = {
  activeTabId: PropTypes.string,
  activeTabUrl: PropTypes.string,
  links: PropTypes.array,
  name: PropTypes.string,

  setTabUrl: PropTypes.func,
  openTab: PropTypes.func
}

const _mapStateToProps = ({ tabs, intl: { locale } }) => ({
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  activeTabUrl: (tabs.activeTab ? tabs.activeTab.url : ''),
  locale
})

const List = connect(_mapStateToProps, {
  setTabUrl,
  openTab,
})(_List)


class SideBarContextualLists extends React.Component {
  componentDidMount () {
    const { serverUrl, corpusId, webentity,
      fetchMostLinked, fetchParents, fetchSubs } = this.props
    fetchMostLinked(serverUrl, corpusId, webentity.id)
    fetchParents(serverUrl, corpusId, webentity.id)
    fetchSubs(serverUrl, corpusId, webentity.id)
  }

  componentWillReceiveProps (props) {
    // change in nav
    /*if (props.selected !== this.props.selected)
      this.updateCurrentList(props.selected)
    // change of list content
    if (JSON.stringify(props[props.selected]) !== JSON.stringify(this.props[props.selected]))
      this.updateCurrentList(props.selected) */
  }

  updateCurrentList (selected) {
    const { serverUrl, corpusId, webentity,
      fetchMostLinked, fetchParents, fetchSubs } = this.props

    // TODO DRY
    switch (selected) {
    case 'parents':
      fetchParents(serverUrl, corpusId, webentity.id)
      break

    case 'subs':
      fetchSubs(serverUrl, corpusId, webentity.id)
      break

    default:
      fetchMostLinked(serverUrl, corpusId, webentity.id)
      break
    }
  }

  render () {
    const { selectContextualList, selected, loading } = this.props

    return (
      <div className="browser-side-bar-contextual-lists">
        <nav>
          { ['mostLinked', 'parents', 'subs'].map(l =>
            <button className={ cx('btn', 'btn-default', { selected: l === selected }) }
              key={ l } onClick={ () => selectContextualList(l) }>
              <T id={ `sidebar.contextual.${l}` } />
            </button>
          ) }
          { loading
            ? <T id="loading-contextual-links" />
            : <List links={ this.props[selected] } name={ selected } />
          }
        </nav>
      </div>
    )
  }
}

SideBarContextualLists.contextTypes = {
  intl: intlShape
}

SideBarContextualLists.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  mostLinked: PropTypes.array,
  parents: PropTypes.array,
  subs: PropTypes.array,
  selected: PropTypes.string,

  fetchMostLinked: PropTypes.func,
  fetchParents: PropTypes.func,
  fetchSubs: PropTypes.func,
  selectContextualList: PropTypes.func
}

const mapStateToProps = ({ contextualLists, intl: { locale } }) => ({
  mostLinked: contextualLists.mostLinked,
  parents: contextualLists.parents,
  subs: contextualLists.subs,
  selected: contextualLists.selected,
  loading: contextualLists.loading,

  locale
})

export default connect(mapStateToProps, {
  fetchMostLinked,
  fetchParents,
  fetchSubs,
  selectContextualList,
})(SideBarContextualLists)
