import * as React from 'react'
import { ApolloProvider } from 'react-apollo'
import { shallow } from 'enzyme'
import { mockClient } from '@helpers/test/mock-apollo-client'
import App from './App'

it('renders without crashing', () => {
  const wrapper = shallow(
    <ApolloProvider client={mockClient}>
      <App />
    </ApolloProvider>
  )
  expect(wrapper).toMatchSnapshot()
})
