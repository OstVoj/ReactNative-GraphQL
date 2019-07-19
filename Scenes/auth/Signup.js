import React, { Component } from 'react';

import {
	Container,
	Header,
	Title,
	Content,
	Form,
	Item,
	Grid,
	Col,
	Input,
	Button,
	Left,
	Right,
	Body,
	Icon,
	Text,
	StyleProvider,
	Toast,
	Spinner
} from 'native-base';
import { ImageBackground, Dimensions, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import getTheme from '../../native-base-theme/components';

import platform from '../../native-base-theme/variables/platform';

import countriesData from '../../data/countries';
import AuthApi from '../../api/auth';
import config from '../../config';
import { SecureStore } from 'expo';

//console.log(countriesData);
export class Signup extends Component {
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
		this.state = {
			processsing: false,
			error: false,
			country: '',
			selectedItems: [],
			dialCode: '',
			email: '',
			password: '',
			firstName: '',
			lastName: '',
			phoneNum: ''
		};
		this._mounted = false;
		this.authApi = new AuthApi({ url: config.SERVER_URL });
	}

	componentDidMount() {
		this._mounted = true;
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	validatePassword = password => {
		return password != '' ? true : false;
	};

	validateName = text => {
		return text != '' ? true : false;
	};

	validateCountry = text => {
		return text != '' ? true : false;
	};

	validateNumber = num => {
		const pattern = /^(\s*|\d+)$/;
		return pattern.test(String(num));
	};

	validateEmail = email => {
		const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
		return pattern.test(String(email).toLowerCase());
	};

	onSignUpButtonPressed = async () => {
		if (
			this.validateEmail(this.state.email) &&
			this.validatePassword(this.state.password) &&
			this.validateNumber(this.state.phoneNum) &&
			this.validateName(this.state.firstName) &&
			this.validateName(this.state.lastName) &&
			this.validateCountry(this.state.country)
		) {
			this.setState({ processing: true });
			const request = {
				country: this.state.country,
				email: this.state.email,
				password: this.state.password,
				firstName: this.state.firstName,
				lastName: this.state.lastName,
				phone: this.state.dialCode + this.state.phoneNum
			};
			const result = await this.authApi.signUp(request);
			if (!this._mounted) return;
			this.setState({ processing: false });
			try {
				if (result.token) {
					await SecureStore.setItemAsync('userToken', result.token);
					if (!this._mounted) return;
					this.props.navigation.navigate('App');
				} else {
					this.setState({ error: true });
					Toast.show({
						text: `Sign up unsuccessful:\n${result.error}, please try again`,
						buttonText: 'Ok',
						duration: 10000
					});
				}
			} catch (err) {
				console.warn(`Error while setting internal storage: ${err}`);
				if (!this._mounted) return;
				this.setState({ error: true });
				Toast.show({
					text: "Can't sign up, internal app error",
					buttonText: 'Ok'
				});
			}
		} else {
			this.setState({ error: true });
			Toast.show({
				text: 'Please provide valid values for fields',
				buttonText: 'Ok'
			});
		}
	};

	onLogInWithFaceIDPressed = () => {
		const { navigate } = this.props.navigation;

		navigate('FaceId');
	};

	onBackButtonPressed = () => {
		const { navigate } = this.props.navigation;

		navigate('Initial');
	};

	onPassChange = text => {
		this.setState({ password: text });
	};

	onEmailChange = text => {
		this.setState({ email: text.trim() });
	};

	onNumberChange = text => {
		this.setState({ phoneNum: text });
	};

	onLastnameChange = text => {
		this.setState({ lastName: text.trim() });
	};

	onFirstnameChange = text => {
		this.setState({ firstName: text.trim() });
	};

	render() {
		let { height, width } = Dimensions.get('window');
		return (
			<StyleProvider style={getTheme(platform)}>
				<Container>
					<ImageBackground
						source={require("'./../../assets/images/signup_bg.png")}
						style={{ width, height }}
					>
						<Header transparent>
							<Left>
								<Button transparent onPress={this.onBackButtonPressed}>
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
							<Body style={{ flex: 3 }}>
								<Title>Register</Title>
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
							{this.state.processing ? <Spinner color="red" /> : null}
							<Form>
								<Item
									style={{ marginBottom: 15 }}
									error={!this.validateEmail(this.state.email)}
								>
									<Input
										placeholder="Email"
										autoComplete="username"
										keyboardType="email-address"
										onChangeText={this.onEmailChange}
									/>
								</Item>
								<Item
									style={{ marginBottom: 25 }}
									error={!this.validatePassword(this.state.password)}
								>
									<Input
										placeholder="Password"
										secureTextEntry
										autoComplete="password"
										onChangeText={this.onPassChange}
									/>
								</Item>
								<Grid style={{ height: 64, marginBottom: 64 }}>
									<Col style={{ height: 64, marginBottom: 64 }}>
										<Item
											style={{ marginBottom: 25 }}
											error={!this.validateName(this.state.firstName)}
										>
											<Input
												placeholder="First Name"
												autoComplete="name"
												onChangeText={this.onFirstnameChange}
											/>
										</Item>
									</Col>
									<Col style={{ height: 64, marginBottom: 64 }}>
										<Item
											style={{ marginBottom: 25 }}
											error={!this.validateName(this.state.lastName)}
										>
											<Input
												placeholder="Last Name"
												autoComplete="name"
												onChangeText={this.onLastnameChange}
											/>
										</Item>
									</Col>
								</Grid>
								<Item
									style={{ marginBottom: 25 }}
									error={!this.validateCountry(this.state.country)}
								>
									<RNPickerSelect
										placeholder={{
											label: 'Your Country',
											value: null,
											color: '#9EA0A4'
										}}
										items={countriesData.countries}
										onValueChange={(value, key) => {
											this.setState({
												country: value,
												dialCode: countriesData.countries[key - 1].key
											});
										}}
										style={pickerSelectStyles}
										value={this.state.country}
									/>
								</Item>
								<Item
									style={{ marginBottom: 25 }}
									error={!this.validateNumber(this.state.phoneNum)}
								>
									<Text style={{ fontSize: 20, marginTop: 5 }}>
										{this.state.dialCode}
									</Text>
									<Input
										placeholder="Phone number"
										autoComplete="tel"
										keyboardType="phone-pad"
										onChangeText={this.onNumberChange}
									/>
								</Item>
								<Button block onPress={this.onSignUpButtonPressed}>
									<Text>Sign Up</Text>
								</Button>
							</Form>
						</Content>
					</ImageBackground>
				</Container>
			</StyleProvider>
		);
	}
}

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		fontFamily: 'Poppins-Regular',
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 0,
		//marginLeft: 0,
		color: 'black',
		paddingRight: 30 // to ensure the text is never behind the icon
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		fontFamily: 'Poppins-Regular',
		paddingVertical: 8,
		borderWidth: 0,

		color: 'black',
		paddingRight: 30 // to ensure the text is never behind the icon
	}
});

export default Signup;
