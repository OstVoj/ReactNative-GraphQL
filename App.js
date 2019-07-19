import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Font } from 'expo';

import Navigation from './Navigation';
import { Root } from 'native-base';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import config from './config';
import { SecureStore } from 'expo';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
		}),
		setContext( async (_, { headers }) => {
			// get the authentication token from local storage if it exists
			const token = await SecureStore.getItemAsync('userToken');
			// return the headers to the context so httpLink can read them
			return {
				headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : "",
				}
			}
			}),
    new HttpLink({
      uri: config.GRAPHQL_SERVER_URL,
      credentials: 'same-origin'
	}),
  ]),
  cache: new InMemoryCache()
});

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fontsReady: false
		};
	}

	componentDidMount() {
		this.initProjectFonts();
	}

	async initProjectFonts() {
		await Font.loadAsync({
			'Poppins-Regular': require('./assets/fonts/PoppinsRegular.ttf'),
			'Poppins-Bold': require('./assets/fonts/PoppinsBold.ttf'),
			iconicreach: require('./assets/fonts/iconicreach.ttf'),
			msgdialogicons: require('./assets/fonts/msgdialogicons.ttf'),
			'.SFNSText': require('./assets/fonts/SFNSText.ttf')
		});
		this.setState({
			fontsReady: true
		});
	}

	render() {
		if (!this.state.fontsReady) {
			return <Expo.AppLoading />;
		}
		return <Root><ApolloProvider client={client}><Navigation /></ApolloProvider></Root>;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
	}
});
