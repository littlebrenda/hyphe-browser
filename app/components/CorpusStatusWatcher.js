import React from 'react'

import { connect } from 'react-redux'
import { showError, hideError } from '../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../actions/corpora'
import { fetchTagsCategories, fetchTags } from '../actions/tags'
import {
  CORPUS_STATUS_WATCHER_INTERVAL,
  ERROR_CORPUS_NOT_STARTED,
  ERROR_SERVER_NO_RESOURCE
} from '../constants'

class CorpusStatusWatcher extends React.Component {

  constructor (props) {
    super(props)

    this.watchTimeout = null
  }

  componentDidMount () {
    this.watchStatus()
  }

  componentWillUnmount () {
    if (this.watchTimeout) {
      clearTimeout(this.watchTimeout)
      this.watchTimeout = null
    }
  }

  watchStatus () {
    const { fetchCorpusStatus, showError, hideError, startCorpus, serverUrl, corpus, corpusPassword, fetchTagsCategories, fetchTags } = this.props

    const repeat = (immediate = false) => {
      this.watchTimeout = setTimeout(() => this.watchStatus(), immediate ? 0 : CORPUS_STATUS_WATCHER_INTERVAL)
    }

    // Asynchronously fetch tags categories
    fetchTagsCategories(serverUrl, corpus.corpus_id)

    fetchCorpusStatus(serverUrl, corpus).then(({ payload: { status } }) => {
      if (!status.corpus.ready) {
        if (status.hyphe.ram_left > 0 && status.hyphe.ports_left > 0) {
          // Resources available: start corpus
          showError({ id: ERROR_CORPUS_NOT_STARTED, messageId: 'error.corpus-not-started-starting', fatal: true })
          return startCorpus(serverUrl, corpus, corpusPassword).catch((err) => {
            showError({ messageId: 'error.corpus-failed-starting', messageValues: { error: err.message }, fatal: true })
          }).then(() => {
            hideError()
            // Specific case: we want the next status query to happen ASAP
            return true
          })
        } else {
          // No resource, such a dramatic failure :(
          showError({ id: ERROR_SERVER_NO_RESOURCE, messageId: 'error.corpus-not-started-no-resource', fatal: true })
        }
      }
      // General case: wait before next status query
      return false
    }).then(
      // success: repeat immediately or delayed
      (immediate) => repeat(immediate),
      // error: repeat delayed
      () => repeat(false)
    )
  }

  render () {
    return <div className={ this.props.className }>{ this.props.children }</div>
  }
}

CorpusStatusWatcher.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.string,
  corpus: React.PropTypes.object.isRequired,
  corpusPassword: React.PropTypes.string,
  fetchCorpusStatus: React.PropTypes.func,
  hideError: React.PropTypes.func,
  serverUrl: React.PropTypes.string.isRequired,
  showError: React.PropTypes.func,
  startCorpus: React.PropTypes.func,
  fetchTagsCategories: React.PropTypes.func,
  fetchTags: React.PropTypes.func
}

const mapStateToProps = ({ corpora, servers }) => ({
  corpus: corpora.selected,
  corpusPassword: null, // TODO
  serverUrl: servers.selected.url
})

const mapDispatchToProps = {
  showError,
  hideError,
  fetchCorpusStatus,
  startCorpus,
  fetchTagsCategories,
  fetchTags
}

export default connect(mapStateToProps, mapDispatchToProps)(CorpusStatusWatcher)
