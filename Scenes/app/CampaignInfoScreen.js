import React, { Component, Fragment } from 'react';
import { Modal } from 'react-native';
import {
	Container,
	Content,
	Button,
	Icon,
	Text,
	StyleProvider,
	Spinner
} from 'native-base';
import { connectStyle } from 'native-base';

import CampaignInfo from './components/Campaigns/CampaignInfo';
import ApplyModal from "./components/Campaigns/apply/ApplyModal";

import getTheme from '../../native-base-theme/components';
import platform from '../../native-base-theme/variables/platform';
import { graphql } from 'react-apollo';
import { GET_CAMPAIGN_BY_ID } from '../../api/campaigns';

export class CampaignInfoScreen extends Component {
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
			successModalVisible: false
		};
	}

	onApply = () => {
		this.setState({
			successModalVisible: true
		});
	};

	render() {
		const { data: { error, loading, campaign } } = this.props
		const request = this.props.navigation.getParam('request', null);
		const canApply = request ? request.status === 'declined' || request.status === 'invited' || !request
			: true;

		return (
			<StyleProvider style={getTheme(platform)}>
				<Container style={styles.container}>
					<Content style={styles.content}>
						{!error ? !loading && campaign ?
							<Fragment>
								<CampaignInfo campaign={campaign} />
								{canApply ?
									<Fragment>
										<Button
											block
											style={styles.applyButton}
											onPress={() => this.onApply()}
										>
											<Text>Apply</Text>
										</Button>
										<Text></Text>
										<Modal
											animationType="slide"
											transparent={false}
											visible={this.state.successModalVisible}
											onRequestClose={() => { }}
										>
											<ApplyModal
												campaignId={this.props.navigation.getParam('id', '')}
												account={request ? request.status === 'invited' ? request.account : null : null}
												onClose={() =>
													this.setState({ successModalVisible: false })
												}
												onSuccess={this.props.navigation.popToTop}
											/>
										</Modal>
									</Fragment>
									: <Text></Text>}
							</Fragment>
							: <Spinner style={styles.spinner} color='#FF0091' />
							: <Text style={styles.errorText}>Network error, please try again later</Text>
						}
					</Content>

					<Button style={styles.backButton}
						onPress={() => this.props.navigation.goBack()}
					>
						<Icon
							name="arrow-back"
							style={{ color: 'black' }}
						/>
					</Button>
					{!error ? !loading && campaign ? campaign.fields && <Text style={styles.category}>{campaign.fields.category}</Text>
						: null
						: null}

				</Container>
			</StyleProvider>
		);
	}
}

const styles = {
	container: {
		paddingTop: 42
	},
	applyButton: {
		marginLeft: 24,
		marginRight: 24,
		marginTop: 0,
		marginBotton: 24,
	},
	backButton: {
		position: 'absolute',
		backgroundColor: '#FFFFFF',
		height: 89,
		width: 48,
		marginTop: 93
	},
	category: {
		position: 'absolute',
		marginTop: 93,
		alignSelf: 'flex-end',
		fontFamily: 'Poppins-Bold',
		fontSize: 14,
		color: '#FFFFFF',
		letterSpacing: -0.2,
		textAlign: 'right',
		backgroundColor: '#1073FF',
		paddingHorizontal: 26,
		paddingVertical: 6
	}
}

export default graphql(GET_CAMPAIGN_BY_ID,
	{
		options: (props) => ({
			variables: {
				id: props.navigation.getParam('id', '')
			},
		})
	}
)(connectStyle('CampaignInfoScreen', styles)(CampaignInfoScreen));
