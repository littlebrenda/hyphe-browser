import createReducer from '../utils/create-reducer'
import uuid from 'uuid'

import { PAGE_HYPHE_HOME, HYPHE_TAB_ID } from '../constants'
import {
  OPEN_TAB, CLOSE_TAB, SELECT_TAB,
  SET_TAB_URL, SET_TAB_TITLE, SET_TAB_ICON, SET_TAB_STATUS,
  ADD_HYPHE_TAB
} from '../actions/tabs'
import { SELECT_CORPUS } from '../actions/corpora'

const pageHypheHome = {
  url: PAGE_HYPHE_HOME,
  id: uuid(),
  title: null,
  icon: null,
  loading: false,
  error: null,
  fixed: false
}

const hypheTab = {
  url: '{INSTANCE_HOME}/#/project/{CORPUS_ID}/network', // defined dynamically
  id: HYPHE_TAB_ID,
  title: null,
  icon: null,
  loading: false,
  error: null,
  fixed: true
}

const initialState = {
  tabs: [pageHypheHome], // tab: { url, id, title, icon, loading, error }
  activeTab: pageHypheHome // reference to active tab
}

export default createReducer(initialState, {

  [OPEN_TAB]: (state, { url, title }) => {
    const id = uuid()
    const icon = null // TODO default icon
    const tab = { url, id, title, icon }

    return {
      ...state,
      tabs: state.tabs.concat(tab),
      activeTab: tab
    }
  },

  [CLOSE_TAB]: (state, id) => {
    const tab = state.tabs.find((tab) => tab.id === id)
    if (tab.fixed) {
      // Fixed tabs cannot be closed
      return state
    }

    const tabs = state.tabs.filter((tab) => tab.id !== id)
    // if active tab is closed: switch to next tab (or last)
    const tabIndex = state.tabs.findIndex((tab) => tab.id === id)
    const nextTab = tabs[tabIndex] || tabs[tabs.length - 1] || null
    const activeTab = (id === state.activeTab) ? nextTab : state.activeTab

    return {
      ...state,
      tabs,
      activeTab
    }
  },

  [SELECT_TAB]: (state, id) => ({
    ...state,
    activeTab: state.tabs.find((tab) => tab.id === id)
  }),

  [ADD_HYPHE_TAB]: (state, { instanceUrl, corpusId }) => ({
    ...state,
    tabs: state.tabs.concat([{
      ...hypheTab,
      url: hypheTab.url
        .replace(/\{INSTANCE_HOME\}/g, instanceUrl)
        .replace(/\{CORPUS_ID\}/g, corpusId)
    }])
  }),

  [SET_TAB_URL]: (state, { id, url }) => updateTab(state, id, () => ({ url })),
  [SET_TAB_TITLE]: (state, { id, title }) => updateTab(state, id, () => ({ title })),
  [SET_TAB_ICON]: (state, { id, icon }) => updateTab(state, id, () => ({ icon })),
  [SET_TAB_STATUS]: (state, { id, loading, error, url }) => updateTab(state, id, (tab) => ({ loading, error, url: url || tab.url })),

  // Reset state when selecting corpus
  [SELECT_CORPUS]: () => ({ ...initialState })

})


function updateTab (state, id, updates) {
  const foundTab = state.tabs.find((tab) => tab.id === id)
  const updatedTab = { ...foundTab, ...updates(foundTab) }
  const tabs = state.tabs.map((tab) => (tab.id === id) ? updatedTab : tab)
  const activeTab = (state.activeTab && state.activeTab.id === id) ? updatedTab : state.activeTab

  return { ...state, tabs, activeTab }
}
