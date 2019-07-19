import React, { Component } from 'react';
import { Image, StyleSheet, TouchableOpacity, Text, View } from 'react-native';

export class Initial extends Component {
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
	}

	componentDidMount() {}

	onLoginButtonPressed = () => {
		const { navigate } = this.props.navigation;

		navigate('Login');
	};

	onRegisterButtonPressed = () => {
		const { navigate } = this.props.navigation;

		navigate('Signup');
	};

	render() {
		return (
			<View style={styles.introView}>
				<View style={styles.introBackgroundView}>
					<Image
						source={require('./../../assets/images/combined-shape-copy.png')}
						style={styles.combinedShapeCopyImage}
					/>
					<View
						pointerEvents="box-none"
						style={{
							width: '100%',
							height: '100%',
							position: 'absolute'
						}}
					>
						<Image
							source={require('./../../assets/images/bitmap.png')}
							style={styles.bitmapImage}
						/>
					</View>
				</View>
				<View
					pointerEvents="box-none"
					style={{
						width: '100%',
						height: '100%',
						position: 'absolute',
						alignItems: 'center'
					}}
				>
					<Image
						source={require('./../../assets/images/bitmap-2.png')}
						style={styles.bitmapTwoImage}
					/>
					<View
						pointerEvents="box-none"
						style={{
							alignSelf: 'stretch',
							flex: 1,
							justifyContent: 'flex-end'
						}}
					>
						<View
							pointerEvents="box-none"
							style={{
								flexDirection: 'row'
							}}
						>
							<TouchableOpacity
								onPress={this.onLoginButtonPressed}
								style={styles.loginButtonButton}
							>
								<Text style={styles.loginButtonButtonText}>Log in</Text>
							</TouchableOpacity>
							<View
								pointerEvents="box-none"
								style={{
									flex: 1,
									flexDirection: 'row',
									justifyContent: 'flex-end',
									alignItems: 'flex-end'
								}}
							>
								<TouchableOpacity
									onPress={this.onRegisterButtonPressed}
									style={styles.registerButtonButton}
								>
									<Text style={styles.registerButtonButtonText}>Register</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	introView: {
		backgroundColor: 'white',
		flex: 1,
		justifyContent: 'center'
	},
	introBackgroundView: {
		backgroundColor: 'transparent',
		height: 568
	},
	combinedShapeCopyImage: {
		resizeMode: 'cover',
		backgroundColor: 'transparent',
		marginTop: 37,
		height: 531,
		width: null
	},
	bitmapImage: {
		resizeMode: 'cover',
		backgroundColor: 'transparent',
		height: 531,
		width: null
	},
	bitmapTwoImage: {
		backgroundColor: 'transparent',
		marginTop: 71,
		width: 175.5,
		height: 42
	},
	loginButtonButton: {
		backgroundColor: 'rgb(255, 0, 145)',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 0,
		marginLeft: 24,
		marginBottom: 36,
		width: 159,
		height: 64,
		alignSelf: 'flex-end'
	},
	loginButtonButtonText: {
		color: 'white',
		fontFamily: 'Poppins-Bold',
		fontSize: 18,
		fontStyle: 'normal',
		fontWeight: 'bold',
		textAlign: 'center'
	},
	loginButtonButtonImage: {
		resizeMode: 'contain',
		marginRight: 10
	},
	registerButtonButton: {
		backgroundColor: 'white',
		borderWidth: 2,
		borderColor: 'rgb(255, 0, 145)',
		borderStyle: 'solid',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 0,
		marginRight: 24,
		marginBottom: 36,
		width: 159,
		height: 64
	},
	registerButtonButtonText: {
		color: 'rgb(255, 0, 145)',
		fontFamily: 'Poppins-Bold',
		fontSize: 18,
		fontStyle: 'normal',
		fontWeight: 'bold',
		textAlign: 'center'
	},
	registerButtonButtonImage: {
		resizeMode: 'contain',
		marginRight: 10
	}
});

export default Initial;
