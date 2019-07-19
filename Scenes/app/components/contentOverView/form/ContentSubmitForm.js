import React, { Component } from "react";

import {
  Text,
  StyleProvider,
  Grid,
  Row,
  Thumbnail,
  Button,
  Icon,
  View,
  ActionSheet,
  Col,
  Input,
  Root,
  Spinner,
  Toast
} from "native-base";

import { Dimensions, StyleSheet, Modal } from "react-native";
import { ImagePicker, Video, SecureStore } from "expo";
import SubmitSuccess from "../modal/SubmitSuccess";
import TimeAgo from 'javascript-time-ago'

import getTheme from "../../../../../native-base-theme/components";
import platform from "../../../../../native-base-theme/variables/platform";
import withImagePicker from '../../withImagePicker';
import { graphql } from "react-apollo";
import { SUBMIT_CONTENT } from "../../../../../api/posts";
import FileApi from "../../../../../api/file";
import config from "../../../../../config";

const CustomPickerButton = withImagePicker(Button);

const deviceWidth = Dimensions.get("window").width;

export class ContentSubmitForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      caption:
        props.post.textContent ? props.post.textContent : '',
      media: props.post.mediaContent ? props.post.mediaContent : '',
      mediaType: props.post.postType ? props.post.postType : '',
      successModalVisible: false,
      uploading: false,
      uploadFile: null
    };
    this.timeAgo = new TimeAgo('en-US');

    this.fileApi = new FileApi({ url: config.SERVER_URL });
  }

  onImagePicked = (result) => {
    this.setState({ media: result.uri, mediaType: result.type, uploadFile: result.uri });
  }

  onSubmit = () => {
    this.setState({
      successModalVisible: true
    });
  };

  renderImage = () => {
    const { media, mediaType } = this.state;
    return media ? (
      <View
        style={{
          width: deviceWidth - 110,
          height: deviceWidth - 110
        }}
      >
        {mediaType === 'image' ?
          <Thumbnail
            square
            source={{
              uri: media
            }}
            style={{
              width: deviceWidth - 110,
              height: deviceWidth - 110
            }}
          />
          : mediaType === 'video' ?
            <Video
              source={{ uri: media }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="cover"
              shouldPlay
              isLooping
              useNativeControls
              style={{
                width: deviceWidth - 110,
                height: deviceWidth - 110
              }}
            />
            : <Text>Unrecognized content type</Text>
        }
        <Button
          block
          style={{
            backgroundColor: "#FF0000",
            width: 72,
            height: 32,
            marginLeft: 0,
            marginRight: 0,
            left: deviceWidth - 182,
            top: -(deviceWidth - 110)
          }}
          onPress={() => {
            this.setState({
              media: null
            });
          }}
        >
          <Text
            style={{
              fontSize: 12,
              paddingLeft: 0,
              paddingRight: 0
            }}
          >
            Remove
          </Text>
        </Button>
      </View>
    ) : (
        <CustomPickerButton
          style={{
            flexDirection: "column",
            backgroundColor: "#EBF1FD",
            width: deviceWidth - 110,
            height: deviceWidth - 110,
            justifyContent: "center",
            alignSelf: 'center'
          }}
          allowsEditing={false}
          onImagePicked={this.onImagePicked}
        >
          <Thumbnail
            square
            source={require("../../../../../assets/images/addBtn.png")}
            style={{
              width: 74,
              height: 74
            }}
          />
          <Text style={{ color: "#FF0091", marginTop: 22 }}>
            Add an Image or Video
        </Text>
        </CustomPickerButton>
      );
  };

  onSubmitContent = async () => {
    if (!this.state.media) {
      Toast.show({
        text: 'Please select image or video to submit',
        buttonText: 'Ok',
        duration: 5000
      });
      return;
    }

    this.setState({ uploading: true });
    const mediaUrl = !this.state.uploadFile ? this.state.media
      :
      (await this.uploadMedia(this.state.uploadFile)).url

    if (!this._mount) return;

    if (mediaUrl) {
      this.setState({
        valid: true, uploading: true
      });
      const result = await this.submitContentToServer(mediaUrl);
      if (!this._mount) return;
      if (result && result.id) {
        this.setState({
          successModalVisible: true
        });
      } else {
        this.setState({
          valid: false
        });
      }
    } else {
      this.setState({
        valid: false,
        uploading: false,
      });
    }
  };

  uploadMedia = async (uploadFileUri) => {
    try {
      const userToken = await SecureStore.getItemAsync('userToken');

      if (userToken) {
        const result = await this.fileApi.uploadFile(userToken, uploadFileUri);
        if (result.url) {
          return result;
        } else {
          Toast.show({
            text: 'Could not upload post image, try again later',
            buttonText: 'Ok',
            duration: 5000
          });
          return result;
        }
      } else {
        console.log(`Error uploading post image, userToken not found`)
        return { error: 'userToken not found' }
      }
    }
    catch (e) {
      Toast.show({
        text: 'Could not upload post image, try again later',
        buttonText: 'Ok',
        duration: 5000
      });
      console.log(`Error uploading post image, secure storage error: ${e}`)
      return { error: `Error uploading post image, secure storage error: ${e}` }
    }
  }

  submitContentToServer = async (url) => {

    const variables = {
      variables: {
        post: this.props.post.id,
        mediaContent: url,
        postType: this.state.mediaType,
        textContent: this.state.caption
      }
    }

    this.setState({ uploading: true })
    try {
      const response = await this.props.submitContent(variables);
      if (response.data
        && response.data.submitContent
        && response.data.submitContent.id) {
        this.setState({ uploading: false, serverErrors: false, });

        return response.data.submitContent;
      } else {
        this.setState({ serverErrors: true, uploading: false })
        return response.data.submitContent;
      }
    } catch (error) {
      console.log(`Error while submitting post verification request: ${error}`)
      this.setState({ serverErrors: true, uploading: false })
      return { error: `Server request error: ${error}` };
    }

  }

  componentDidMount() {
    this._mount = true;
  }

  componentWillUnmount() {
    this._mount = false;
  }

  render() {
    const { caption } = this.state;
    const { post } = this.props;
    const date = this.timeAgo.format(parseInt(post.postDate));
    return (
      <Root>
        <StyleProvider style={getTheme(platform)}>
          <Grid>
            {post.status !== 'declined' ? (
              <Row style={styles.publicationDate}>
                <Grid>
                  <Col size={7} style={{ justifyContent: "center" }}>
                    <Text>Publication Date</Text>
                  </Col>
                  <Col
                    size={3}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end"
                    }}
                  >
                    <Text style={{ color: "#FF0091" }}>{date}</Text>
                    <Icon
                      type="Ionicons"
                      name="ios-arrow-forward"
                      style={{
                        color: "#000000",
                        marginLeft: 10,
                        marginRight: 0
                      }}
                    />
                  </Col>
                </Grid>
              </Row>
            )
              : null}
            {post.status === 'declined' ?
              <Grid
                style={{
                  borderColor: "#FF0000",
                  borderWidth: 1,
                  borderTopWidth: 0,
                  paddingTop: 24,
                  paddingBottom: 24,
                  marginTop: -14,
                  marginHorizontal: -16
                }}
              >
                <Row
                  size={25}
                  style={{
                    justifyContent: "center"
                  }}
                >
                  <Text style={{ color: "#FF0000", fontSize: 12 }}>
                    Post Declined
                                </Text>
                </Row>
                <Row
                  size={40}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                  }}
                >
                  <Grid>
                    <Row style={{ paddingHorizontal: 25, justifyContent: "center", alignItems: 'center' }}>
                      <Text style={{ textAlign: 'center', fontSize: 14 }}>
                        {post.comment}
                      </Text>
                    </Row>
                  </Grid>
                </Row>
              </Grid>
              : null
            }
            <Row
              style={{
                justifyContent: "center"
              }}
            >
              {this.renderImage()}
            </Row>
            <Row
              style={{
                justifyContent: "center",
                marginTop: 6
              }}
            >
            </Row>
            <Row
              style={{
                borderBottomColor: "grey",
                borderBottomWidth: 1,
                marginTop: 24,
                paddingBottom: 10,
                marginLeft: 10,
                marginRight: 10
              }}
            >
              <Input
                multiline={true}
                value={caption}
                onChangeText={value => this.setState({ caption: value })}
                placeholder="Add a Caption"
              />
            </Row>
            <Row
              block
              style={{
                marginTop: 24
              }}
            >
              {this.state.uploading ?
                <Spinner style={{
                  width: "100%",
                  marginLeft: 0,
                  marginRight: 0
                }} color='#FF0091' />
                : <Button
                  block
                  style={{
                    width: "100%",
                    marginLeft: 0,
                    marginRight: 0
                  }}
                  onPress={() => this.onSubmitContent()}
                >
                  <Text
                    style={{
                      justifyContent: "center"
                    }}
                  >
                    {post.status === 'declined' ? "Submit Again" : "Submit"}
                  </Text>
                </Button>
              }
            </Row>
            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.successModalVisible}
              onRequestClose={() => { }}
            >
              <SubmitSuccess
                onClose={() => this.setState({ successModalVisible: false })}
              />
            </Modal>
          </Grid>
        </StyleProvider>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  addBtn: {
    width: (deviceWidth - 130) / 5,
    height: (deviceWidth - 130) / 5,
    backgroundColor: "#EBF1FD",
    marginRight: 5,
    justifyContent: "center"
  },
  publicationDate: {
    marginLeft: 16,
    marginRight: 16,
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1
  }
});

export default graphql(SUBMIT_CONTENT, {
  name: 'submitContent',
  options: (props) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      post: '',
      mediaContent: '',
      postType: '',
      textContent: ''
    }
  })
})(ContentSubmitForm);
