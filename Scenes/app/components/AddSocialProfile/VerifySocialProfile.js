import React, { Component } from 'react';
import { connectStyle } from 'native-base';
import { View, Clipboard, TouchableOpacity, StyleSheet } from 'react-native';
import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Icon,
	Right,
	Body,
	Thumbnail,
	Text,
	Item,
	StyleProvider,
	Form,
	Spinner
} from 'native-base';

import getTheme from '../../../../native-base-theme/components';

import platform from '../../../../native-base-theme/variables/platform';
import { graphql, compose } from 'react-apollo';
import { NetworkStatus } from "apollo-client";
import { ADD_INSTA_ACCOUNT, VERIFY_INSTA_ACCOUNT } from '../../../../api/accounts';

class VerifySocialProfile extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			header: null,
			headerLeft: null,
			headerRight: null
		};
	};

	constructor(props) {
		super(props);
		this.state = {
			verifyState: verifyStates.initial,
			verifyCode: '',
			accountId: ''
		};
		this.verifyBtnText = this.createButtonCaptions();
		this.verifyBtnAction = this.createButtonActions();
	}

	onClosePressed = () => {
		this.props.navigation.goBack();
	}

	onCodePressed = () => {
		Clipboard.setString(this.state.verifyCode);
	}

	onVerifyPressed = () => {
		this.setState({ verifyState: verifyStates.inProgress });
		this.props.verifyAccount({ variables: { id: this.state.accountId } }).then(response => {
			if (response.data.verifyInstagramAccount
				&& response.data.verifyInstagramAccount.verified === true) {
				this.setState({ verifyState: verifyStates.success });
			} else {
				this.setState({ verifyState: verifyStates.error });
			}
		}).catch(error => {
			this.setState({ verifyState: verifyStates.error });
		})
	}

	onNextPressed = () => {
		const { navigate } = this.props.navigation;
		navigate("AboutYou", { accountId: this.state.accountId });
	}

	createButtonCaptions = () => {
		verifyBtnText = {};
		verifyBtnText[verifyStates.inProgress] = 'Verifying...';
		verifyBtnText[verifyStates.success] = 'Next';
		verifyBtnText[verifyStates.error] = 'Verify Again';
		verifyBtnText[verifyStates.initial] = 'Verify';
		verifyBtnText[verifyStates.initialError] = 'Ok';
		return verifyBtnText;
	}

	createButtonActions = () => {
		verifyBtnAction = {}
		verifyBtnAction[verifyStates.inProgress] = () => { };
		verifyBtnAction[verifyStates.success] = this.onNextPressed;
		verifyBtnAction[verifyStates.error] = this.onVerifyPressed;
		verifyBtnAction[verifyStates.initial] = this.onVerifyPressed;
		verifyBtnAction[verifyStates.initialError] = () => this.props.navigation.goBack();
		return verifyBtnAction;
	}

	componentDidMount() {
		const { addAccount } = this.props;
		const instaAccount = this.props.navigation.getParam('instaAccount', {})
		const internalAccount = this.props.navigation.getParam('internalAccount', null)
		if (!internalAccount) {
			this.setState({ verifyState: verifyStates.inProgress })
			addAccount({ variables: { name: instaAccount.profile_id } }).then(response => {
				const { data: { addInstagramAccount } } = response;
				this.setState({
					verifyState: verifyStates.initial,
					verifyCode: addInstagramAccount.verificationToken,
					accountId: addInstagramAccount.id
				})
			}).catch((error) => {
				this.setState({
					verifyState: verifyStates.initialError
				})
			})
		} else {
			this.setState({
				verifyState: verifyStates.initial,
				verifyCode: internalAccount.verificationToken,
				accountId: internalAccount.id
			})
		}
	}

	getContentByState = (state) => {

		switch (state) {
			case verifyStates.initial:
				return (<TouchableOpacity>
					<Text style={styles.verifyCodeText}>
						{this.state.verifyCode}
					</Text>
					<Text style={styles.copyText}>
						Copy to clipboard
								</Text>
				</TouchableOpacity>
				)
			case verifyStates.inProgress:
				return <Spinner color='#A556F6' style={styles.spinner} />
			case verifyStates.success:
				return (<View>
					<Thumbnail
						square success
						source={require("../../../../assets/images/check.png")} />
					<Text style={styles.verifiedText}>Account Verified!</Text>
				</View>)
			case verifyStates.error:
				return (<TouchableOpacity>
					<Text style={styles.verifyRetryText}>
						OOPS! Seems there's a problem verifying your account. Let's try to paste following text in bio and verify again
					</Text>
					<Text style={styles.verifyCodeText}>
						{this.state.verifyCode}
					</Text>
					<Text style={styles.copyText}>
						Copy to clipboard
						</Text>
				</TouchableOpacity>)
			case verifyStates.initialError:
				return (<TouchableOpacity>
					<Text style={styles.verifyRetryText}>
						OOPS! Your account does not seem to be valid for adding or already has been added. Please check that it is not private and not empty
									</Text>
					<Text style={styles.verifyCodeText}>
						{this.state.verifyCode}
					</Text>
				</TouchableOpacity>)
		}
	}

	getButtonByState = (state, data) => {
		return (
			<Button
				style={state === verifyStates.inProgress ?
					styles.verifyButtonInProgress : null}
				onPress={() => this.verifyBtnAction[this.state.verifyState]()}>
				<Text>
					{this.verifyBtnText[this.state.verifyState]}
				</Text>
			</Button>
		)
	}

	render() {
		return (
			<StyleProvider style={getTheme(platform)}>
				<Container pinkContainer>
					<Header transparent>
						<Body style={{ flex: 3 }}>
							<Title >Verify Profile</Title>
						</Body>
						<Right style={{ flex: 1 }}>
							<Button
								transparent
								onPress={this.onClosePressed}
							>
								<Icon name="md-close"
									type="Ionicons" />
							</Button>
						</Right>
					</Header>
					<Content pinkContent>
						<Form>

							<Item style={styles.verifyPrompt}>
								<Text style={styles.verifyText}>
									Copy and paste following text to your bio and press <Text style={styles.verifyTextBold}>verify</Text> button
										</Text>
							</Item>
							<Item style={styles.verifyCodes}
								onPress={this.onCodePressed}>
								{this.getContentByState(this.state.verifyState)}
							</Item>
							<Item pinkActionItem>
								{this.getButtonByState(this.state.verifyState)}
							</Item>
						</Form>
					</Content>
				</Container>
			</StyleProvider>
		);
	}
}

