import React, { Component } from 'react';
import { connectStyle } from 'native-base';
import { View } from 'react-native';
import {
    Text,
    Item,
    Switch,
    StyleProvider
} from 'native-base';

import getTheme from '../../../native-base-theme/components';

import platform from '../../../native-base-theme/variables/platform';

export class RadioGroup extends Component {
    /**
     * Radio Group
     *
     * @param {Function} onChange callback on change with one (radioChoice) param
     * @param {Array} radioChoices array of radio choices. renders captions from this too
     */

    constructor(props) {
        super(props);
    }

    onRadioChange = (key) => {
        this.props.onChange(key);
    }

    renderRadio = (radio) => {
        return (
            <Item style={styles.radioItem} key={radio}>
                <Switch
                    onValueChange={() => this.onRadioChange(radio)}
                    trackColor={{ true: "#FF0091" }}
                    value={this.props.radioChoice === radio}

                />
                <Text style={[styles.boldInputText, styles.paddedLeft]}>{radio}</Text>
            </Item>
        );
    }

    render() {
        const styles = this.props.style;
        return (
            <StyleProvider style={getTheme(platform)}>
                <View style={styles.container}>
                    {this.props.radioChoices.map(v => this.renderRadio(v))}
                </View>
            </StyleProvider>
        );
    }
}

const styles = {
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    radioItem: {
        paddingLeft: 6,
        paddingRight: 6,
        borderBottomWidth: 0
    },
    paddedLeft: {
        paddingLeft: 4
    },
    boldInputText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#000000',
    }
}

export default connectStyle('RadioGroup', styles)(RadioGroup);