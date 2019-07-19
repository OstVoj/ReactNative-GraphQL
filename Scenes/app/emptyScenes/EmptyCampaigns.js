import React, { Component } from 'react';

import {
	Container,
	Header,
	Title,
	Content,
	Left,
	Body,
	Text,
	StyleProvider,
	Right,
	H1,
	Button
} from 'native-base';

import { ImageBackground, Dimensions } from 'react-native';

import getTheme from '../../../native-base-theme/components';

import platform from '../../../native-base-theme/variables/platform';

export class EmptyCampaigns extends Component {
	render() {
		let { height, width } = Dimensions.get('window');
		return (
			<StyleProvider style={getTheme(platform)}>
				<Container>
					<ImageBackground
						source={require("'./../../../assets/images/emptyCampaigns_bg.png")}
						resizeMode={'contain'}
						style={{
							width,
							height: height * 0.9
						}}
					>
						<Header transparent>
							<Left />
							<Body style={{ flex: 4 }}>
								<Title>Campaigns</Title>
							</Body>
							<Right />
						</Header>
						<Content
							padder
							contentContainerStyle={{
								flex: 1,
								justifyContent: 'center',
							}}
						>
							<H1 style={{ textAlign: 'center' }}>
								Here's where your campaigns will live
							</H1>
							{this.props.reload ?
								<Button onPress={this.props.reload}
									style={{ alignSelf: 'center' }}>
									<Text>Reload</Text>
								</Button>
								: null}
						</Content>
					</ImageBackground>
				</Container>
			</StyleProvider>
		);
	}
}

export default EmptyCampaigns;
