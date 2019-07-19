// @flow

import variable from "./../variables/platform";

export default (variables /*: * */ = variable) => {
  const contentTheme = {
    '.pinkContent': {
      padding: 20,
      backgroundColor: '#A556F6'
    },
    '.padded': {
      padding: 20,
    },
    flex: 1,
    backgroundColor: "transparent",
    "NativeBase.Segment": {
      borderWidth: 0,
      backgroundColor: "transparent"
    }
  };

  return contentTheme;
};
