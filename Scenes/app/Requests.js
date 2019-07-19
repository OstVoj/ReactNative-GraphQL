import React, { Component } from 'react';
import {
	Container,
	Header,
	Title,
	Right,
	Body,
	Text,
	Tab,
	Tabs,
	TabHeading,
	StyleProvider,
	Badge,
	Spinner
} from 'native-base';
import { StyleSheet } from 'react-native';

import getTheme from '../../native-base-theme/components';
import platform from '../../native-base-theme/variables/platform';

import Current from './components/Requests/Current';
import Invitations from './components/Requests/Invitations';
import Completed from './components/Requests/Completed';
import { GET_REQUESTS } from '../../api/requests';
import { graphql } from 'react-apollo';
import EmptyRequests from './emptyScenes/EmptyRequests';


export class Requests extends Component {
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
			memoizedRequests: undefined,
		}
	}

	filterInvitation = (requests) => {
		return requests.filter((v) => {
			return v.status === 'invited'
		})
	}

	reload = async refetch => {
		try {
			await refetch()
		} catch (err) {
			console.log('[Requests] Reloading unsuccessful')
		}
	}

	static getDerivedStateFromProps = (props, state) => {
		if (!props.data.loading && !props.data.error) {
			return { memoizedRequests: props.data.requests }
		} else
			return null
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
		const { data: { loading, requests, error, refetch } } = this.props;
		const invitations = !error ? !loading && requests ?
			this.filterInvitation(requests).length
			: this.state.memoizedRequests ?
				this.filterInvitation(this.state.memoizedRequests).length
				: 0
			: 0
		if (error) {
			return (
				<EmptyRequests reload={() => this.reload(refetch)} />
			);
		} else
			if ((!loading && !requests) || (requests && requests.length < 1)) {
				return (
					<EmptyRequests reload={() => this.reload(refetch)} />
				);
			}
			else return (
				<StyleProvider style={getTheme(platform)}>
					<Container>
						<Header transparent hasTabs>
							<Body style={{ flex: 2 }}>
								<Title>Requests</Title>
							</Body>
							<Right />
						</Header>
						<Tabs>
							<Tab heading={<TabHeading><Text>Current</Text></TabHeading>}>
								{!error ? !loading && requests ? <Current navigation={this.props.navigation} requests={requests} />
									: this.state.memoizedRequests ? <Current navigation={this.props.navigation} requests={this.state.memoizedRequests} />
										: <Spinner color='#FF0091' />
									: <Text style={styles.errorText}>Network error, please try again later</Text>}
							</Tab>
							<Tab
								heading={
									<TabHeading>
										<Text>Invitations</Text>
										{invitations > 0 ?
											<Badge
												style={{
													backgroundColor: '#FF0091'
												}}
											>
												<Text>{invitations}</Text>
											</Badge>
											: null}
									</TabHeading>
								}
							>
								{!error ? !loading && requests ? <Invitations navigation={this.props.navigation} requests={requests} />
									: this.state.memoizedRequests ? <Invitations navigation={this.props.navigation} requests={this.state.memoizedRequests} />
										: <Spinner color='#FF0091' />
									: <Text style={styles.errorText}>Network error, please try again later</Text>}
							</Tab>
							<Tab heading={<TabHeading><Text>Completed</Text></TabHeading>}>
								{!error ? !loading && requests ? <Completed requests={requests} />
									: this.state.memoizedRequests ? <Completed requests={this.state.memoizedRequests} />
										: <Spinner color='#FF0091' />
									: <Text style={styles.errorText}>Network error, please try again later</Text>}
							</Tab>
						</Tabs>
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

export default
	graphql(GET_REQUESTS, {
		options: (props) => ({
			notifyOnNetworkStatusChange: true,
			fetchPolicy: 'cache-and-network', //no "cache-and-network", see https://github.com/apollographql/apollo-client/issues/4267
			pollInterval: 60000
		})
	})(Requests);
