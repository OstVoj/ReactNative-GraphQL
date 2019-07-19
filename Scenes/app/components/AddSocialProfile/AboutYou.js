import React, { Component } from 'react';
import { connectStyle } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Icon,
	Right,
	Body,
	Text,
	Item,
	Input,
	StyleProvider,
	Form,
	Textarea,
	Switch,
	Left,
	Spinner
} from 'native-base';

import getTheme from '../../../../native-base-theme/components';
import TagSelector from '../TagSelector';
import RadioGroup from '../RadioGroup';
import RangeControl from '../RangeControl';

import platform from '../../../../native-base-theme/variables/platform';
import { GET_CATEGORIES, EDIT_INSTA_ACCOUNT, GET_ACCOUNT_INFO } from '../../../../api/accounts';
import { graphql, compose } from 'react-apollo';

const deviceWidth = Dimensions.get("window").width;

class AboutYou extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			header: null,
			headerLeft: null,
			headerRight: null
		};
	};

	radioChoices = ['Yes', 'No', 'Sometimes']

	constructor(props) {
		super(props);
		this.state = {
			initialized: false,
			uploading: false,
			aboutText: '',
			age: '',
			selectedTags: [],
			priceRange: { min: 0, max: 200 },
			linkCharge: false,
			multiplePostDiscount: false,
			productForPostChoice: '',
			contentRate: '',
			storyViews: '',
			workWithBrands: false,
			instaBrandName: '',
			adRate: { min: 0, max: 200 },
			submitted: false,
			bioLinkRate: '',
			inputErrors: false,
			serverErrors: false
		};
	}

	static getDerivedStateFromProps = (props, state) => {
		if (!state.initialized) {
			if (!props.data.loading && !props.data.error && props.data.account) {
				const { account } = props.data;
				return {
					initialized: true,
					aboutText: account.about ? account.about : '',
					age: account.age ? account.age.toString() : '',
					selectedTags: account.categories.map(c => c.id),
					priceRange: {
						min: account.postPrice.min ? account.postPrice.min : 0,
						max: account.postPrice.max ? account.postPrice.max : 200
					},
					linkCharge: account.linkBio.accept,
					multiplePostDiscount: account.bulkDiscount,
					productForPostChoice: account.productReady ? account.productReady : '',
					contentRate: account.contentCreation ? account.contentCreation.toString() : '',
					storyViews: account.storyViews ? account.storyViews.toString() : '',
					workWithBrands: account.otherBrands.status,
					instaBrandName: account.otherBrands.brands ? account.otherBrands.brands : '',
					adRate: {
						min: account.storyPrice.min ? account.storyPrice.min : 0,
						max: account.storyPrice.max ? account.storyPrice.max : 200
					},
					bioLinkRate: account.linkBio.price ? account.linkBio.price.toString() : '',
				}
			} else {
				return null
			}
		} else return null
	}

	testInstaUsername = (username) => {
		let pattern = /^@[a-zA-Z0-9._]+$/;
		return pattern.test(username);
	}

	validateInput = (type, value) => {
		switch (type) {
			case fieldType.insta:
				return this.testInstaUsername(value) ? true : false;
			case fieldType.text:
				return value ? true : false;
			case fieldType.number:
				return value > 0 ? true : false;
			case fieldType.range:
				return (value.min >= 0 && value.max > 0) ? true : false;
			case fieldType.tags:
				return value.length > 0 ? true : false;
			default:
				return value ? true : false;
		}
	}

	onSubmit = () => {
		const valid =
			this.validateInput(fieldType.text, this.state.aboutText) &&
			this.validateInput(fieldType.number, parseInt(this.state.age)) &&
			this.validateInput(fieldType.tags, this.state.selectedTags) &&
			this.validateInput(fieldType.range, this.state.priceRange) &&
			this.validateInput(fieldType.text, this.state.productForPostChoice) &&
			this.validateInput(fieldType.number, parseInt(this.state.contentRate)) &&
			this.validateInput(fieldType.number, parseInt(this.state.storyViews)) &&
			this.validateInput(fieldType.range, this.state.adRate) &&
			this.validateInput(fieldType.text, this.state.aboutText) &&
			(this.state.linkCharge ? this.validateInput(fieldType.number, parseInt(this.state.bioLinkRate)) : true) &&
			(this.state.workWithBrands ? this.validateInput(fieldType.text, this.state.instaBrandName) : true);

		if (valid) {
			this.setState({ uploading: true, inputErrors: !valid });
			const variables = {
				variables: {
					id: this.props.navigation.getParam('accountId', ''),
					postPriceMin: this.state.priceRange.min,
					postPriceMax: this.state.priceRange.max,
					storyPriceMin: this.state.adRate.min,
					storyPriceMax: this.state.adRate.max,
					storyViews: parseInt(this.state.storyViews),
					linkBio: this.state.linkCharge,
					linkBioPrice: parseInt(this.state.bioLinkRate),
					bulkDiscount: this.state.multiplePostDiscount,
					productReady: this.state.productForPostChoice,
					contentCreation: parseInt(this.state.contentRate),
					about: this.state.aboutText,
					age: parseInt(this.state.age),
					categories: this.state.selectedTags,
					otherBrands: this.state.workWithBrands,
					brandsList: this.state.instaBrandName
				}
			}
			this.props.editAccount(variables).then(response => {
				if (response.data
					&& response.data.editInstagramAccount
					&& response.data.editInstagramAccount.id) {
					this.setState({ uploading: false, serverErrors: false, })
					this.props.navigation.navigate('AddSuccess');
				} else {
					this.setState({ submitted: true, serverErrors: true, uploading: false })
				}
			}).catch(error => {
				this.setState({ submitted: true, serverErrors: true, uploading: false })
			})
		} else {
			this.setState({ submitted: true })
			this.setState({ inputErrors: !valid })
		}
	}

	onTagSelected = (key) => {
		if (this.state.tags.includes(key))
			this.setState({ tags: this.state.tags.filter((i) => i !== key) })
		else
			this.setState({ tags: [...this.state.tags, key] });
	}

	onAvgPriceChange = (range) => {
		this.setState({ priceRange: range })
	}

	onAdRateChange = (range) => {
		this.setState({ adRate: range })
	}

	onAgeChange = (text) => {
		this.setState({ age: text })
	}

	onAboutChanged = (text) => {
		this.setState({ aboutText: text })
	}

	onClosePressed = () => {
		this.props.navigation.goBack();
	}

	onChangeTags = (key) => {
		const selectedTags = this.state.selectedTags.includes(key) ?
			this.state.selectedTags.filter((i) => i !== key)
			: [...this.state.selectedTags, key];
		this.setState({ selectedTags: selectedTags });
	}

	onChangeRadioGroup = (v) => {
		this.setState({ productForPostChoice: v });
	}

	render() {
		const priceRange = this.state.priceRange;
		const priceText = `$ ${priceRange.min} - ${priceRange.max}`;
		const adRate = this.state.adRate;
		const storyPriceText = `$ ${adRate.min} - ${adRate.max}`;
		const { data: { loading, categories, error, refetch, networkStatus } } = this.props;

		return (
			<StyleProvider style={getTheme(platform)}>
				<Container pinkContainer>
					<Header transparent>
						<Body style={{ flex: 3 }}>
							<Title >About You</Title>
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
							{loading ? <Spinner style={styles.spinner} color='#FFFFFF' /> : null}
							{this.state.inputErrors ?
								<Item style={styles.card}>
									<Item style={[styles.inputItem, styles.noborder]}>
										<Text style={styles.errorCaptionText}>
											We need some more info!
											Please fill the forms marked red
											and try to sumbit again
									</Text>
									</Item>
								</Item> : null
							}

							{this.state.serverErrors ?
								<Item style={styles.card}>
									<Item style={[styles.inputItem, styles.noborder]}>
										<Text style={styles.errorCaptionText}>
											Oops! Some info you provided is invalid.
											Please check it and try to submit again
									</Text>
									</Item>
								</Item> : null
							}

							<Item searchbar style={styles.card}>
								<Item style={styles.inputItem}>
									<Text style={styles.cardCaptionText}>
										Please fill out a little questionnaire before we go
								</Text>
								</Item>
								<Item style={styles.inputItem}>
									<Textarea
										style={this.validateInput(fieldType.text, this.state.aboutText) || !this.state.submitted ? styles.textArea : styles.textAreaError}
										underline rowSpan={3} onChangeText={this.onAboutChanged}
										value={this.state.aboutText}
										placeholderTextColor={this.validateInput(fieldType.text, this.state.aboutText) || !this.state.submitted ? '#b2b2b2' : '#FF0000'}
										placeholder='Tell us a little about yourself ( Are you a mom, do you go to school, favorite ice cream, be creative! )' />
								</Item>
								<Item style={[styles.inputItem, styles.noborder]}>
									<Item style={[styles.inputItem,
									this.validateInput(fieldType.text, this.state.age) || !this.state.submitted ?
										styles.inputUnderline : styles.inputUnderlineError
										, styles.nopadding]}
									>
										<Left style={[styles.leftCaption, { flex: 3.5 }]}>
											<Text style={styles.regularCaptionText}>Your Age</Text>
										</Left>
										<Right style={styles.rowDirection}>
											<Input style={styles.coloredInput} onChangeText={this.onAgeChange}
												placeholder='0'
												value={this.state.age}
												placeholderTextColor="#FF0091"
											/>

											<Icon name='keyboard-arrow-right' type='MaterialIcons' />
										</Right>
									</Item>
								</Item>
							</Item>

							<Item style={styles.card}>
								<Item style={[styles.inputItem, styles.noborder, { flexDirection: 'column', alignItems: 'flex-start' }]}>
									<Text style={styles.pinkCaptionText}>
										VERTICAL
								</Text>
									<Text style={[styles.verticalsText, this.validateInput(fieldType.tags, this.state.selectedTags) || !this.state.submitted ?
										{} : { color: '#FF0000' }]}>
										Select up to 5 verticals that best describe your profile:
								</Text>
									<Item style={styles.noborder}>
										{!loading && !error && categories ?
											<TagSelector
												maxHeight={70}
												tags={categories}
												tagsSelected={this.state.selectedTags}
												onChange={this.onChangeTags} />
											: <Spinner style={styles.spinner} color='#FF0091' />
										}
									</Item>
								</Item>
							</Item>

							<Item style={styles.card}>
								<Item style={[styles.inputItem, styles.noborder]}>
									<Item style={[styles.inputItem, styles.inputUnderline, styles.nopadding]}>
										<Left style={[styles.leftCaption, { flex: 1 }]}>
											<Text style={styles.regularCaptionText}>
												Avg Price Per Post
										</Text>
										</Left>
										<Right style={styles.rowDirection}>
											<Input style={styles.coloredInput}
												disabled
												placeholder='$2500-5000'
												placeholderTextColor="#FF0091"
												value={priceText}
											/>
											<Icon name='keyboard-arrow-right' type='MaterialIcons' />
										</Right>
									</Item>
								</Item>
								<Item style={styles.inputItem}>
									<RangeControl
										onChange={this.onAvgPriceChange}
										width={deviceWidth - 80}
										range={this.state.priceRange}
										bounds={[0, 5000]}
									/>
								</Item>
								<Text style={styles.priceNoteText}>
									Your price won't be displayed to brands, but your price will allow brands to filter you when sending invite for campaign
									</Text>
								<Item style={styles.inputItem}>
									<Left style={styles.leftCaption}>
										<Text style={styles.boldInputText}
										>
											Do you charge additional rate for link in bio?</Text>
									</Left>
									<Right>
										<Switch
											onValueChange={val => this.setState({ linkCharge: val })}
											trackColor={{ true: "#FF0091" }}
											value={this.state.linkCharge}
										/>
									</Right>
								</Item>
								<Item style={styles.inputItem}>
									<Left style={styles.leftCaption}>
										<Text style={[
											!this.state.linkCharge || this.validateInput(fieldType.text, this.state.bioLinkRate) || !this.state.submitted ?
												styles.boldInputText : styles.boldInputTextError,
											!this.state.linkCharge && styles.disabledText]}
										>
											How much</Text></Left>
									<Right>
										<Item style={!this.state.linkCharge || this.validateInput(fieldType.text, this.state.bioLinkRate) || !this.state.submitted ?
											styles.inputUnderline : styles.inputUnderlineError}>
											<Input
												disabled={!this.state.linkCharge ? true : false}
												keyboardType="numeric"
												style={styles.inputDefault}
												value={this.state.bioLinkRate}
												onChangeText={val => this.setState({ bioLinkRate: val })}
												placeholder='0'></Input>
											<Text style={styles.currency}>$</Text>
										</Item>
									</Right>
								</Item>
								<Item style={styles.inputItem}>
									<Left style={styles.leftCaption}>
										<Text style={styles.boldInputText}>Do you offer discounts for multiple posts</Text>
									</Left>
									<Right>
										<Switch
											onValueChange={val => this.setState({ multiplePostDiscount: val })}
											trackColor={{ true: "#FF0091" }}
											value={this.state.multiplePostDiscount}
										/>
									</Right>
								</Item>

								<Item style={[styles.inputItem, styles.noborder]}>
									<Left style={styles.leftCaption}>
										<Text style={this.validateInput(fieldType.text, this.state.productForPostChoice) || !this.state.submitted ?
											styles.boldInputText : styles.boldInputTextError}>
											Are you willing to accept product for post?</Text>
									</Left>

								</Item>

								<Item style={styles.inputItem}>
									<RadioGroup
										radioChoice={this.state.productForPostChoice}
										radioChoices={this.radioChoices}
										onChange={this.onChangeRadioGroup}
									/>
								</Item>

								<Item style={styles.inputItem}>
									<Left style={styles.leftCaption}>
										<Text
											style={this.validateInput(fieldType.text, this.state.contentRate) || !this.state.submitted ?
												styles.boldInputText : styles.boldInputTextError}
										>
											Creating Content Rate</Text>
									</Left>
									<Right>
										<Item
											style={this.validateInput(fieldType.text, this.state.contentRate) || !this.state.submitted ?
												styles.inputUnderline : styles.inputUnderlineError}>
											<Input
												keyboardType="numeric"
												style={styles.inputDefault}
												value={this.state.contentRate}
												onChangeText={(text) => this.setState({ contentRate: text })}
												placeholder='0'></Input>
											<Text style={styles.currency}>$</Text>
										</Item>
									</Right>
								</Item>

								<Item style={[styles.inputItem, styles.noborder]}>
									<Item style={[styles.inputItem, styles.inputUnderline, styles.nopadding]}>
										<Left style={[styles.leftCaption, { flex: 1 }]}>
											<Text style={styles.regularCaptionText}>
												Story Ad Rate
										</Text>
										</Left>
										<Right style={styles.rowDirection}>
											<Input style={styles.coloredInput}
												disabled
												placeholder='$2500-5000'
												placeholderTextColor="#FF0091"
												value={storyPriceText}
											/>
											<Icon name='keyboard-arrow-right' type='MaterialIcons' />
										</Right>
									</Item>
								</Item>
								<Item style={styles.inputItem}>
									<RangeControl
										onChange={this.onAdRateChange}
										width={deviceWidth - 80}
										range={this.state.adRate}
										bounds={[0, 5000]}
									/>
								</Item>

								<Item style={styles.inputItem}>
									<Left style={styles.leftCaption}>
										<Text
											style={this.validateInput(fieldType.text, this.state.storyViews) || !this.state.submitted ?
												styles.boldInputText : styles.boldInputTextError}
										>
											Average Story Views</Text>
									</Left>
									<Right>
										<Item
											style={this.validateInput(fieldType.text, this.state.storyViews) || !this.state.submitted ?
												styles.inputUnderline : styles.inputUnderlineError}
										>
											<Input
												keyboardType="numeric"
												style={styles.inputDefault}
												value={this.state.storyViews}
												onChangeText={(text) => this.setState({ storyViews: text })}
												placeholder='0'></Input>
										</Item>
									</Right>
								</Item>

								<Item style={styles.inputItem}>
									<Left style={styles.leftCaption}>
										<Text style={styles.boldInputText}>Did you work with any brands?</Text>
									</Left>
									<Right>
										<Switch
											onValueChange={val => this.setState({ workWithBrands: val })}
											trackColor={{ true: "#FF0091" }}
											value={this.state.workWithBrands}
										/>
									</Right>
								</Item>
								<Item style={[styles.inputItem, styles.noborder]}>
									<Textarea
										style={!this.state.workWithBrands || this.validateInput(fieldType.text, this.state.instaBrandName)
											|| !this.state.submitted ?
											styles.textArea
											: styles.textAreaError}
										disabled={!this.state.workWithBrands ? true : false}
										underline rowSpan={3}
										value={this.state.instaBrandName}
										onChangeText={(text) => this.setState({ instaBrandName: text })}
										placeholder='@InstagramUsername of brand'
										placeholderTextColor={!this.state.workWithBrands || this.validateInput(fieldType.text, this.state.instaBrandName) || !this.state.submitted ? '#b2b2b2' : '#FF0000'}
									/>

								</Item>
							</Item>
							<Item pinkActionItem>
								{!this.state.uploading ?
									<Button onPress={this.onSubmit}><Text>Submit</Text></Button>
									: <Spinner style={styles.spinner} color='#FF0091' />
								}
							</Item>
							<Text></Text>
						</Form>
					</Content>
				</Container>
			</StyleProvider>
		);
	}
}

