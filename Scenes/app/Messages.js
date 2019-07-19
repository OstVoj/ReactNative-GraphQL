import React, { Component } from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Icon,
	Left,
	Right,
	Body,
	Grid,
	Col,
	H2,
	H3,
	Thumbnail,
	Row,
	Text,
	Card,
	CardItem,
	StyleProvider,
	Badge,
	Spinner,
	Item,
	Input
} from 'native-base';
import { graphql } from 'react-apollo';
import { GET_ALL_MSG, GET_CAMPAIGN_MEDIA, GET_UNREAD_BY_CAMPAIGN } from '../../api/messages';

import getTheme from '../../native-base-theme/components';
import platform from '../../native-base-theme/variables/platform';
import EmptyMessages from './emptyScenes/EmptyMessages';
import withApolloQuery from './components/withApolloQuery';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import memoize from 'memoize-one';
import { NativeModules, LayoutAnimation, TouchableOpacity } from 'react-native';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
	UIManager.setLayoutAnimationEnabledExperimental(true);

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en)

const CampaignIcon = withApolloQuery(Thumbnail, {
	query: GET_CAMPAIGN_MEDIA,
	variables: (props) => ({ id: props.campaignId }),
	dataToProps: ({ data: { campaign } }, props) => {
		const media = campaign ? campaign.media.find(i => i.mediaType == 'image') : undefined;
		return { ...props, ...{ source: { uri: media ? media.thumbnail : "https://picsum.photos/300/300/?random" } } }
	}
})

export class Messages extends Component {
	thumbScale = 'large';

	CampaignUnreadBadge = withApolloQuery((props) =>
		props.count ?
			<Badge style={styles.badge}>
				<Text>{props.count}</Text>
			</Badge> : null, {
			query: GET_UNREAD_BY_CAMPAIGN,
			poll: 30000,
			variables: (props) => ({ id: props.campaignId }),
			dataToProps: ({ data: { unreadMessagesByCampaign }, refetch }, props) => {
				this.refetchBadge = refetch;
				return { ...props, ...{ count: unreadMessagesByCampaign } }
			}
		})

	static navigationOptions = ({ navigation }) => {
		return {
			header: null,
			headerLeft: null,
			headerRight: null
		};
	};

	constructor(props) {
		super(props);
		this.timeAgo = new TimeAgo('en-US');
		this.state = {
			memoizedMessages: undefined,
			searchVisible: false,
			searchText: ''
		};
	}

	onMessagePressed = (campaignId, title) => {
		const { navigate } = this.props.navigation;
		navigate('MessageDialog', { id: campaignId, title: title });
	};

	reload = async refetch => {
		try {
			await refetch()
		} catch (err) {
			console.log('[Messages] Reloading unsuccessful')
		}
	}

	getLastMessagesByCampaignMemoized = memoize(
		(messages) => this.getLastMessagesByCampaign(messages)
	)

	getLastMessagesByCampaign = (messages) => {
		const messagesByCampaign = messages.reduce((acc, i) => {
			if (i.message.messageType == 'text') {
				if (acc.has(i.campaign.id)) {
					const msg = acc.get(i.campaign.id);
					if (parseInt(msg.createdAt) < parseInt(i.createdAt))
						acc.set(i.campaign.id, i);
				} else {
					acc.set(i.campaign.id, i);
				}
			}
			return acc;
		}, new Map())
		return Array.from(messagesByCampaign.values()).sort((a, b) => parseInt(b.createdAt) - parseInt(a.createdAt));
	}