const verifyStates = Object.freeze({
	inProgress: 'progress',
	success: 'success',
	error: 'error',
	initial: 'initial',
	initialError: 'initialError'
})

const styles = StyleSheet.create({
	verifiedText: {
		fontFamily: 'Poppins-Bold',
		fontSize: 18,
		color: '#000000',
		letterSpacing: -0.26,
		textAlign: 'center'
	},
	spinner: {
		height: 164,
		width: 164
	},
	verifyPrompt: {
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		height: 123,
		justifyContent: 'center',
		marginLeft: 0
	},
	verifyCodes: {
		backgroundColor: '#EBF1FD',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		height: 123,
		justifyContent: 'center',
		marginLeft: 0,
		height: 196
	},
	verifyRetryText: {
		fontSize: 12,
		color: '#FF0000',
		letterSpacing: -0.17,
		textAlign: 'center',
		paddingLeft: 60,
		paddingRight: 60
	},
	verifyButtonInProgress: {
		height: 64,
		flex: 1,
		opacity: 0.5,
		backgroundColor: '#EBF1FD',
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	},
	verifyText: {
		fontSize: 18,
		color: '#000000',
		letterSpacing: -0.26,
		textAlign: 'center',
		paddingLeft: 60,
		paddingRight: 60
	},
	verifyTextBold: {
		fontFamily: 'Poppins-Bold',
		fontSize: 18,
		color: '#000000',
		letterSpacing: -0.26,
		fontWeight: '900'
	},
	verifyCodeText: {
		fontFamily: 'Poppins-Bold',
		fontSize: 36,
		color: '#000000',
		letterSpacing: -0.51,
		textAlign: 'center'
	},
	copyText: {
		paddingTop: 16,
		fontSize: 12,
		color: '#A556F6',
		letterSpacing: -0.17,
		textAlign: 'center'
	}
})

export default compose(
	graphql(ADD_INSTA_ACCOUNT, {
		name: 'addAccount',
		options: (props) => ({
			notifyOnNetworkStatusChange: true,
			variables: {
				name: ''
			},
		})
	}),
	graphql(VERIFY_INSTA_ACCOUNT, {
		name: 'verifyAccount',
		options: (props) => ({
			notifyOnNetworkStatusChange: true,
			variables: {
				id: ''
			},
		})
	}))(VerifySocialProfile);

