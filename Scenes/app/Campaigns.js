import React, { Component } from 'react';
import { View, Image, StyleSheet, FlatList } from 'react-native';
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
	Card,
	CardItem,
	StyleProvider,
	Spinner,
	Item,
	Input,
	ListItem,
	List
} from 'native-base';

import _ from 'lodash';
import { NativeModules, LayoutAnimation, TouchableOpacity, ScrollView } from 'react-native';

import getTheme from '../../native-base-theme/components';
import platform from '../../native-base-theme/variables/platform';
import { graphql } from 'react-apollo';
import { GET_CAMPAIGNS, GET_CAMPAIGNS_FILTERS_DATA } from '../../api/campaigns';
import EmptyCampaigns from './emptyScenes/EmptyCampaigns';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
	UIManager.setLayoutAnimationEnabledExperimental(true);

const CustomCheckBox = (props) => {
	return <TouchableOpacity onPress={props.onPress}
		style={{
			alignItems: 'center',
			width: 24,
			height: 24,
			marginHorizontal: 0,
			backgroundColor: props.checked ? props.color : 'white'
		}}>
		{props.checked ?
			<Icon name='ios-checkmark' type='Ionicons'
				style={{
					marginTop: -3,
					fontSize: 30,
					color: 'white'
				}} />
			: null}
	</TouchableOpacity>
}

class FiltersForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			filterCategories: [],
			filterPlatforms: [],
			categories: [],
			platforms: []
		}
	}

	onApplyFilters = () => {
		if (this.state.filterCategories.length > 0 || this.state.filterPlatforms.length > 0) {
			this.props.onApplyFilters({
				filtersApplied: {
					applied: true,
					filterCategories: [...this.state.filterCategories],
					filterPlatforms: [...this.state.filterPlatforms]
				}
			})
		} else {
			this.props.onApplyFilters({
				filtersApplied: {
					applied: false,
					filterCategories: [...this.state.filterCategories],
					filterPlatforms: [...this.state.filterPlatforms]
				}
			})
		}
	}

	static constructFilters = (campaigns) => {
		const categories = _.uniq(campaigns.map(c => c.fields.category));
		const platforms = _.uniq(campaigns.map(c => c.platform));
		return { categories: categories, platforms: platforms };
	}

	static getDerivedStateFromProps = (props, state) => {
		if (!props.data.loading && !props.data.error && props.data.campaigns) {
			return this.constructFilters(props.data.campaigns);
		} else
			return null
	}

	renderPlatformFilterItem = (filter) => {
		return <ListItem key={filter} style={styles.filterListItem}>
			<Body>
				<Text style={styles.filterText}>{filter}</Text>
			</Body>
			<CustomCheckBox checked={this.state.filterPlatforms.find(f => f === filter)}
				color={platform.brandPrimary}
				onPress={() => {
					const filters = this.state.filterPlatforms.find(f => f === filter) ?
						this.state.filterPlatforms.filter(f => f !== filter)
						: [...this.state.filterPlatforms, filter];
					this.setState({ filterPlatforms: filters })
				}} />
		</ListItem>
	}

	renderCategoryFilterItem = (filter) => {
		return <ListItem key={filter} style={styles.filterListItem}>
			<Body>
				<Text style={styles.filterText}>{filter}</Text>
			</Body>
			<CustomCheckBox checked={this.state.filterCategories.find(f => f === filter)}
				color={platform.brandPrimary}
				onPress={() => {
					const filters = this.state.filterCategories.find(f => f === filter) ?
						this.state.filterCategories.filter(f => f !== filter)
						: [...this.state.filterCategories, filter];
					this.setState({ filterCategories: filters })
				}} />
		</ListItem>
	}

	render = () => {
		const { data: { loading, campaigns, error, refetch } } = this.props;
		return this.props.visible ? !loading && !error ?
			<View>
				<ScrollView>
					<List style={styles.filterContainer}>
						{this.state.categories ? <ListItem style={styles.filterListItem}>
							<Body><Text style={styles.filterCaption}>Show categories</Text></Body>
						</ListItem>
							: null}
						{this.state.categories.map(c => this.renderCategoryFilterItem(c))}

						{this.state.platforms ? <ListItem style={styles.filterListItem}>
							<Body><Text style={styles.filterCaption}>Show platforms</Text></Body>
						</ListItem>
							: null}
						{this.state.platforms.map(c => this.renderPlatformFilterItem(c))}

						<ListItem style={styles.filterListItemLast}>
							<Body >
								<Button style={{ width: "100%", justifyContent: 'center' }} onPress={this.onApplyFilters}>
									<Text style={{
										fontSize: 18,
										lineHeight: 25,
										letterSpacing: -0.257143
									}}>Apply</Text>
								</Button>
							</Body>
						</ListItem>
					</List>
				</ScrollView>
			</View>
			: <List style={styles.filterContainer}>
				<Spinner color={platform.brandPrimary} />
				<Text>Please wait, filter data is loading</Text>
			</List>
			: null;
	}
}

