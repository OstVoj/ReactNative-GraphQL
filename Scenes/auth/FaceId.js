import React, { Component } from 'react';

import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Left,
	Right,
	Body,
	Icon,
	Text,
	StyleProvider
} from 'native-base';
import {
	ImageBackground,
	Dimensions,
	Image,
	View
} from 'react-native';

import getTheme from '../../native-base-theme/components';

import platform from '../../native-base-theme/variables/platform';

export class FaceId extends Component {
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
	}

	componentDidMount() {}

	onBackButtonPressed = () => {
		const { navigate } = this.props.navigation;

		navigate('Login');
	};

	render() {
		let { height, width } = Dimensions.get('window');
		return (
			<StyleProvider style={getTheme(platform)}>
				<Container>
					<ImageBackground
						source={require('./../../assets/images/faceid_bg.png')}
						style={{ width, height }}
					>
						<Header transparent>
							<Left>
								<Button
									transparent
									onPress={this.onBackButtonPressed}
								>
									<Icon
										name="arrow-back"
										style={{
											fontSize: 30,
											color: 'black',
											marginLeft: 20
										}}
									/>
								</Button>
							</Left>
							<Body style={{ flex: 3 }}>
								<Title>Face ID</Title>
							</Body>
							<Right />
						</Header>
						<Content
							padder
							contentContainerStyle={{
								flex: 1,
								justifyContent: 'flex-end',
								marginBottom: 36,
								flexDirection: 'column',
								alignItems: 'center'
							}}
						>
							<View style={{ height: 180 }}>
								<Image
									source={require('./../../assets/images/faceid-icon.png')}
								/>
							</View>
							<View
								style={{
									height: 200,
									width: 180
								}}
							>
								<Text
									style={{
										fontSize: 22,
										fontWeight: 'bold',
										textAlign: 'center',
										fontFamily: 'Poppins-Bold'
									}}
								>
									Give a smile to your phone's front camera
								</Text>
							</View>
							<Button
								transparent
								onPress={this.onBackButtonPressed}
								style={{ textAlign: 'center' }}
							>
								<Text>Login With Email</Text>
							</Button>
						</Content>
					</ImageBackground>
				</Container>
			</StyleProvider>
		);
	}
}

export default FaceId;
