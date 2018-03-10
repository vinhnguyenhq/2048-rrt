import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { getLocaleFromBrowserLanguage } from '@helpers/grab-locale'
import { logException } from '@helpers/grab-log'
import GrabStorage from '@helpers/grab-storage'
import createRootStore from '@src/redux/store'
import App from '@components/App'
import registerServiceWorker from './registerServiceWorker'
import './index.less'

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement)
registerServiceWorker()

const LOCALES = ['en', 'vi']

const locale = getLocaleFromBrowserLanguage({
  defaultLocale: 'en',
  availableLocales: LOCALES,
  navigator: window.navigator,
})

window.Grab = {
  config: {},
  phoneCodes: {},
  storage: GrabStorage,
}

const store = createRootStore()
const renderApp = (Component: React.ComponentType) => {
  ReactDOM.render(
    <Provider store={store}>
      <Component />
    </Provider>,
    document.getElementById('root') as HTMLElement
  )
}

function handleError(error: Error) {
  logException(error, 'Configs')
}

function loadConfig() {
  return window.fetch(require('config.json'))
}

function loadLocale() {
  return window.fetch(require(`../public/locales/${locale}.json`))
}

function loadPhoneCodes() {
  return window.fetch(require('phone_codes.json'))
}

function run() {
  loadPhoneCodes()
    .then(async response => {
      if (response.status === 200) {
        window.Grab.phoneCodes = await response.json()
      }
    })
    .catch(handleError)

  loadLocale()
    .then(async response => {
      if (response.status === 200) {
        I18n.translations[locale] = await response.json()
        I18n.locale = locale
      }
    })
    .catch(handleError)

  loadConfig()
    .then(async response => {
      if (response.status === 200) {
        window.Grab.config = await response.json()

        if (process.env.NODE_ENV !== 'development' && window.Grab.config.sentryDsn) {
          Raven.config(window.Grab.config.sentryDsn).install()
        }

        renderApp(App)
      }
    })
    .catch(handleError)
}

if (module.hot) {
  module.hot.accept('@components/App', () => {
    const NextApp = require('@components/App').default
    renderApp(NextApp)
  })
}

run()
registerServiceWorker()
