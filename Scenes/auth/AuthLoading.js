import React from 'react';
import {
	ActivityIndicator,
	AsyncStorage,
	StatusBar,
	View
} from 'react-native';
import { Toast } from 'native-base';
import AuthApi from '../../api/auth';
import config from '../../config';
import { SecureStore } from 'expo';
import { SafeAreaView } from 'react-navigation';

class AuthLoadingScreen extends React.Component {
	constructor(props) {
		super(props);
		this._mounted = false;
		this.authApi = new AuthApi({ url: config.SERVER_URL });
	}

	componentDidMount() {
		this._mounted = true;
		this._bootstrapAsync();
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	// Fetch the token from storage then navigate to our appropriate place
	_bootstrapAsync = async () => {
		// This will switch to the App screen or Auth screen and this loading
		// screen will be unmounted and thrown away.
		const userToken = await SecureStore.getItemAsync('userToken');

		if (userToken) {
			const result = await this.authApi.getUser(userToken);
			if (!this._mounted) return;
			if (result._id) {
				this.props.navigation.navigate('App');
			} else {
				Toast.show({
					text: 'Login expired or not authorized, please re-login',
					buttonText: 'Ok',
					duration: 10000
				});
				this.props.navigation.navigate('Auth');
			}

		} else {
			this.props.navigation.navigate('Auth');
		}
	};

	// Render any loading content that you like here
	render() {
		return (
			<SafeAreaView style={{flex:1}}>
				<ActivityIndicator style={{flex:1}} />
				<StatusBar barStyle="default" />
			</SafeAreaView>
		);
	}
}

export default AuthLoadingScreen;
