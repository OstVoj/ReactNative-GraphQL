import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, Modal } from 'react-native';
import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Icon,
	Right,
	Body,
	Grid,
	Col,
	Thumbnail,
	Row,
	Text,
	StyleProvider,
	Spinner,
	Toast,
} from 'native-base';
import { SecureStore } from 'expo';
import { graphql, compose } from 'react-apollo';

import getTheme from '../../native-base-theme/components';

import platform from '../../native-base-theme/variables/platform';
import { GET_PERSON, REQUEST_PAYMENT } from '../../api/person';
import { RequestStatus } from '../../api/requests';
import SuccessComponent from './components/SuccessComponent';

export class Profile extends Component {
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
			uploading: false,
			paymentSuccessModalVisible: false
		}
	}

	_signOutAsync = async () => {
		await SecureStore.deleteItemAsync('userToken');
		this.props.navigation.navigate('Auth');
	};

	onSettingPressed = () => {
		const { navigate } = this.props.navigation;
		if (this.props.data.person) {
			navigate('Settings', { person: this.props.data.person });
		}
	};

	onAddInstagramAccountPressed = () => {
		const { navigate } = this.props.navigation;
		navigate('AddSocialProfile');
	};

	filterRequests = (requests) => {
		const applied = requests.filter(c => c.status === RequestStatus.applied).length;
		const pending = requests.filter(c => [RequestStatus.publish, RequestStatus.submit].includes(c.status)).length;
		const approved = requests.filter(c => c.status === RequestStatus.completed).length;
		return [applied, pending, approved];
	}

	formatPhoneNumber = (phoneNumberString) => {
		const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
		const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{2})(\d{2})$/);
		if (match) {
			const intlCode = (match[1] ? '+1 ' : '');
			return [intlCode, '(', match[2], ') ', match[3], '-', match[4], '-', match[5]].join('');
		}
		return '';
	}

	formatCurrency = (amount) => {
		return amount !== null ? amount.toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&,') : '0';
	}

	renderInstaAccount = (account) => {

		return <Row key={account.id} style={{
			backgroundColor: '#fff',
			height: 92
		}}>
			<Col size={3}
				style={{
					alignItems: 'center',
					justifyContent: 'center'
				}}>
				<Thumbnail style={{
					width: 60,
					height: 60,
					borderRadius: 30
				}}
					source={{
						uri: account.avatar ? account.avatar : ''
					}} />
			</Col>
			<Col size={5}
				style={{
					justifyContent: 'center'
				}}>
				<Row style={{
					alignItems: 'flex-end'
				}}>
					<Text style={{
						fontSize: 18,
						letterSpacing: -0.26
					}}>
						{account.name}
					</Text>
				</Row>
				<Row>
					<Icon name="logo-instagram" />
					<Text style={{
						fontSize: 12,
						letterSpacing: -0.17,
						opacity: 0.5,
						marginLeft: 5,
						marginTop: 5
					}}>
						{account.name}
					</Text>
				</Row>
			</Col>
			<Col size={2}>
				{!account.verified ?
					<>
						<Row />
						<Row>
							<Button style={{
								height: 32,
								width: 72,
								backgroundColor: '#25DCDC',
								alignSelf: 'center',
								alignItems: 'center',
								justifyContent: 'center'
							}}
								onPress={
									() => this.props.navigation.navigate("VerifySocialProfile", { internalAccount: account })
								}	>
								<Text style={{
									fontSize: 12,
									letterSpacing: -0.17
								}}>
									Verify
								</Text>
							</Button>
						</Row>
					</>
					: <>
						<Row>
							<Button transparent style={{
								height: 32,
								width: 72,
								alignSelf: 'center',
								alignItems: 'center',
								justifyContent: 'center'
							}}
								onPress={
									() => this.props.navigation.navigate("AboutYou", { accountId: account.id })
								}>
								<Text style={{
									fontSize: 12,
									letterSpacing: -0.17,
									color: '#2590DC'
								}}>
									Edit
								</Text>
							</Button>
						</Row>
						<Row>
							<Button style={{
								height: 32,
								width: 72,
								backgroundColor: '#2590DC',
								alignSelf: 'center',
								alignItems: 'center',
								justifyContent: 'center'
							}}>
								<Text style={{
									fontSize: 12,
									letterSpacing: -0.17
								}}>
									Report
								</Text>
							</Button>
						</Row>
					</>
				}
			</Col>
		</Row>
	}

	componentDidMount() {
		this._mount = true;
		const didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				if (this.props.data.refetch) {
					this.props.data.refetch();
				}
			}
		);
		this.focusSub = didFocusSubscription
	}

	componentWillUnmount() {
		this._mount = false;
		this.focusSub.remove();
	}

	getPaid = () => {

		if (this.props.data && this.props.data.person && this.props.data.person.balance) {

			const variables = {
				variables: {
					amount: this.props.data.person.balance ? this.props.data.person.balance : 0
				}
			}
			this.setState({ uploading: true, serverErrors: false });
			this.props.requestPayment(variables).then(response => {
				if (!this._mount) return;
				if (response.data
					&& response.data.requestPayment
					&& response.data.requestPayment.id) {
					this.setState({ uploading: false, serverErrors: false, paymentSuccessModalVisible: true });
					this.props.data ? this.props.data.refetch() : () => { };
				} else {
					this.setState({ serverErrors: true, uploading: false });
					Toast.show({
						text: 'Something went wrong, try again later',
						duration: 10000,
						buttonText: 'Ok'
					});
				}
			}).catch(error => {
				console.log('Error while performing request payment: ', error.message);
				if (!this._mount) return;
				this.setState({ serverErrors: true, uploading: false });
				Toast.show({
					text: 'Something went wrong, try again later',
					duration: 10000,
					buttonText: 'Ok'
				});
			})
		} else {
			Toast.show({
				text: 'Insufficient funds or balance is empty, please try again later',
				duration: 10000,
				buttonText: 'Ok'
			});
		}
	}

	render() {
		const { data: { loading, person, error, refetch } } = this.props;
		const [applied, pending, approved] = person && !loading && !error ? this.filterRequests(person.requests) : [0, 0, 0];

		return (
			<StyleProvider style={getTheme(platform)}>
				<Container>

					<Modal
						animationType="slide"
						transparent={true}
						visible={this.state.paymentSuccessModalVisible}
						onRequestClose={() => this.setState({ paymentSuccessModalVisible: false })}
					>
						<Container pinkContainer>
							<SuccessComponent
								onClose={() => this.setState({ paymentSuccessModalVisible: false })}
								messageText='Payment request successful!'
								closeText='Ok' />
						</Container>
					</Modal>

					<Header transparent>
						<Body style={{ flex: 2 }}>
							<Title>My Profile</Title>
						</Body>
						<Right>
							<Button
								transparent
								onPress={this.onSettingPressed}
							>
								<Icon type="SimpleLineIcons" name="settings" />
							</Button>
						</Right>
					</Header>
					<Content padder
						contentContainerStyle={{
							backgroundColor: '#EBF1FD'
						}}
					>
						{!error ? !loading && person ?
							<>
								<Grid>
									<Row
										style={{
											backgroundColor: '#fff',
											height: 112
										}}
									>
										<Col
											size={4}
											style={{
												alignItems: 'center',
												justifyContent: 'center'
											}}
										>
											{person.avatar ?
												<Thumbnail
													style={{
														width: 80,
														height: 80,
														borderRadius: 40
													}}
													source={{
														uri:
															person.avatar ? person.avatar : ''
													}}
												/>
												: <Icon name='account-circle' type='MaterialCommunityIcons' style={{
													width: 80,
													height: 80,
													borderRadius: 40,
													fontSize: 80
												}}></Icon>
											}
										</Col>
										<Col
											size={6}
											style={{
												justifyContent: 'flex-end'
											}}
										>
											<Col
												size={6}
												style={{
													justifyContent: 'flex-end'
												}}
											>
												<Text
													style={{
														fontSize: 24,
														letterSpacing: -0.6
													}}
												>
													{`${person.firstName} ${person.lastName}`}
												</Text>
												<Text
													style={{
														fontSize: 12,
														letterSpacing: -0.17
													}}
												>
													{this.formatPhoneNumber(person.phone)}
												</Text>
											</Col>
											<Row
												size={4}
												style={{
													justifyContent: 'center',
													alignItems: 'center'
												}}
											>
												<Col size={7}>
													<Text
														style={{
															opacity: 0.5,
															fontSize: 12
														}}
													>
														{person.email}
													</Text>
												</Col>
												<Col size={3}>
													<Button
														transparent
														onPress={this._signOutAsync}
													>
														<Icon
															name="power"
															style={{
																color: '#FF0000',
																opacity: 0.5
															}}
														/>
													</Button>
												</Col>
											</Row>
										</Col>
									</Row>
									<Row
										style={{
											backgroundColor: '#fff',
											height: 88,
											marginTop: 1,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Col size={4}>
											<Col
												style={{
													alignItems: 'center',
													justifyContent: 'center'
												}}
											>
												<Text
													style={{
														fontSize: 24,
														color: '#FF0091',
														letterSpacing: -0.34
													}}
												>
													${this.formatCurrency(person.balance)}
												</Text>
												<Text
													style={{
														fontSize: 12,
														letterSpacing: -0.17
													}}
												>
													Available
										</Text>
											</Col>
										</Col>
										<Col size={6}>
											{!this.state.uploading ?
												<Button
													style={{
														width: '100%',
														alignItems: 'center',
														justifyContent: 'center',
														backgroundColor: '#2590DC',
														height: 48
													}}
													onPress={this.getPaid}
												>
													<Text
														style={{
															fontSize: 12,
															letterSpacing: -0.17
														}}
													>
														Get Paid Now
										</Text>
												</Button>
												: <Spinner style={styles.spinner} color='#FF0091' />
											}
										</Col>
									</Row>
									<Row
										style={{
											height: 118
										}}
									>
										<Col
											size={4}
											style={{
												backgroundColor: '#fff',
												marginRight: 1,
												marginTop: 1,
												alignItems: 'center',
												justifyContent: 'center'
											}}
										>
											<Col
												size={4}
												style={{
													alignItems: 'center',
													justifyContent: 'flex-end'
												}}
											>
												<Text
													style={{
														fontSize: 14,
														color: '#FF0091',
														lineHeight: 28
													}}
												>
													EARNINGS
										</Text>
											</Col>
											<Col size={6}>
												<Text
													style={{
														fontSize: 24,
														letterSpacing: -0.34
													}}
												>
													${this.formatCurrency(person.totalEarned)}
												</Text>
												<Text
													style={{
														fontSize: 10,
														letterSpacing: -0.14
													}}
												>
													Total Earned
										</Text>
											</Col>
										</Col>
										<Col
											size={6}
											style={{
												backgroundColor: '#fff',
												marginTop: 1,
												paddingLeft: 30
											}}
										>
											<Col
												size={4}
												style={{
													alignItems: 'flex-start',
													justifyContent: 'flex-end'
												}}
											>
												<Text
													style={{
														fontSize: 14,
														color: '#FF0091',
														lineHeight: 28
													}}
												>
													CAMPAIGNS
										</Text>
											</Col>
											<Row size={6}>
												<Col>
													<Text
														style={{
															fontSize: 24,
															letterSpacing: -0.34
														}}
													>
														{applied}
													</Text>
													<Text
														style={{
															fontSize: 10,
															letterSpacing: -0.14
														}}
													>
														Applied
											</Text>
												</Col>
												<Col>
													<Text
														style={{
															fontSize: 24,
															letterSpacing: -0.34
														}}
													>
														{pending}
													</Text>
													<Text
														style={{
															fontSize: 10,
															letterSpacing: -0.14
														}}
													>
														Pending
											</Text>
												</Col>
												<Col>
													<Text
														style={{
															fontSize: 24,
															letterSpacing: -0.34
														}}
													>
														{approved}
													</Text>
													<Text
														style={{
															fontSize: 10,
															letterSpacing: -0.14
														}}
													>
														Approved
											</Text>
												</Col>
											</Row>
										</Col>
									</Row>
								</Grid>
								<Button
									block
									style={{
										marginTop: 30,
										marginBottom: 10,
										marginLeft: 0,
										marginRight: 0
									}}
									onPress={this.onAddInstagramAccountPressed}
								>
									<Text>+ Add Instagram Account</Text>
								</Button>
								<Grid>
									{person.accounts.map(a => this.renderInstaAccount(a))}
								</Grid>
							</>
							: <Spinner color='#FF0091' />
							: <Text style={styles.errorText}>Network error, please try again later</Text>
						}
					</Content>
				</Container>
			</StyleProvider>
		);
	}
}

const styles = StyleSheet.create({
	errorText: {
		alignSelf: 'center',
		textAlign: 'center',
	}
})

export default compose(
	graphql(GET_PERSON, {
		options: (props) => ({
			notifyOnNetworkStatusChange: true,
			fetchPolicy: 'cache-and-network', //no "cache-and-network", see https://github.com/apollographql/apollo-client/issues/4267
			//pollInterval: 60000
		})
	}),
	graphql(REQUEST_PAYMENT, {
		name: 'requestPayment',
		options: (props) => ({
			notifyOnNetworkStatusChange: true,
			errorPolicy: "all",
			variables: {
				amount: 0
			}
		})
	}),
)(Profile);

