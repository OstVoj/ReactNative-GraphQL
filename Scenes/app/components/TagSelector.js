import React, { Component } from 'react';
import { connectStyle } from 'native-base';
import { View } from 'react-native';
import {
    Button,
    Text,
    StyleProvider
} from 'native-base';

import getTheme from '../../../native-base-theme/components';

import platform from '../../../native-base-theme/variables/platform';

export class TagSelector extends Component {
    /**
     * Tag selector
     *
     * @param {Function} onChange callback on change with one (tagSelected) param - array of selected tags' id
     * @param {Number} maxHeight max height of view to allow before appears 'Show more' text and floding functionality
     * @param {Array} tags array of tags to render - objects of type {id: string, name: string}
     */

    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            overflowed: false,
        };
    }

    onTagSelected = (key) => {
        this.props.onChange(key);
    }

    renderTag = (tag, tagsSelected) => {
        return (
            <Text style={tagsSelected.includes(tag.id) ?
                styles.verticalsTagSelected :
                styles.verticalsTag}
                onPress={() => this.onTagSelected(tag.id)}
                key={tag.id}
                onLayout={this.onLayoutTag}>
                {tag.name}
            </Text>
        );
    }

    onExpand = () => {
        this.setState({ expanded: !this.state.expanded })
    }

    onLayoutTag = (event) => {
        const y = event.nativeEvent.layout.y;
        if (!this.state.overflowed && y > this.props.maxHeight) {
            this.setState({ overflowed: true });
        }
    }

    render() {
        const styles = this.props.style;
        return (
            <StyleProvider style={getTheme(platform)}><View>
                <View style={this.state.expanded ? styles.containerExpanded : [styles.container, { maxHeight: this.props.maxHeight }]}
                    onLayout={this.onLayoutContainer}>
                    {this.props.tags.map((i) => this.renderTag(i, this.props.tagsSelected))}
                </View>
                {this.state.overflowed ?
                    <View style={styles.showMore}>
                        <Button transparent
                            style={styles.btnStyle}
                            onPress={this.onExpand}>
                            <Text style={styles.btnText}>{this.state.expanded ? 'Show less' : 'Show More'}</Text>
                        </Button>
                    </View>
                    : null
                }

            </View>
            </StyleProvider>
        );
    }
}

const styles = {
    btnText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#2590DC',
        letterSpacing: -0.17,
        textAlign: 'right',
        padding: 0
    },
    btnStyle: {
        flex: 1,
        height: 25,
        justifyContent: 'right',
        alignSelf: 'flex-end'
    },
    showMore: {
        marginTop: 16,
        flex: 1,
        flexGrow: 1,
        borderTopWidth: 1,
        borderTopColor: '#2590DC',
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden'
    },
    containerExpanded: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    verticalsTag: {
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 12,
        paddingBottom: 8,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        height: 32,
        margin: 2,
        color: '#2590DC',
        letterSpacing: -0.17,
        backgroundColor: '#EBF1FD'
    },
    verticalsTagSelected: {
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 12,
        paddingBottom: 8,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        height: 32,
        margin: 2,
        color: '#FFFFFF',
        letterSpacing: -0.17,
        backgroundColor: '#FF0091'
    }
}

export default connectStyle('TagSelector', styles)(TagSelector);