	renderMessageItem = ({ item }) => {
		const { message, campaign } = item
		const date = parseInt(item.createdAt);
		const postDate = this.timeAgo.format(date);
		return (
			<Card key={message.id} style={styles.card}>
				<CardItem button messages onPress={() => this.onMessagePressed(campaign.id, campaign.title)}>
					<CampaignIcon large campaignId={campaign.id} />

					<Grid
						style={{ marginLeft: 15 }}>
						<Row style={{ justifyContent: 'space-between' }}>
							<Text style={styles.name}>{campaign.title}</Text>
							<Text style={styles.time}>{postDate}</Text>
						</Row>
						<Row style={styles.msg}>
							<Col size={5}>
								<Text
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.content}>{message.content}</Text>
							</Col>
							<Col size={1} style={styles.badgeCol}>
								<this.CampaignUnreadBadge campaignId={campaign.id} />
							</Col>
						</Row>

					</Grid>
				</CardItem>
			</Card>
		)
	}

	static getDerivedStateFromProps = (props, state) => {
		if (!props.data.loading && !props.data.error) {
			return { memoizedMessages: props.data.messages }
		} else
			return null
	}

	toggleSearch = () => {
		LayoutAnimation.linear();
		this.setState({ searchVisible: !this.state.searchVisible })
	}

	onSearchTextChanged = (text) => {
		LayoutAnimation.linear();
		this.setState({ searchText: text });
	}

	filterMessages = (messages) => {
		const search = this.state.searchText.toLowerCase();
		return messages ? messages.filter(m =>
			search ? m.campaign.title.toLowerCase().includes(search)
				: true)
			: null
	}

	componentDidMount() {
		const didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				if (this.refetchBadge) {
					this.refetchBadge();
				}
				if (this.props.data.refetch) {
					this.props.data.refetch();
				}
			}
		);
		this.focusSub = didFocusSubscription;
	}

	componentWillUnmount() {
		this.focusSub.remove();
	}

	render() {
		const { data: { loading, messages, error, refetch } } = this.props;
		const { searchVisible } = this.state;
		if (error) {
			return (
				<EmptyMessages reload={() => this.reload(refetch)} />
			);
		} else
			if ((!loading && !messages) || (messages && messages.length < 1)) {
				return (
					<EmptyMessages reload={() => this.reload(refetch)} />
				);
			}
			else return (
				<StyleProvider style={getTheme(platform)}>
					<Container>
						<Header transparent>
							<Body style={{ flex: 0.8 }}>
								{searchVisible ?
									<Item style={{ marginRight: 20 }}>
										<Input placeholder="search"
											value={this.state.searchText}
											onChangeText={this.onSearchTextChanged} />
										<Button transparent style={styles.clearSearchButton}
											onPress={() => this.setState({ searchText: '' })}>
											<Icon style={{ color: 'black', }} name='ios-close'></Icon>
										</Button>
									</Item>
									: <Title>Messages</Title>}
							</Body>

							<Right style={{ flex: 0.2 }} >
								<Button transparent onPress={this.toggleSearch}>
									<Icon name="search" style={{ color: this.state.searchText ? platform.brandPrimary : 'black' }} />
								</Button>
							</Right>
						</Header>

						<Content
							style={{
								backgroundColor: '#EBF1FD'
							}}>
							{!error ? !loading && messages ?
								<FlatList
									showsVerticalScrollIndicator={false}
									data={this.filterMessages(this.getLastMessagesByCampaignMemoized(messages))}
									renderItem={this.renderMessageItem}
									keyExtractor={(item, index) => item.id}
								/>
								: this.state.memoizedMessages ? <FlatList
									showsVerticalScrollIndicator={false}
									data={this.filterMessages(this.getLastMessagesByCampaignMemoized(this.state.memoizedMessages))}
									renderItem={this.renderMessageItem}
									keyExtractor={(item, index) => item.id}
								/>
									: <Spinner style={styles.spinner} color='#FF0091' />
								: <Text style={styles.errorText}>Network error, please try again later</Text>
							}
						</Content>
					</Container>
				</StyleProvider>
			);
	}
}

const styles = StyleSheet.create({
	clearSearchButton: {
		height: 40,
		width: 40,
		alignSelf: 'center'
	},
	errorText: {
		alignSelf: 'center',
		textAlign: 'center',
	},
	badge: {
		alignSelf: 'flex-end'
	},
	badgeCol: {
		justifyContent: 'center'
	},
	container: {
		flex: 1
	},
	name: {
		fontFamily: 'Poppins-Bold',
		fontSize: 17,
	},
	content: {
		fontFamily: 'Poppins-Regular',
		fontSize: 14,
		color: '#808080',
		letterSpacing: -0.2,
	},
	time: {
		width: 70,
		fontSize: 13,
		textAlign: 'right',
		letterSpacing: -0.2,
		color: '#b2b2b2'
	},
	card: {
		marginBottom: 0.1
	},
	msg: {
		marginTop: 3,
		justifyContent: 'flex-start'
	}

})
export default graphql(GET_ALL_MSG, {
	options: (props) => ({
		pollInterval: 60000,
		notifyOnNetworkStatusChange: true,
		fetchPolicy: "cache-and-network",
		pollInterval: 60000
	})
})(Messages);
