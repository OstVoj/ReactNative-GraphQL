import React, { Component } from "react";

import {
  Text,
  StyleProvider,
  Grid,
  Row,
  Col,
  Thumbnail,
  Button,
  Icon,
  View,
  Input,
  ActionSheet,
  Root
} from "native-base";

import { Dimensions, Modal } from "react-native";
import { ImagePicker } from "expo";
import SubmitSuccess from "../modal/SubmitSuccess";

const deviceWidth = Dimensions.get("window").width;

import getTheme from "../../../../../native-base-theme/components";
import platform from "../../../../../native-base-theme/variables/platform";
import withImagePicker from '../../withImagePicker';

const CustomPickerButton = withImagePicker(Button);

export class SubmitStoryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      successModalVisible: false
    };
  }

  onImagePicked = (result) => {
    this.setState({ image: result.uri });
  }

  onSubmit = () => {
    this.setState({
      successModalVisible: true
    });
  };

  renderImage = () => {
    const { image } = this.state;
    return image ? (
      <View
        style={{
          width: deviceWidth - 110,
          height: deviceWidth - 110
        }}
      >
        <Thumbnail
          square
          source={{
            uri: image
          }}
          style={{
            width: deviceWidth - 110,
            height: deviceWidth - 110
          }}
        />
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
              image: null
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
          justifyContent: "center"
        }}
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

  render() {
    return (
      <Root>
        <StyleProvider style={getTheme(platform)}>
          <Grid>
            <Row
              style={{
                justifyContent: "center"
              }}
            >
              {this.renderImage()}
            </Row>
            <Row
              block
              style={{
                marginTop: 24
              }}
            >
              <Button
                block
                style={{
                  width: "100%",
                  marginLeft: 0,
                  marginRight: 0
                }}
                onPress={() => this.onSubmit()}
              >
                <Text
                  style={{
                    justifyContent: "center"
                  }}
                >
                  Submit
                </Text>
              </Button>
            </Row>
            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.successModalVisible}
              onRequestClose={() => {}}
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

export default SubmitStoryForm;
