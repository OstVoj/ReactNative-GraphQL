import React, { Component } from "react";

import {
  Container,
  Header,
  Title,
  Content,
  Left,
  Body,
  Text,
  StyleProvider,
  Right,
  Icon,
  Button,
  View,
  Thumbnail
} from "native-base";
import { Dimensions, StyleSheet } from "react-native";

import getTheme from "../../../../../native-base-theme/components";
import platform from "../../../../../native-base-theme/variables/platform";

const deviceWidth = Dimensions.get("window").width;

export class PublishSuccess extends Component {
  render() {
    const { onClose } = this.props;

    return (
      <StyleProvider style={getTheme(platform)}>
        <Container style={styles.container}>
          <Header transparent>
            <Left />
            <Body style={{ flex: 3 }}>
              <Title style={styles.title}>Publish</Title>
            </Body>
            <Right>
              <Button transparent onPress={() => onClose()}>
                <Icon
                  name="md-close"
                  type="Ionicons"
                  style={styles.closeIcon}
                />
              </Button>
            </Right>
          </Header>
          <Content
            padder
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <View style={styles.messageContainer}>
              <View style={styles.subMessageContainer}>
                <Thumbnail
                  square
                  source={require("../../../../../assets/images/check.png")}
                  style={styles.checkImg}
                />
                <Text style={styles.successMessage}>
                  Successfully Published!
                </Text>
              </View>
              <Button style={styles.thanksBtn} onPress={() => onClose()}>
                <Text style={styles.thanksTxt}>Thanks!</Text>
              </Button>
            </View>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#A556F6"
  },
  title: {
    color: "#FFFFFF"
  },
  closeIcon: {
    color: "#FFFFFF"
  },
  messageContainer: {
    width: deviceWidth - 60,
    height: deviceWidth - 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between"
  },
  subMessageContainer: {
    height: deviceWidth - 60 - 64,
    alignItems: "center",
    justifyContent: "center"
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 25,
    marginTop: 34
  },
  thanksBtn: {
    width: "100%",
    height: 64,
    justifyContent: "center",
    backgroundColor: "#25DC85"
  },
  checkImg: {
    width: 71,
    height: 61
  }
});

export default PublishSuccess;