const ConnectedFiltersForm = graphql(GET_CAMPAIGNS_FILTERS_DATA, {
	options: (props) => ({
		notifyOnNetworkStatusChange: true,
		fetchPolicy: "cache-and-network"
	})
})(FiltersForm);

class Campaigns extends Component {

	static navigationOptions = () => {
		return {
			header: null,
			headerLeft: null,
			headerRight: null
		};
	};

	constructor(props) {
		super(props);
		this.state = {
			memoizedCampaigns: undefined,
			memoizedRequests: undefined,
			searchVisible: false,
			filtersVisible: false,
			searchText: '',
			filtersApplied: {
				applied: false,
				filterCategories: [],
				filterPlatforms: []
			}
		}
	}

	findRequestForCampaign = (id) => {
		//assumes 1 request per campaign
		requests = this.props.data.requests ? this.props.data.requests : []
		return requests.find(r => r.campaign.id === id);
	}

	onCampaignPressed = (item) => {
		const { navigate } = this.props.navigation;
		const req = this.findRequestForCampaign(item.id);
		navigate('CampaignInfoScreen',
			{ id: item.id, request: req });
	};

	renderCampaign = ({ item }) => {
		const media = item.media.find(i => i.mediaType == 'image');
		return (
			<Card key={item.id}
				style={{
					borderBottomWidth: 1,
					borderBottomColor: '#0000FF'
				}}

			>
				<CardItem button
					campaignsItem
					onPress={() => this.onCampaignPressed(item)}
				>
					<Image
						source={{
							uri: media ? media.url : "https://picsum.photos/300/300/?random"
						}}
						style={styles.cardImg}
					/>
				</CardItem>
				<CardItem button campaingsItemContent onPress={() => this.onCampaignPressed(item)}>
					<View>
						<Text style={{ fontFamily: 'Poppins-Bold' }}>
							{item.title}
						</Text>
						<Text style={styles.descText}
							numberOfLines={1}>
							{item.description}
						</Text>
					</View>
					<Icon
						name="logo-instagram"
						style={{ marginLeft: -12 }}
					/>
				</CardItem>
			</Card>
		)
	}

	reload = async refetch => {
		try {
			await refetch()
		} catch (err) {
			console.log('[Campaigns] Reloading unsuccessful')
		}
	}

	static getDerivedStateFromProps = (props, state) => {
		if (!props.data.loading && !props.data.error) {
			return { memoizedRequests: props.data.requests, memoizedCampaigns: props.data.campaigns }
		} else
			return null
	}

	filterCampaigns = (campaigns) => {
		const { applied, filterCategories, filterPlatforms } = this.state.filtersApplied;
		const search = this.state.searchText.toLowerCase();
		const filteredCampaigns = campaigns ? this.state.filtersApplied.applied ? campaigns.filter(
			c => filterCategories.length > 0 ? filterCategories.includes(c.fields.category) : true
		)
			.filter(
				c => filterPlatforms.length > 0 ? filterPlatforms.includes(c.platform) : true
			) : campaigns
			: null;
		return campaigns ? filteredCampaigns.filter(c => c.status == true
			&& (search ? c.title.toLowerCase().includes(search) : true))
			: null;
	}

	toggleSearch = () => {
		LayoutAnimation.linear();
		this.setState({ searchVisible: !this.state.searchVisible })
	}

