import React, { Component } from "react";

import {
  Body,
  Text,
  StyleProvider,
  Grid,
  Row,
  Col,
  Thumbnail,
  Button,
  Form,
  Input,
  ActionSheet,
  Root,
  Spinner,
  Toast
} from "native-base";
import { ImagePicker, SecureStore } from "expo";
import { StyleSheet, Modal, Clipboard } from "react-native";

import getTheme from "../../../../../native-base-theme/components";
import platform from "../../../../../native-base-theme/variables/platform";
import PublishSuccess from "../modal/PublishSuccess";
import withImagePicker from '../../withImagePicker';
import FileApi from "../../../../../api/file";
import config from "../../../../../config";
import { SUBMIT_POST_VERIFICATION } from "../../../../../api/posts";
import { graphql } from "react-apollo";

const CustomPickerButton = withImagePicker(Button);

export class PublishForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      successModalVisible: false,
      uploading: false,
      uploadFile: null,
    };
    this.fileApi = new FileApi({ url: config.SERVER_URL });
  }

  onImagePicked = (result) => {
    this.setState({ uploadFile: result.uri });
  }

  validateUrl = (text) => {
    let pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
    return pattern.test(String(text).toLowerCase())
  }

  onPublishPost = async () => {
    this.setState({ submittedPost: true })
    if (this.validateUrl(this.state.postUrl)) {
      this.setState({
        valid: true, uploading: true, submittedPost: true
      });
      const result = await this.submitPostVerificationToServer();
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
        valid: false
      });
    }
  };

  onPublishStory = async () => {
    if (!this.state.uploadFile) return;
    this.setState({ uploading: true });
    const screenshot = await this.uploadScreenshot(this.state.uploadFile);
    if (!this._mount) return;

    if (screenshot.url) {
      this.setState({
        valid: true, uploading: true
      });
      const result = await this.submitPostVerificationToServer(screenshot.url);
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

  uploadScreenshot = async (uploadFileUri) => {
    const userToken = await SecureStore.getItemAsync('userToken');

    if (userToken) {
      const result = await this.fileApi.uploadFile(userToken, uploadFileUri);
      if (result.url) {
        return result;
      } else {
        Toast.show({
          text: 'Could not upload screenshot, try again later',
          buttonText: 'Ok',
          duration: 5000
        });
        return result;
      }
    } else {
      console.log(`Error uploading screenshot, userToken not found`)
      return { error: 'userToken not found' }
    }
  }

  submitPostVerificationToServer = async (screenshot) => {

    const variables = {
      variables: {
        url: screenshot ? screenshot : this.state.postUrl,
        post: this.props.post.id
      }
    }

    this.setState({ uploading: true })
    try {
      const response = await this.props.submitPostVerification(variables);
      if (!this._mount) return;
      if (response.data
        && response.data.submitPostVerification
        && response.data.submitPostVerification.id) {
        this.setState({ uploading: false, serverErrors: false, });
        return response.data.submitPostVerification;
      } else {
        this.setState({ serverErrors: true, uploading: false })
        return response.data.submitPostVerification;
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
    const { post } = this.props
    return (
      <Root>
        <StyleProvider style={getTheme(platform)}>
          <Body>
            <Grid style={{ marginBottom: 12 }}>
              <Row>
                <Col style={{ width: "auto", justifyContent: "center" }}>
                  <Thumbnail
                    square
                    source={{
                      uri: post.mediaContent
                    }}
                    style={{
                      width: 121,
                      height: 121
                    }}
                  />
                </Col>
                <Col
                  style={{
                    justifyContent: "center"
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      lineHeight: 22,
                      opacity: 0.8
                    }}
                  >
                    {post.textContent}
                  </Text>
                </Col>
              </Row>
            </Grid>
            <Grid
              style={{
                borderTopWidth: 1,
                borderTopColor: "#EBF1FD",
                paddingTop: 12,
                paddingBottom: 12
              }}
            >
              <Row>
                <Text
                  style={{
                    marginLeft: 0
                  }}
                >
                  Please use the following link in bio:
                </Text>
              </Row>
              <Row
                style={{
                  paddingTop: 12
                }}
              >
                <Col
                  size={8}
                  style={{
                    backgroundColor: "#EBF1FD",
                    height: 32,
                    paddingLeft: 12,
                    paddingTop: 7,
                    paddingBottom: 8
                  }}
                >
                  <Text
                    style={{
                      color: "#2590DC",
                      fontSize: 12
                    }}
                  >
                    {post.bioLink}
                  </Text>
                </Col>
                <Col size={2}>
                  <Button
                    style={{
                      width: 72,
                      height: 32,
                      backgroundColor: "#25DCDC"
                    }}
                    onPress={() => Clipboard.setString(post.bioLink)}
                  >
                    <Text
                      style={{
                        fontSize: 12
                      }}
                    >
                      Copy
                    </Text>
                  </Button>
                </Col>
              </Row>
              <Row
                style={{
                  paddingTop: 22
                }}
              >
                <Text
                  style={{
                    marginLeft: 0
                  }}
                >
                  Please publish at:
                </Text>
              </Row>
              <Row
                style={{
                  marginTop: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#EBF1FD"
                }}
              >
                <Text
                  style={{
                    lineHeight: 56,
                    fontSize: 14
                  }}
                >
                  {new Date(parseInt(post.postDate)).toDateString()}
                </Text>
              </Row>
              <Row
                style={{
                  marginTop: 25,
                  borderWidth: 1,
                  borderColor: "#FF0091"
                }}
              >
                <Form>
                  {this.state.submittedPost && !this.validateUrl(this.state.postUrl) ?
                    <Text style={styles.errorCaptionText}>Please, enter valid url</Text>
                    : null}
                  <Row
                    style={{
                      marginLeft: 16,
                      marginRight: 16
                    }}
                  >
                    <Input
                      placeholder="Enter Post URL"
                      style={{
                        fontSize: 14,
                        letterSpacing: -0.2,
                        borderBottomWidth: 1
                      }}
                      onChangeText={text => this.setState({ postUrl: text })}
                      value={this.state.postUrl}
                    />
                  </Row>
                  <Row
                    style={{
                      marginTop: 24
                    }}
                  >
                    {!this.state.uploading ? <Button
                      block
                      style={{
                        width: "100%",
                        marginLeft: 0,
                        marginRight: 0
                      }}
                      onPress={() => this.onPublishPost()}
                    >
                      <Text>Publish!</Text>
                    </Button>
                      : <Spinner style={{
                        width: "100%",
                        marginLeft: 0,
                        marginRight: 0
                      }} color='#FF0091' />
                    }
                  </Row>
                </Form>
              </Row>
              <Row
                style={{
                  paddingTop: 24,
                  marginTop: 36,
                  borderWidth: 1,
                  borderColor: "#FF0091"
                }}
              >
                <Form>
                  <Row>
                    <Col
                      style={{
                        width: "auto"
                      }}
                    >
                      <CustomPickerButton
                        block
                        style={styles.addBtn}
                        onImagePicked={this.onImagePicked}
                        allowsEditing={false}
                      >
                        {this.state.uploadFile ? (
                          <Thumbnail square source={{ uri: this.state.uploadFile }} />
                        ) : (
                            <Text
                              style={{
                                color: "#FF0091"
                              }}
                            >
                              +
                          </Text>
                          )}
                      </CustomPickerButton>
                    </Col>
                    <Col
                      style={{
                        justifyContent: "center",
                        marginLeft: 15
                      }}
                    >
                      <Text>Please upload a story screenshot</Text>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      marginTop: 24
                    }}
                  >
                    {!this.state.uploading ? <Button
                      block
                      style={{
                        width: "100%",
                        marginLeft: 0,
                        marginRight: 0
                      }}
                      onPress={() => this.onPublishStory()}
                    >
                      <Text>Publish!</Text>
                    </Button>
                      : <Spinner style={{
                        width: "100%",
                        marginLeft: 0,
                        marginRight: 0
                      }} color='#FF0091' />
                    }
                  </Row>
                </Form>
              </Row>
            </Grid>
            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.successModalVisible}
              onRequestClose={() => {
              }}>
              <PublishSuccess onClose={() => this.setState({ successModalVisible: false })} />
            </Modal>
          </Body>
        </StyleProvider>
      </Root >
    );
  }
}

const styles = StyleSheet.create({
  errorCaptionText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#FF0000',
    letterSpacing: -0.17,
    textAlign: 'center',
    paddingLeft: 60,
    paddingRight: 60
  },
  addBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#EBF1FD",
    marginRight: 7,
    justifyContent: "center"
  }
});

export default graphql(SUBMIT_POST_VERIFICATION, {
  name: 'submitPostVerification',
  options: (props) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      post: '',
      url: '',
    }
  })
})(PublishForm);