fieldType = Object.freeze({
	text: 'text',
	number: 'number',
	range: 'range',
	tags: 'tags'
})

const styles = StyleSheet.create({
	spinner: {
		flex: 1
	},
	disabledText: {
		color: '#b2b2b2'
	},
	rowDirection: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	textArea: {
		flex: 1,
		color: '#000000',
		borderBottomColor: '#000000',
		fontSize: 14
	},
	textAreaError: {
		flex: 1,
		color: '#FF0000',
		borderBottomColor: '#FF0000',
		fontSize: 14
	},
	regularCaptionText: {
		fontSize: 14,
		alignSelf: 'flex-start',
		color: '#000000',
		letterSpacing: -0.2,
	},
	inputUnderline: {
		borderBottomColor: "#000000"
	},
	inputUnderlineError: {
		borderBottomColor: "#FF0000"
	},
	currency: {
		fontSize: 14,
		color: "#FF0091"
	},
	coloredInput: {
		fontSize: 14,
		color: "#FF0091",
	},
	leftCaption: {
		flex: 3
	},
	errorInput: {
		borderBottomColor: "#FF0000"
	},
	inputItem: {
		flex: 1,
		marginLeft: 0,
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'flex-start'
	},
	noborder: {
		borderBottomWidth: 0
	},
	nopadding: {
		padding: 0
	},
	paddedLeft: {
		paddingLeft: 8
	},
	inputRight: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	boldInputText: {
		fontFamily: 'Poppins-Bold',
		fontSize: 14,
		color: '#000000',
		letterSpacing: -0.2
	},
	boldInputTextError: {
		fontFamily: 'Poppins-Bold',
		fontSize: 14,
		color: '#FF0000',
		letterSpacing: -0.2
	},
	inputDefault: {
		fontSize: 14,
	},
	priceNoteText: {
		backgroundColor: '#EBF1FD',
		fontSize: 12,
		color: '#000000',
		letterSpacing: -0.22,
		margin: 10,
		padding: 20
	},
	card: {
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		marginLeft: 0,
		marginTop: 4
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
	verticalsText: {
		fontSize: 14,
		color: '#000000',
		letterSpacing: -0.2,
		paddingRight: 120,
		paddingBottom: 10
	},
	cardCaptionText: {
		flex: 1,
		fontFamily: 'Poppins-Bold',
		fontSize: 18,
		color: '#000000',
		letterSpacing: -0.26,
		textAlign: 'center',
		paddingLeft: 30,
		paddingRight: 30
	},
	errorCaptionText: {
		fontFamily: 'Poppins-Bold',
		fontSize: 12,
		color: '#FF0000',
		letterSpacing: -0.17,
		textAlign: 'center',
		paddingLeft: 60,
		paddingRight: 60
	},
	pinkCaptionText: {
		fontFamily: 'Poppins-Bold',
		fontSize: 14,
		color: '#FF0091',
		letterSpacing: 0,
		textAlign: 'left',
		alignSelf: 'flex-start',
		lineHeight: 28,
		paddingBottom: 10
	}
})

export default compose(
	graphql(GET_ACCOUNT_INFO, {
		options: (props) => ({
			notifyOnNetworkStatusChange: true,
			fetchPolicy: "cache-and-network",
			variables: {
				id: props.navigation.getParam('accountId', '')
			}
		})
	}),
	graphql(EDIT_INSTA_ACCOUNT, {
		name: 'editAccount',
		options: (props) => ({
			notifyOnNetworkStatusChange: true,
			variables: {
				id: '',
				postPriceMin: 0,
				postPriceMax: 0,
				storyPriceMin: 0,
				storyPriceMax: 0,
				storyViews: 0,
				linkBio: false,
				linkBioPrice: 0,
				bulkDiscount: false,
				productReady: '',
				contentCreation: 0,
				about: '',
				age: 0,
				categories: [''],
				otherBrands: ''
			},
		})
	}))(AboutYou);

