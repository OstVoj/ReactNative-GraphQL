import React, { Component } from 'react';

import { Content, Thumbnail, Icon, Button, Right, Header, Container, StyleProvider, connectStyle, Text, Spinner } from 'native-base';
import { Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

import getTheme from '../../../native-base-theme/components';
import platform from '../../../native-base-theme/variables/platform';

class ImageViewer extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <StyleProvider style={getTheme(platform)}>
                <Container pinkContainer>
                    <Header transparent>
                        <Right>
                            <Button
                                transparent
                                onPress={this.props.onClose}
                            >
                                <Icon name="md-close"
                                    type="Ionicons" />
                            </Button>
                        </Right>
                    </Header>
                    <Content>
                        <Thumbnail
                            square
                            source={this.props.source}
                            style={styles.fullImg}
                        />
                        {this.props.onUpload ?
                            <Button
                                style={styles.uploadButton}
                                disabled={this.props.uploading}
                                onPress={this.props.onUpload}
                            >
                                <Text>Upload image</Text>
                            </Button> : null}
                        {this.props.uploading ? <Spinner style={styles.spinner} color='#FFFFFF' /> : null}
                    </Content>
                </Container>
            </StyleProvider>
        );
    }
}

const styles = {
    uploadButton: {
        marginTop: 25,
        alignSelf: 'center'
    },
    fullImg: {
        width: deviceWidth,
        height: deviceWidth,
        marginTop: (deviceHeight / 2) - (deviceWidth / 2) - 128
    },
    spinner: {
        flex: 1
    }
}

export default connectStyle('ImageViewer', styles)(ImageViewer);