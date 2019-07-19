import React, { Component } from 'react';

import { Content, Thumbnail, Icon, Button, Right, Header, Container, StyleProvider, connectStyle, Spinner, Text } from 'native-base';
import { Dimensions } from "react-native";
import { Video } from 'expo';

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

import getTheme from '../../../native-base-theme/components';
import platform from '../../../native-base-theme/variables/platform';

class VideoViewer extends Component {

    constructor(props) {
        super(props);
        this.state = { loading: true }
    }

    onLoad = () => {
        this.setState({ loading: false });
    }

    render() {
        const { loading } = this.state;
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
                        {loading ? <Spinner style={styles.spinner} color='#FFFFFF' /> : null}
                        <Video
                            source={this.props.source}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode="cover"
                            shouldPlay
                            isLooping
                            useNativeControls
                            onLoad={this.onLoad}
                            style={styles.fullImg}
                        />
                        {this.props.onUpload ?
                            <Button
                                style={styles.uploadButton}
                                disabled={this.props.uploading}
                                onPress={this.props.onUpload}
                            >
                                <Text>Upload video</Text>
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

export default connectStyle('VideoViewer', styles)(VideoViewer);