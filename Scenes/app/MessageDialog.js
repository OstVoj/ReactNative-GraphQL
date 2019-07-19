import React, { Component } from "react";
import {
    Container,
    Header,
    Text,
    StyleProvider,
    Thumbnail,
    connectStyle,
    View,
    Left,
    Body,
    Right,
    Footer,
    Input,
    Form,
    Item,
    Button,
    Card,
    CardItem,
    Icon,
    Spinner,
    Toast,
    Root
} from "native-base";

import { SecureStore } from 'expo';
import { findNodeHandle, UIManager } from 'react-native';

import { Image, Animated, Keyboard, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ImageViewer from './components/ImageViewer';
import getTheme from "../../native-base-theme/components";
import platform from "../../native-base-theme/variables/platform";
import withImagePicker from './components/withImagePicker';
import { graphql, compose } from 'react-apollo';
import TimeAgo from 'javascript-time-ago';
import memoize from 'memoize-one';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import iconicreachFontConfig from '../../messagedialogicons.json';
import { GET_MSG_BY_CAMPAIGN, SEND_MESSAGE, READ_MESSAGE } from "../../api/messages";
import VideoViewer from "./components/VideoViewer";
import FileApi from "../../api/file";
import config from "../../config";

const CustomIcon = createIconSetFromIcoMoon(
    iconicreachFontConfig,
    'msgdialogicons',
    'msgdialogicons.ttf'
);

const CustomAttachButton = withImagePicker(CustomIcon);

export class MessageDialog extends Component {
    static navigationOptions = () => {
        return {
            header: null,
            headerLeft: null,
            headerRight: null
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            scroll: () => { },
            initialized: 0,
            currentMsg: '',
            mediaPostModalVisible: false,
            mediaSendModalVisible: false,
            postMedia: '',
            memoizedMessages: undefined,
            memoizedCampaign: undefined,
            memoizedPerson: undefined,
            serverErrors: false,
            sending: false
        };

        this.keyboardHeight = new Animated.Value(0);
        this.timeAgo = new TimeAgo('en-US')
        this.messageCoords = {}
        this.messageRefs = {}
        this.yOffset = 0;
        this.frameHeight = 0;

        this.fileApi = new FileApi({ url: config.SERVER_URL });
    }

    showMediaPostModal = (mediaItem) => {
        this.setState({
            mediaPostModalVisible: true,
            postMedia: mediaItem
        });
    };

    showImageModal = () => {
        this.setState({
            imageModalVisible: true
        });
    };

    closeImageModal = () => {
        this.setState({ imageModalVisible: false })
    }

    componentDidMount() {
        this._mount = true;
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    }

    componentWillUnmount() {
        this._mount = false;
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
    }

    keyboardWillShow = (event) => {
        Animated.timing(this.keyboardHeight, {
            duration: event.duration,
            toValue: event.endCoordinates.height,
        })
            .start();
        this.content.scrollTo({ x: 0, y: this.yOffset + event.endCoordinates.height, animated: true });
    };

    keyboardWillHide = (event) => {
        Animated.timing(this.keyboardHeight, {
            duration: event.duration,
            toValue: 0,
        })
            .start();
        this.content.scrollTo({ x: 0, y: this.yOffset - event.startCoordinates.height, animated: true });
    };

    onImagePicked = (result) => {
        this.setState({ uploadFile: result, mediaSendModalVisible: true })
    }

    onBackButtonPressed = () => {
        this.props.navigation.goBack();
    }

    renderOutMessage = (msg, i) => {
        return (
            <CardItem key={i} style={styles.outContinueMessage}>
                <Text style={styles.outPostBody}>{msg}</Text>
            </CardItem>
        );
    }

    onChangeMsgText = (text) => {
        this.setState({ currentMsg: text });
    }

    onSend = () => {
        if (this.state.currentMsg) {
            this.setState({ currentMsg: '' })
            this.sendMessageToServer(this.props.navigation.getParam('id', ''),
                this.state.currentMsg, 'text');
        };

    }

    sendMessageToServer = (id, content, type) => {
        this.setState({ sending: true });
        this.props.sendMessage({
            variables: {
                campaign: id,
                messageType: type,
                content: content
            },
            optimisticResponse: {
                __typename: "Mutation",
                sendMessage: {
                    __typename: "MessageType",
                    createdAt: new Date(),
                    id: -1, //local temp id
                    campaign: {
                        __typename: "CampaignType",
                        id: id
                    },
                    message: {
                        __typename: "message",
                        isRead: false,
                        direction: 'out',
                        messageType: type,
                        content: content
                    }
                }
            }
        }).then(response => {
            if (response.data
                && response.data.sendMessage
                && response.data.sendMessage.id) {
                this.setState({ sending: false, serverErrors: false, })
            } else {
                this.setState({ sending: false, serverErrors: true })
            }
        }).catch(error => {
            this.setState({ sending: false, serverErrors: true, })
        })
    }

    sortMemoized = memoize(
        (messages) => messages.sort((a, b) => {
            return parseInt(a.createdAt) - parseInt(b.createdAt)
        })
    );

    renderOutMessagesSpan = (msgs, author, profileThumb, key) => {
        const firstMessage = msgs[0];
        const date = parseInt(firstMessage.createdAt);
        const postDate = this.timeAgo.format(date);
        const continueMessages = msgs.slice(1);

        return (<Card key={key} style={styles.outMessageSpan}>
            <View style={styles.emptySpace}></View>

            <View style={styles.messagesBlock}>
                <View style={styles.firstMessageInBlock}>
                    {this.renderMessage(firstMessage.message, author, true, firstMessage.id)}
                    <Image style={styles.outTick} source={require("../../assets/images/out_msg_tick.png")} />
                </View>
                {continueMessages.map((item, index) =>
                    this.renderMessage(item.message, author, false, item.id))}

            </View>

            <CardItem style={styles.outThumb}>
                {profileThumb ?
                    <Thumbnail

                        style={styles.profileThumb}
                        source={{ uri: profileThumb }}
                    />
                    : <Icon name='account-circle' type='MaterialCommunityIcons'
                        style={[styles.profileThumb, { fontSize: 40 }]}></Icon>
                }
                <Text style={styles.postTime}>{postDate}</Text>
            </CardItem>

        </Card>)
    }

    renderInMessagesSpan = (msgs, author, campaignThumb, key) => {
        const firstMessage = msgs[0];
        const date = parseInt(firstMessage.createdAt);
        const postDate = this.timeAgo.format(date);
        const continueMessages = msgs.slice(1);
        return (
            <Card key={key} style={styles.inMessageSpan}>
                <CardItem style={styles.inThumb}>
                    {campaignThumb ?
                        <Thumbnail

                            style={styles.profileThumb}
                            source={{ uri: campaignThumb }}
                        />
                        : <Icon name='account-circle' type='MaterialCommunityIcons'
                            style={[styles.profileThumb, { fontSize: 40 }]}></Icon>
                    }
                    <Text style={styles.postTime}>{postDate}</Text>
                </CardItem>

                <View style={styles.messagesBlock}>
                    <View style={styles.firstMessageInBlock}>
                        <Image style={styles.outTick} source={require("../../assets/images/in_msg_tick.png")} />
                        {this.renderMessage(firstMessage.message, author, true, firstMessage.id)}
                    </View>
                    {continueMessages.map((item, index) =>
                        this.renderMessage(item.message, author, false, item.id))}
                </View>
                <View style={styles.emptySpace}></View>
            </Card>)
    }

    renderMessage = (msg, author, isFirst, key) => {
        const incoming = msg.direction === 'in';
        if (isFirst) {
            return msg.messageType === 'text' ? (
                <CardItem key={key}
                    ref={m => this.messageRefs[key] = m}
                    onLayout={event => incoming ? this.onMessageLayout(event, msg, key) : null}
                    style={incoming ? styles.inStartMessage : styles.outStartMessage}>
                    <Text style={incoming ? styles.inPostName : styles.outPostName}>
                        {author}
                    </Text>
                    <Text style={incoming ? styles.inPostBody : styles.outPostBody}>{msg.content}</Text>
                </CardItem>)
                : (<CardItem key={key}
                    ref={m => this.messageRefs[key] = m}
                    onLayout={event => incoming ? this.onMessageLayout(event, msg, key) : null}
                    style={incoming ? styles.inStartMessageImage : styles.outStartMessageImage}>
                    <Text style={incoming ? styles.inPostName : styles.outPostName}>
                        {author}
                    </Text>
                    <TouchableOpacity onPress={() => this.showMediaPostModal({ mediaType: msg.messageType, url: msg.content })}>
                        {msg.messageType === 'image' ? <Thumbnail square
                            style={styles.imageThumb}
                            source={{ uri: msg.content }}
                        />
                            : <Icon style={incoming ? styles.videoIconIn : styles.videoIconOut}
                                name="playcircleo" type='AntDesign' />}
                    </TouchableOpacity>
                </CardItem>)
        } else {

            return msg.messageType === 'text' ? (
                <CardItem key={key}
                    ref={m => this.messageRefs[key] = m}
                    onLayout={event => incoming ? this.onMessageLayout(event, msg, key) : null}
                    style={incoming ? styles.inContinueMessage : styles.outContinueMessage}>
                    <Text style={incoming ? styles.inPostBody : styles.outPostBody}>
                        {msg.content}
                    </Text>
                </CardItem>)
                : (<CardItem key={key}
                    ref={m => this.messageRefs[key] = m}
                    onLayout={event => incoming ? this.onMessageLayout(event, msg, key) : null}
                    style={incoming ? styles.inContinueMessageImage : styles.outContinueMessageImage}>
                    <TouchableOpacity onPress={() => this.showMediaPostModal({ mediaType: msg.messageType, url: msg.content })}>
                        {msg.messageType === 'image' ? <Thumbnail square
                            style={styles.imageThumb}
                            resizeMode='cover'
                            source={{ uri: msg.content }}
                        />
                            : <Icon style={incoming ? styles.videoIconIn : styles.videoIconOut}
                                name="playcircleo" type='AntDesign' />}
                    </TouchableOpacity>
                </CardItem>)

        }
    }

    onMessageLayout = ({ nativeEvent: { layout: { lx, ly, width, height } } }, msg, key) => {
        const handle = findNodeHandle(this.messageRefs[key]);
        const scrollView = findNodeHandle(this.content);
        UIManager.measureLayout(
            handle,
            scrollView,
            (e) => { console.error(`Error measuring view in message dialog: ${e}`) },
            (x, y, w, h) => {
                this.messageCoords[key] = { y, h, msg, isRead: msg.isRead };
            });
    }

    onMessageSeen = (msg, id) => {
        this.props.readMessage({
            variables: {
                message: id
            }
        }).then(response => {
            if (response.data
                && response.data.readMessage
                && response.data.readMessage.id) {
                this.setState({ serverErrors: false })
            } else {
                console.log(`Error sending message receipt, response: ${response}`)
                this.setState({ serverErrors: true })
            }
        }).catch(error => {
            console.log(`Error sending message receipt: ${error}`)
            this.setState({ serverErrors: true })
        })
    }

    groupMessages = (messagesByCampaign) => {
        return messagesByCampaign.reduce((acc, v) => {
            const currDirection = v.message.direction;
            const accDirection = acc.length ? acc[acc.length - 1][0].message.direction : null;
            if (accDirection === null || currDirection !== accDirection) {
                acc.push([v]);
                return acc
            } else {
                acc[acc.length - 1].push(v);
                return acc
            }
        }, [])
    }

    renderMessages = (messagesByCampaign, campaign, person) => {
        const grouped = this.groupMessages(messagesByCampaign);
        const inThumb = campaign ? campaign.media.find(i => i.mediaType == 'image').thumbnail : undefined
        const name = `${person.firstName} ${person.lastName}`;
        const outThumb = person.avatar;
        return grouped.map((v, index) => {
            return v[0].message.direction === 'in' ? this.renderInMessagesSpan(v, campaign.title, inThumb, index)
                : this.renderOutMessagesSpan(v, name, outThumb, index)
        })
    }

    static getDerivedStateFromProps = (props, state) => {
        if (!props.data.loading && !props.data.error) {
            return {
                //hack to scroll to end only on first load
                initialized: state.initialized < 2 ? state.initialized + 1 : 2,
                memoizedCampaign: props.data.campaign,
                memoizedMessages: props.data.messagesByCampaign,
                memoizedPerson: props.data.person
            }
        } else
            return null
    }

    onScroll = event => {
        this.yOffset = event.nativeEvent.contentOffset.y;
        this.detectMessageWasSeen();
    }

    detectMessageWasSeen = () => {
        Object.entries(this.messageCoords).forEach(([key, coords]) => {
            if ((coords.y > this.yOffset) && ((coords.y + coords.h) < (this.yOffset + this.frameHeight))) {
                if (!coords.isRead) {
                    coords.isRead = true;
                    this.onMessageSeen(coords.msg, key);
                }
            }
        })
    }

    onUploadFile = async (uploadFile) => {
        const { uri } = uploadFile;
        this.setState({ sending: true });
        const userToken = await SecureStore.getItemAsync('userToken');

        if (userToken) {
            const result = await this.fileApi.uploadFile(userToken, uri);
            if (!this._mount) return;
            if (result.url) {
                this.sendMessageToServer(this.props.navigation.getParam('id', ''),
                    result.url, uploadFile.type === 'image' ? 'image' : 'video')
                this.setState({ mediaSendModalVisible: false, sending: false });
            } else {
                Toast.show({
                    text: 'Could not upload file, try again later',
                    buttonText: 'Ok',
                    duration: 5000
                });
            }
        } else {
            console.log(`Error uploading file: ${error}`)
            this.setState({ serverErrors: true })
        }

    }

    render() {
        const { data: { loading, campaign, messagesByCampaign, person, error, refetch } } = this.props;
        if (this.state.initialized === 1) {
            setTimeout(() => {
                this.content.scrollToEnd({ animated: false });
                this.detectMessageWasSeen()
            })
        }

        return (
            <Root>
                <StyleProvider style={getTheme(platform)}>

                    <Container>

                        <Modal
                            animationType="slide"
                            transparent={false}
                            visible={this.state.mediaPostModalVisible}
                            onRequestClose={() => { }}
                        >
                            {this.state.postMedia ?
                                this.state.postMedia.mediaType == 'video' ?
                                    <VideoViewer
                                        source={{
                                            uri: this.state.postMedia ? this.state.postMedia.url : ''
                                        }}
                                        onClose={() =>
                                            this.setState({ mediaPostModalVisible: false })
                                        } />
                                    : <ImageViewer
                                        source={{
                                            uri: this.state.postMedia ? this.state.postMedia.url : ''
                                        }}
                                        onClose={() =>
                                            this.setState({ mediaPostModalVisible: false })
                                        } />
                                : null}
                        </Modal>

                        <Modal
                            animationType="slide"
                            transparent={false}
                            visible={this.state.mediaSendModalVisible}
                            onRequestClose={() => { }}
                        >
                            {this.state.uploadFile ?
                                this.state.uploadFile.type == 'video' ?
                                    <VideoViewer
                                        source={{
                                            uri: this.state.uploadFile ? this.state.uploadFile.uri : ''
                                        }}
                                        onClose={() =>
                                            this.setState({ mediaSendModalVisible: false })
                                        }
                                        onUpload={() =>
                                            this.onUploadFile(this.state.uploadFile)
                                        }
                                        uploading={this.state.sending} />
                                    : <ImageViewer
                                        source={{
                                            uri: this.state.uploadFile ? this.state.uploadFile.uri : ''
                                        }}
                                        onClose={() =>
                                            this.setState({ mediaSendModalVisible: false })
                                        }
                                        onUpload={() =>
                                            this.onUploadFile(this.state.uploadFile)
                                        }
                                        uploading={this.state.sending} />
                                : null}
                        </Modal>

                        <Header transparent style={styles.header}>

                            <Left style={styles.backView}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={this.onBackButtonPressed}>
                                    <CustomIcon
                                        name="back"
                                        size={14}
                                        style={styles.backIcon}
                                    />
                                </TouchableOpacity>

                            </Left>

                            <Body style={styles.dialogTitleBody}>
                                {!loading && campaign ?
                                    <Thumbnail
                                        style={styles.dialogThumb}
                                        source={{
                                            uri: campaign ? campaign.media.find(i => i.mediaType == 'image').thumbnail : undefined
                                        }}
                                    />
                                    : this.state.memoizedCampaign ?
                                        <Thumbnail
                                            style={styles.dialogThumb}
                                            source={{
                                                uri: this.state.memoizedCampaign ? this.state.memoizedCampaign.media.find(i => i.mediaType == 'image').thumbnail : undefined
                                            }}
                                        />
                                        : null
                                }
                                <Text style={styles.dialogTitle}>
                                    {this.props.navigation.getParam('title', '')}
                                </Text>
                            </Body>

                            <Right style={{ marginLeft: 50 }}>
                                <CustomIcon
                                    size={24}
                                    name="menu-more"
                                    style={styles.menuIcon}
                                />
                            </Right>

                        </Header>
                        <ScrollView style={styles.content}
                            ref={c => (this.content = c)}
                            onLayout={event => {
                                this.frameHeight = event.nativeEvent.layout.height;
                            }}
                            onContentSizeChange={(contentWidth, contentHeight) => {
                                this.contentHeight = contentHeight;
                                const maxOffset = this.contentHeight - this.frameHeight;
                                if (this.yOffset > maxOffset - 350) {
                                    this.content.scrollToEnd({ animated: true });
                                }
                            }}
                            scrollEventThrottle={50}
                            onScroll={this.onScroll}
                            onScrollEndDrag={this.onScroll}
                        >
                            {!error ? !loading && messagesByCampaign ?
                                this.renderMessages(this.sortMemoized(messagesByCampaign), campaign, person)
                                : this.state.memoizedCampaign ?
                                    this.renderMessages(this.sortMemoized(this.state.memoizedMessages), this.state.memoizedCampaign, this.state.memoizedPerson)
                                    : <Spinner color='#FF0091' />
                                : <Text style={styles.errorText}>Network error, please try again later</Text>}

                        </ScrollView>

                        <Animated.View style={{ paddingBottom: this.keyboardHeight }}>
                            <Footer style={styles.footer}>
                                <Form >
                                    <Item searchBar style={styles.inputMain}>

                                        <Item style={styles.inputItem}>

                                            <CustomAttachButton
                                                name="attach"
                                                size={31}
                                                style={{ color: "black" }}
                                                onImagePicked={this.onImagePicked}
                                            />

                                            <Input placeholder="Type your message"
                                                placeholderTextColor='#a8a8a8'
                                                style={styles.msgInput}
                                                onChangeText={this.onChangeMsgText}
                                                value={this.state.currentMsg}
                                            />
                                            <Button transparent onPress={this.onSend}>
                                                <CustomIcon name='send' size={18} color='#FF0091' />
                                            </Button>

                                        </Item>

                                    </Item>

                                </Form>
                            </Footer>
                        </Animated.View>
                    </Container>
                </StyleProvider>
            </Root>
        );
    }
}

const styles = StyleSheet.create({
    backButton: {
        width: 58,
        height: 98,
        marginLeft: -10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        alignSelf: 'center',
        textAlign: 'center',
    },
    videoIconIn: {
        color: 'black',
        fontSize: 60,
        width: '100%',
        alignSelf: 'center',
        textAlign: 'center',
        left: '35%'
    },
    videoIconOut: {
        color: 'white',
        fontSize: 60,
        width: '100%',
        alignSelf: 'center',
        textAlign: 'center',
        right: '35%'
    },
    outTick: {

    },
    footer: {
        backgroundColor: '#FFFFFF',
        height: 75
    },
    header: { justifyContent: 'flex-start' },
    backIcon: { color: "black" },
    backView: {
        flexDirection: 'row',
        width: 18,
        justifyContent: "flex-start",
        alignItems: "center",
    },
    dialogTitleBody: {
        flexDirection: 'row',
        alignItems: "center",
        flex: 16
    },
    dialogThumb: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    dialogTitle: {
        fontFamily: 'Poppins-Bold',
        fontWeight: "bold",
        fontSize: 24,
        paddingLeft: 12
    },
    menuIcon: { color: "black", paddingRight: 8 },
    inputMain: {
        marginLeft: 0,
        paddingLeft: 23,
        paddingRight: 23,
        borderBottomWidth: 0
    },
    firstMessageInBlock: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    content: {
        backgroundColor: '#EBF1FD'
    },
    msgInput: {
        flex: 1,
        fontFamily: 'Poppins-Regular', fontSize: 14
    },
    profileThumb: {
        height: 40,
        width: 40,
        borderRadius: 20,
    },
    inThumb: {
        backgroundColor: "transparent",
        flexDirection: 'column',
        paddingLeft: 0,
        paddingTop: 0,
        paddingRight: 10,

    },
    outThumb: {
        backgroundColor: "transparent",
        flexDirection: 'column',
        paddingLeft: 10,
        paddingTop: 0,
        paddingRight: 0,

    },
    messagesBlock: {
        flexDirection: 'column',
        flex: 4
    },
    postTime: {
        color: '#b2b2b2',
        fontFamily: 'Poppins-Regular',
        fontSize: 9,
        letterSpacing: 1,
        textAlign: 'center',
        lineHeight: 18,
        width: 45
    },
    inPostName: {
        color: '#808080',
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        letterSpacing: 1.25,
        textAlign: 'center',
        lineHeight: 18
    },
    outPostName: {
        color: '#bfbfbf',
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        letterSpacing: 1.25,
        textAlign: 'center',
        lineHeight: 18
    },
    inPostBody: {
        fontSize: 14,
        color: '#000000',
        letterSpacing: 0,
        lineHeight: 18
    },
    outPostBody: {
        fontSize: 14,
        color: '#FFFFFF',
        letterSpacing: 0,
        lineHeight: 18,
        textAlign: 'right'
    },
    inStartMessage: {
        flex: 3,
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 16,
        marginBottom: 2,
        borderRadius: 0,
        alignItems: 'flex-start'
    },
    inStartMessageImage: {
        flex: 3,
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        paddingTop: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 8,
        marginBottom: 2,
        borderRadius: 0,
        alignItems: 'flex-start'
    },
    inContinueMessage: {
        flex: 3,
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 16,
        marginBottom: 2,
        borderRadius: 0,
        marginLeft: 6,
        alignItems: 'flex-start'
    },
    inContinueMessageImage: {
        flex: 3,
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        paddingTop: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 8,
        marginBottom: 2,
        borderRadius: 0,
        marginLeft: 6,
        alignItems: 'flex-start'
    },
    outStartMessage: {
        flex: 3,
        backgroundColor: '#FF0091',
        flexDirection: 'column',
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 16,
        marginBottom: 2,
        borderRadius: 0,
        alignItems: 'flex-end'
    },
    outStartMessageImage: {
        flex: 3,
        backgroundColor: '#FF0091',
        flexDirection: 'column',
        paddingTop: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 8,
        marginBottom: 2,
        borderRadius: 0,
        alignItems: 'flex-end'
    },
    outContinueMessage: {
        flex: 3,
        backgroundColor: '#FF0091',
        flexDirection: 'column',
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 16,
        marginBottom: 2,
        borderRadius: 0,
        marginRight: 6,
        alignItems: 'flex-end'
    },
    outContinueMessageImage: {
        flex: 3,
        backgroundColor: '#FF0091',
        flexDirection: 'column',
        paddingTop: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 8,
        marginBottom: 2,
        borderRadius: 0,
        marginRight: 6,
        alignItems: 'flex-end'
    },
    emptySpace: {
        flex: 1
    },
    inMessageSpan: {
        backgroundColor: "transparent",
        flexDirection: 'row',
        marginTop: 16,
        marginLeft: 23,
        marginRight: 12,
        marginBottom: 0,
        borderWidth: 0,
        shadowColor: null,
        shadowOffset: null,
        shadowOpacity: null,
        shadowRadius: null,
        elevation: null,
        borderRadius: 0,
        borderColor: "transparent",
    },
    outMessageSpan: {
        backgroundColor: "transparent",
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        marginLeft: 23,
        marginRight: 9,
        marginBottom: 0,
        borderWidth: 0,
        borderWidth: 0,
        shadowColor: null,
        shadowOffset: null,
        shadowOpacity: null,
        shadowRadius: null,
        elevation: null,
        borderRadius: 0,
        borderColor: "transparent",
    },
    imageThumb: {
        height: 204,
        width: 204,
        marginBottom: 8
    },
    inputItem: {
        borderBottomWidth: 2,
    }
})

export default
    compose(
        graphql(GET_MSG_BY_CAMPAIGN, {
            options: (props) => ({
                notifyOnNetworkStatusChange: true,
                fetchPolicy: "cache-and-network",
                pollInterval: 1000,
                variables: {
                    id: props.navigation.getParam('id', '')
                },
            })
        }),
        graphql(SEND_MESSAGE, {
            name: 'sendMessage',
            options: (props) => ({
                notifyOnNetworkStatusChange: true,
                variables: {
                    campaign: '',
                    messageType: '',
                    content: ''
                },
                update: (cache, { data: { sendMessage } }) => {
                    const data = cache.readQuery({
                        query: GET_MSG_BY_CAMPAIGN,
                        variables: {
                            id: props.navigation.getParam('id', '')
                        }
                    });
                    data.messagesByCampaign.push(sendMessage);
                    cache.writeQuery({
                        query: GET_MSG_BY_CAMPAIGN,
                        variables: {
                            id: props.navigation.getParam('id', '')
                        },
                        data: data
                    });
                },
            })
        }),
        graphql(READ_MESSAGE, {
            name: 'readMessage',
            options: (props) => ({
                notifyOnNetworkStatusChange: true,
                variables: {
                    message: '',
                }
            })
        })
    )(MessageDialog);
