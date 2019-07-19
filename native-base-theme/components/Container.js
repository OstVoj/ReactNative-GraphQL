// @flow

import { Platform, Dimensions } from "react-native";

import variable from "./../variables/platform";
import { withOrientation } from "react-navigation";

const deviceHeight = Dimensions.get("window").height;
export default (variables /*: * */ = variable) => {
  const theme = {
    '.pinkContainer': {
      backgroundColor: '#A556F6',
      'NativeBase.Header': {
        'NativeBase.Body': {
          'NativeBase.Title': {
            color: 'white'
          }
        },
        'NativeBase.Right': {
          'NativeBase.Button.transparent': {
            'NativeBase.Icon': {
              color: 'white'
            },
            'NativeBase.IconNB': {
              color: 'white'
            }
          }
        }
      }

    },
    flex: 1,
    height: Platform.OS === "ios" ? deviceHeight : deviceHeight - 20,
    backgroundColor: variables.containerBgColor
  };

  return theme;
};
