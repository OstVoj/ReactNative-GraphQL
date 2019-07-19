import React from 'react';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import iconicreachFontConfig from '../../../selection.json';
const Icon = createIconSetFromIcoMoon(
    iconicreachFontConfig,
    'iconicreach',
    'iconicreach.ttf'
);
import { View, Badge, Text, StyleProvider } from 'native-base';

import getTheme from '../../../native-base-theme/components';
import platform from '../../../native-base-theme/variables/platform';

function NavigationIcon(props) {
    return (
        <StyleProvider style={getTheme(platform)}><View>
            <Icon name={props.name} size={35} color={props.tintColor} />
            {props.notificationCount ?
                <Badge navigation>
                    <Text>{props.notificationCount}</Text>
                </Badge>
                : null
            }
        </View>
        </StyleProvider>
    );
}

export default NavigationIcon;