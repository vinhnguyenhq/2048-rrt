import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Alert } from 'antd'
import Raven from 'raven-js'
import Router from '@components/Router'
const styles = require('./App.less')

interface AppState {
  error?: Error | null
}

class App extends React.PureComponent<{}, AppState> {
  state = { error: null }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error })

    Raven.captureException(error, { extra: errorInfo })
  }

  render() {
    const { error } = this.state

    return (
      <div className={styles.root}>
        {error ? (
          <Alert type="error" message="We're sorry — something's went wrong." />
        ) : (
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        )}
      </div>
    )
  }
}

export default App
