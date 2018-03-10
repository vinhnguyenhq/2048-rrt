import * as React from 'react'
import { Route, Switch, Redirect, RouteProps } from 'react-router-dom'
import { Spin } from 'antd'
import { isAuthenticated } from '@helpers/grab-auth'
import Bundle from '@components/common/Bundle'

export const renderAsync = (
  asyncLoad: () => void,
  _props: RouteProps,
  authRequired: boolean = false
) => {
  const bundleComp = (
    <Bundle load={asyncLoad}>
      {(Component: React.ComponentClass) =>
        Component ? <Component {..._props} /> : <Spin size="large" />
      }
    </Bundle>
  )

  if (authRequired) {
    if (!isAuthenticated()) {
      return <Redirect to={{ pathname: '/' }} />
    }
  }

  return bundleComp
}

const Router: React.SFC<{}> = () => {
  return (
    <Switch>
      <Route
        path="/"
        exact={true}
        component={(props: RouteProps) =>
          renderAsync(() => import('@containers/SignUp'), props)
        }
      />
      <Route
        path="/login"
        exact={true}
        component={(props: RouteProps) =>
          renderAsync(() => import('@containers/SignIn'), props)
        }
      />
      <Route
        path="/otp"
        exact={true}
        component={(props: RouteProps) =>
          renderAsync(() => import('@containers/OTP'), props)
        }
      />
      <Route
        path="/signup-success"
        exact={true}
        component={(props: RouteProps) =>
          renderAsync(() => import('@containers/SignUpSuccess'), props)
        }
      />
      <Route
        path="/application"
        exact={true}
        component={(props: RouteProps) =>
          renderAsync(() => import('@containers/Application'), props, true)
        }
      />
      <Route
        path="/application/:applicationID/sections/:name"
        component={(props: RouteProps) =>
          renderAsync(() => import('@containers/SectionDetail'), props, true)
        }
      />

      <Route
        path="/vehicle/:vehicleID/sections/:name"
        component={(props: RouteProps) =>
          renderAsync(() => import('@containers/VehicleDetail'), props, true)
        }
      />
    </Switch>
  )
}

export default Router
