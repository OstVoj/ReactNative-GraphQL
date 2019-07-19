import React, { Component } from 'react';

import {
	Container,
	Header,
	Title,
	Content,
	Left,
	Body,
	H1,
	StyleProvider,
	Right,
	Button,
	Text
} from 'native-base';

import { ImageBackground, Dimensions } from 'react-native';

import getTheme from '../../../native-base-theme/components';

import platform from '../../../native-base-theme/variables/platform';

export class EmptyMessages extends Component {
	render() {
		let { height, width } = Dimensions.get('window');
		return (
			<StyleProvider style={getTheme(platform)}>
				<Container>
					<ImageBackground
						source={require("'./../../../assets/images/emptyMessages_bg.png")}
						resizeMode={'contain'}
						style={{
							width,
							height: height * 0.9
						}}
					>
						<Header transparent>
							<Left />
							<Body style={{ flex: 3 }}>
								<Title>Messages</Title>
							</Body>
							<Right />
						</Header>
						<Content
							padder
							contentContainerStyle={{
								flex: 1,
								justifyContent: 'center'
							}}
						>
							<H1 style={{ textAlign: 'center' }}>
								Here's where your messages will live
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

export default EmptyMessages;
