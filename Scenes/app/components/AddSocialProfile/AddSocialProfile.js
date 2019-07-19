import React, { Component } from 'react';
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
	Input,
	StyleProvider,
	Card,
	CardItem,
	connectStyle,
	Spinner
} from 'native-base';

import getTheme from '../../../../native-base-theme/components';

import platform from '../../../../native-base-theme/variables/platform';
import { GET_INSTA_ACCOUNT } from '../../../../api/accounts';
import { graphql } from 'react-apollo';
import { NetworkStatus } from "apollo-client";

class AddSocialProfile extends Component {
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
			searchText: '',
			searchResult: false
		};

	}

	onClosePressed = () => {
		this.props.navigation.goBack(null); //null for parent navigator
	}

	onChangeSearchText = (text) => {
		this.setState({ searchText: text, searchResult: false });
	}

	onSearchInsta = (text) => {
		this.setState({ searchResult: true })
		if (this.testUsername(text.trim())) {
			this.props.data.refetch({ name: text.trim() });
		}
	}

	onAddPressed = (item) => {
		const { navigate } = this.props.navigation;
		navigate("VerifySocialProfile", { instaAccount: item });
	}

	testUsername = (username) => {
		let pattern = /^[a-zA-Z0-9._]+$/;
		return pattern.test(username);
	}

	renderInstaAccount = (item) => {
		return <Card key={item.id} profileCard>
			<CardItem>
				<Thumbnail
					style={styles.instaThumb}
					source={{ uri: item.profile_pic ? item.profile_pic : 'https://picsum.photos/300/300/?random' }}
				/>
			</CardItem>
			<CardItem center>
				<Text style={styles.instaName}>
					{item.profile_name}
				</Text>
				<CardItem socialprofile insta>
					<Icon name="logo-instagram" />
					<Text>
						{item.profile_id}
					</Text>
				</CardItem>
			</CardItem>
			<CardItem socialprofile button>
				<Button
					onPress={() => this.onAddPressed(item)} >
					<Text>
						Add
				</Text>
				</Button>
			</CardItem>
		</Card>
	}

	render() {
		const styles = this.props.style;
		const { data: { loading, getInstagramAccount, error, refetch, networkStatus } } = this.props;
		const isReady = (networkStatus !== NetworkStatus.ready) || loading;
		return (
			<StyleProvider style={getTheme(platform)}>
				<Container pinkContainer>
					<Header transparent>
						<Body style={{ flex: 3 }}>
							<Title>Add Profile</Title>
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
					<Content
						contentContainerStyle={{ backgroundColor: '#EBF1FD' }}
						padded
					>
						<Item searchBar>
							<Item>
								<Input socialprofile placeholder="type instagram username"
									onChangeText={this.onChangeSearchText}
								/>
								<Button transparent
									onPress={() => this.onSearchInsta(this.state.searchText)}>
									<Icon name="search" />
								</Button>
							</Item>
						</Item>

						{!isReady ?
							!error && getInstagramAccount
								&& this.state.searchText && this.state.searchResult
								&& this.testUsername(this.state.searchText.trim()) ?
								this.renderInstaAccount(getInstagramAccount)
								: this.state.searchText
									&& this.state.searchResult ?

									<Card profileCard style={styles.errorCard}>
										<Text style={styles.errorText}>No results found</Text>
									</Card>
									:

									null
							: <Spinner style={styles.spinner} color='#FF0091' />
						}

					</Content>
				</Container>
			</StyleProvider>
		);
	}
}

const styles = {
	spinner: {
		flex: 1
	},
	errorCard: {
		borderWidth: 1,
		borderColor: 'red',
		justifyContent: 'center'
	},
	errorText: {
		alignSelf: 'center',
		textAlign: 'center',
		borderWidth: 1,
		borderColor: 'red'
	},
	spinner: {
		flex: 1
	},
	instaText: {
		fontSize: 12,
		letterSpacing: -0.17,
		opacity: 0.5,
		marginLeft: 5,
		marginTop: 5
	},
	instaName: {
		fontFamily: 'Poppins-Bold',
		fontSize: 18,
		letterSpacing: -0.26
	},
	instaThumb: {
		width: 60,
		height: 60,
		borderRadius: 30
	}
};

export default graphql(GET_INSTA_ACCOUNT, {
	options: (props) => ({
		notifyOnNetworkStatusChange: true,
		fetchPolicy: "cache-and-network",
		variables: {
			name: ' '
		},
	})
})(connectStyle('AddSocialProfile', styles)(AddSocialProfile));
