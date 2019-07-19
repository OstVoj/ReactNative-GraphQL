import React, { Component } from 'react';
import { connectStyle } from 'native-base';
import { StackActions } from 'react-navigation';
import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Icon,
	Right,
	Body,
	StyleProvider
} from 'native-base';

import getTheme from '../../../../native-base-theme/components';

import platform from '../../../../native-base-theme/variables/platform';
import SuccessComponent from '../SuccessComponent';

export class AddSuccess extends Component {
	static navigationOptions = () => {
		return {
			header: null,
			headerLeft: null,
			headerRight: null
		};
	};

	onClose = () => {
		console.log('navigate');
		this.props.navigation.dispatch(StackActions.popToTop());
		this.props.navigation.dispatch(StackActions.pop());
		this.props.navigation.navigate('Campaigns');
	}

	onClosePressed = () => {
		this.props.navigation.goBack();
	}

	render() {
		const styles = this.props.style;
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
									type="Ionicons"
								/>
							</Button>
						</Right>
					</Header>
					<Content pinkContent>
						<SuccessComponent onClose={this.onClose}
							messageText='Submission Successful! Now you can view and respond to campaigns'
							closeText='Next' />
					</Content>
				</Container>
			</StyleProvider>
		);
	}

}

styles = {

}

export default connectStyle('AddSuccess', styles)(AddSuccess);