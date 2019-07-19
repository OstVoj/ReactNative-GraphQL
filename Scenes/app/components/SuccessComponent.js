import React, { Component } from "react";

import { Text, Button, View, Thumbnail } from "native-base";
import { Dimensions, StyleSheet } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export class SuccessComponent extends Component {

    /**
     * Success Component
     *
     * @param {Function} onClose callback on close
     * @param {String} messageText main form text
     * @param {String} closeText close button caption
     */

  render() {
    const { onClose, messageText, closeText } = this.props;

    return (
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <View style={styles.subMessageContainer}>
            <Thumbnail
              square
              source={require("../../../assets/images/check.png")}
              style={styles.checkImg}
            />
            <Text style={styles.successMessage}>{messageText}</Text>
          </View>
          <Button style={styles.thanksBtn} onPress={() => onClose()}>
            <Text style={styles.thanksTxt}>{closeText}</Text>
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  messageContainer: {
    width: deviceWidth - 60,
    height: deviceWidth - 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: deviceHeight / 2 - deviceWidth
  },
  subMessageContainer: {
    height: deviceWidth - 60 - 64,
    alignItems: "center",
    justifyContent: "center"
  },
  successMessage: {
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 25,
    marginTop: 34,
    paddingLeft: 60,
    paddingRight: 60
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

export default SuccessComponent;