	toggleFilters = () => {
		LayoutAnimation.linear();
		this.setState({ filtersVisible: !this.state.filtersVisible })
	}

	onApplyFilters = ({ filtersApplied: { applied, filterCategories, filterPlatforms } }) => {
		LayoutAnimation.linear();
		this.setState({ filtersApplied: { applied, filterPlatforms, filterCategories }, filtersVisible: false })
	}

	onSearchTextChanged = (text) => {
		LayoutAnimation.linear();
		this.setState({ searchText: text });
	}

	componentDidMount() {
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
		this.focusSub.remove();
	}

	render() {
		const { data: { loading, campaigns, requests, error, refetch } } = this.props;
		const { searchVisible, filtersVisible } = this.state;
		if (error) {
			return (
				<EmptyCampaigns reload={() => this.reload(refetch)} />
			);
		} else
			if ((!loading && !campaigns) || (campaigns && campaigns.length < 1)) {
				return (
					<EmptyCampaigns reload={() => this.reload(refetch)} />
				);
			}
			else {

				return (
					<StyleProvider style={getTheme(platform)}>
						<Container>
							<Header transparent>
								<Body style={{ flex: 8 }}>

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
										: <Title>Campaigns</Title>}
								</Body>
								<Right style={{ flex: 2 }}>
									<Button transparent onPress={this.toggleFilters}>
										<Icon name="menu" style={{ color: this.state.filtersApplied.applied ? platform.brandPrimary : 'black' }} />
									</Button>

									<Button transparent onPress={this.toggleSearch}>
										<Icon name="search" style={{ color: this.state.searchText ? platform.brandPrimary : 'black' }} />
									</Button>
								</Right>
							</Header>
							<View style={{ flex: 1 }}>
								<ConnectedFiltersForm visible={this.state.filtersVisible} onApplyFilters={this.onApplyFilters} />

								<Content showsVerticalScrollIndicator={false}
									style={{
										backgroundColor: '#EBF1FD'
									}}
								>

									{!error ? !loading && campaigns ?
										<FlatList
											showsVerticalScrollIndicator={false}
											data={this.filterCampaigns(campaigns)}
											renderItem={this.renderCampaign}
											keyExtractor={(item, index) => item.id}
										/>
										: this.state.memoizedCampaigns ?
											<FlatList
												showsVerticalScrollIndicator={false}
												data={this.filterCampaigns(this.state.memoizedCampaigns)}
												renderItem={this.renderCampaign}
												keyExtractor={(item, index) => item.id}
											/>
											: <Spinner style={styles.spinner} color='#FF0091' />
										: <Text style={styles.errorText}>Network error, please try again later</Text>
									}

								</Content>

							</View>
						</Container>
					</StyleProvider>
				);
			}
	}
}

const styles = StyleSheet.create({
	clearSearchButton: {
		height: 40,
		width: 40,
		alignSelf: 'center'
	},
	filterContainer: {
		backgroundColor: '#EBF1FD',
	},
	filterCaption: {
		fontFamily: 'Poppins-Bold',
		fontSize: 24,
		lineHeight: 33,
		letterSpacing: -0.685714,
		color: '#000000',
		marginLeft: 0
	},
	filterListItem: {
		borderBottomWidth: 0,
		paddingBottom: 10,
		marginLeft: 24,
		marginRight: 24,
		paddingRight: 0
	},
	filterListItemLast: {
		borderBottomWidth: 0,
		paddingBottom: 24,
		marginLeft: 24,
		marginRight: 24,
		paddingRight: 0
	},
	filterText: {
		fontSize: 18,
		lineHeight: 25,
		letterSpacing: -0.514286,
		color: '#000000',
		marginLeft: 0
	},
	cardImg: {
		height: 180,
		flex: 1
	},
	descText: {
		fontFamily: 'Poppins-Regular',
		fontSize: 14,
		opacity: 0.7,
	},
	errorText: {
		alignSelf: 'center',
		textAlign: 'center',
	},
	spinner: {
		flex: 1
	}
});

export default graphql(GET_CAMPAIGNS, {
	options: (props) => ({
		notifyOnNetworkStatusChange: true,
		fetchPolicy: "cache-and-network",
		pollInterval: 60000
	})
})(Campaigns);
