import React, { Component } from 'react';

import {
	Container,
	Header,
	Title,
	Content,
	Form,
	Item,
	Label,
	Input,
	Button,
	Left,
	Right,
	Body,
	Icon,
	Text,
	StyleProvider,
	Toast,
	Spinner,
	Root
} from 'native-base';
import {
	ImageBackground,
	Dimensions,
	AsyncStorage
} from 'react-native';
import { SecureStore } from 'expo';

import getTheme from '../../native-base-theme/components';

import platform from '../../native-base-theme/variables/platform';
import AuthApi from '../../api/auth';
import config from '../../config';

export class Login extends Component {

	static navigationOptions = ({ navigation }) => {
		const { params = {} } = navigation.state;
		return {
			header: null,
			headerLeft: null,
			headerRight: null
		};
	};

	constructor(props) {
		super(props);
		this.state = { processing: false, email: '', password: '', error: false };
		this.authApi = new AuthApi({ url: config.SERVER_URL });
		this._mounted = false;
	}

	componentDidMount() { }

	onLogInWithFaceIDPressed = () => {
		const { navigate } = this.props.navigation;

		navigate('FaceId');
	};

	validatePassword = (password) => {
		return password != '' ? true : false;
	}

	validateEmail = (email) => {
		let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/
		return pattern.test(String(email).toLowerCase())
	}

	componentDidMount() {
		this._mounted = true;
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	onLoginButtonPressed = async () => {
		if (this.validateEmail(this.state.email) && this.validatePassword(this.state.password)) {
			this.setState({ processing: true });
			const result = await this.authApi.signIn(this.state.email, this.state.password);
			if (!this._mounted) return;
			this.setState({ processing: false });
			try {
				if (result.token) {
					await SecureStore.setItemAsync('userToken', result.token);
					if (!this._mounted) return;
					this.props.navigation.navigate('App');
				} else {
					if (!this._mounted) return;
					this.setState({ error: true })
					Toast.show({
						text: 'Login unsuccessful, please check email and password',
						duration: 10000,
						buttonText: 'Ok'
					});
				}
			} catch (err) {
				console.log(`Error while setting internal storage: ${err}`);
				if (!this._mounted) return;
				this.setState({ error: true })
				Toast.show({
					text: 'Can\'t signin, internal app error',
					duration: 10000,
					buttonText: 'Ok'
				});
			}
		} else {
			if (!this._mounted) return;
			this.setState({ error: true });
			Toast.show({
				text: 'Please provide valid values for email and password',
				duration: 10000,
				buttonText: 'Ok'
			});
		}
	};

	onBackButtonPressed = () => {
		const { navigate } = this.props.navigation;

		navigate('Initial');
	};

	onPassChange = (text) => {
		this.setState({ password: text });
	}

	onEmailChange = (text) => {
		this.setState({ email: text.trim() });
	}

	render() {
		let { height, width } = Dimensions.get('window');
		return (
			<Root>
				<StyleProvider style={getTheme(platform)}>
					<Container>
						<ImageBackground
							source={require("'./../../assets/images/login_bg.png")}
							style={{ width, height }}
						>
							<Header transparent>
								<Left>
									<Button
										transparent
										onPress={this.onBackButtonPressed}
									>
										<Icon
											name="arrow-back"
											style={{
												fontSize: 30,
												color: 'black',
												marginLeft: 20
											}}
										/>
									</Button>
								</Left>
								<Body>
									<Title>Log In</Title>
								</Body>
								<Right />
							</Header>
							<Content
								padder
								contentContainerStyle={{
									flex: 1,
									justifyContent: 'flex-end',
									marginBottom: 36,
									flexDirection: 'column',
									alignItems: 'stretch'
								}}
							>
								{this.state.processing ? <Spinner color='white' /> : null}
								<Form>
									<Item style={{ marginBottom: 15 }} error={this.state.error}>
										<Input
											placeholder="Email"
											autoComplete="username"
											keyboardType="email-address"
											value={this.state.email}
											onChangeText={this.onEmailChange}
										/>
									</Item>
									<Item style={{ marginBottom: 25 }} error={this.state.error}>
										<Input
											placeholder="Password"
											secureTextEntry
											autoComplete="password"
											onChangeText={this.onPassChange}
										/>
									</Item>

									<Button
										block
										onPress={this.onLoginButtonPressed}
									>
										<Text>Log in</Text>
									</Button>
								</Form>
								{/* <Button
								transparent
								onPress={this.onLogInWithFaceIDPressed}
							>
								<Text>Login With Face ID</Text>
							</Button> */}
							</Content>
						</ImageBackground>
					</Container>
				</StyleProvider>
			</Root>
		);
	}
}

export default Login;
