import {
	createSwitchNavigator,
	createBottomTabNavigator,
	createStackNavigator,
	createAppContainer
} from 'react-navigation';
import React from 'react';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import iconicreachFontConfig from './selection.json';
const Icon = createIconSetFromIcoMoon(
	iconicreachFontConfig,
	'iconicreach',
	'iconicreach.ttf'
);
import { View, Badge, Text, StyleProvider } from 'native-base';

import Initial from './Scenes/auth/Initial';
import Login from './Scenes/auth/Login';
import Signup from './Scenes/auth/Signup';
import FaceId from './Scenes/auth/FaceId';
import AuthLoading from './Scenes/auth/AuthLoading';

import Campaigns from './Scenes/app/Campaigns';
import CampaignInfoScreen from './Scenes/app/CampaignInfoScreen';

import NavigationIcon from './Scenes/app/components/NavigationIcon';
import Messages from './Scenes/app/Messages';
import MessageDialog from './Scenes/app/MessageDialog'
import Profile from './Scenes/app/Profile';
import Settings from './Scenes/app/Settings';
import Requests from './Scenes/app/Requests';
import ContentOverview from './Scenes/app/ContentOverview';
import AddSocialProfile from './Scenes/app/components/AddSocialProfile/AddSocialProfile';
import VerifySocialProfile from './Scenes/app/components/AddSocialProfile/VerifySocialProfile';
import AboutYou from './Scenes/app/components/AddSocialProfile/AboutYou';
import AddSuccess from './Scenes/app/components/AddSocialProfile/AddSuccess';

import EmptyCampaigns from './Scenes/app/emptyScenes/EmptyCampaigns';
import EmptyMessages from './Scenes/app/emptyScenes/EmptyMessages';
import EmptyRequests from './Scenes/app/emptyScenes/EmptyRequests';

import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import withApolloQuery from './Scenes/app/components/withApolloQuery.js';
import { GET_TOTAL_UNREAD_MSG } from './api/messages.js';

const AddSocialProfileStack = createStackNavigator({
	AddSocialProfile: AddSocialProfile,
	VerifySocialProfile: VerifySocialProfile,
	AboutYou: AboutYou,
	AddSuccess: AddSuccess
});

AddSocialProfileStack.navigationOptions = {
	initialRouteName: 'AddSocialProfile',
	header: null,
	headerLeft: null,
	headerRight: null,
	tabBarVisible: false,
}

const ProfileStack = createStackNavigator({
	Profile: Profile,
	Settings: Settings,
	AboutYou: AboutYou,
	VerifySocialProfile: VerifySocialProfile,
	AddSocialProfile: AddSocialProfileStack,
});

ProfileStack.navigationOptions = ({ navigation }) => {
	let tabBarVisible = true;

	let routeName =
		navigation.state.routes[navigation.state.index].routeName;

	if (routeName == 'Settings' || routeName == 'AddSocialProfile' || routeName == 'AboutYou'
		|| routeName == 'VerifySocialProfile') {
		tabBarVisible = false;
	}

	return {
		tabBarVisible
	};
};

const RequestStack = createStackNavigator({
	RequestsView: Requests,
	ContentOverview: {
		screen: ContentOverview,
		params: {
			declined: false
		}
	}
});

RequestStack.navigationOptions = ({ navigation }) => {
	let tabBarVisible = true;

	let routeName =
		navigation.state.routes[navigation.state.index].routeName;

	if (routeName == 'ContentOverview') {
		tabBarVisible = false;
	}

	return {
		tabBarVisible
	};
};

const MessagesStack = createStackNavigator({
	Messages: Messages,
	MessageDialog: MessageDialog,
});

MessagesStack.navigationOptions = ({ navigation }) => {
	let tabBarVisible = true;

	let routeName =
		navigation.state.routes[navigation.state.index].routeName;

	if (routeName == 'MessageDialog') {
		tabBarVisible = false;
	}

	return {
		tabBarVisible
	};
};

const CampaignsStack = createStackNavigator({
	Campaigns: Campaigns,
	CampaignInfoScreen: CampaignInfoScreen
});

CampaignsStack.navigationOptions = ({ navigation }) => {
	let tabBarVisible = true;

	let routeName =
		navigation.state.routes[navigation.state.index].routeName;

	if (routeName == 'CampaignInfoScreen') {
		tabBarVisible = false;
	}

	return {
		tabBarVisible,
		initialRouteName: 'Campaigns'
	};
};

const ConnectedNavigationIcon = withApolloQuery(NavigationIcon, {
	query: GET_TOTAL_UNREAD_MSG,
	poll: 1000,
	dataToProps: ({ data }, props) => {
		return { ...props, ...{ notificationCount: data.unreadMessages ? data.unreadMessages : 0 } }
	}
})

const AppStack = createBottomTabNavigator(
	{
		Campaigns: {
			screen: CampaignsStack,
			navigationOptions: {
				tabBarLabel: 'Campaigns',
				tabBarIcon: ({ tintColor }) => (
					<NavigationIcon name='Campaigns' tintColor={tintColor} />
				)
			}
		},

		Requests: {
			screen: RequestStack,
			navigationOptions: {
				tabBarLabel: 'Requests',
				tabBarIcon: ({ tintColor }) => (
					<NavigationIcon name='Requests' tintColor={tintColor} />
				)
			}
		},
		Messages: {
			screen: MessagesStack,
			navigationOptions: {
				tabBarLabel: 'Messages',
				tabBarIcon: ({ tintColor }) => (
					<ConnectedNavigationIcon name='Messages' tintColor={tintColor} />
				)
			}
		},
		Profile: {
			screen: ProfileStack,
			navigationOptions: {
				tabBarLabel: 'My Profile',
				tabBarIcon: ({ tintColor }) => (
					<NavigationIcon name='Profile' tintColor={tintColor} />
				)
			}
		}
	},
	{
		tabBarOptions: {
			showLabel: true,
			adaptive: false,
			activeTintColor: '#FF0091',
			inactiveTintColor: 'black',
			style: {
				backgroundColor: 'white',
				borderTopWidth: 0, 
				height: 75,
			},
			tabStyle: {
				marginTop: 10
			},
			labelStyle: {
				fontSize: 10,
				fontFamily: 'Poppins-Regular',
				marginTop: 10
			}
		}
	}
);

const AuthStack = createStackNavigator({
	Initial: Initial,
	Login: Login,
	Signup: Signup,
	FaceId: FaceId
});

export default createAppContainer(
	createSwitchNavigator(
		{
			AuthLoading: AuthLoading,
			App: AppStack,
			Auth: AuthStack
		},
		{
			initialRouteName: 'AuthLoading'
		}
	)
);
