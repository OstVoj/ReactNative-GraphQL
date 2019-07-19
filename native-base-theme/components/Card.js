// @flow

import variable from "./../variables/platform";

export default (variables /*: * */ = variable) => {
  const cardTheme = {
    ".transparent": {
      shadowColor: null,
      shadowOffset: null,
      shadowOpacity: null,
      shadowRadius: null,
      elevation: null,
      backgroundColor: "transparent",
      borderWidth: 0
    },
    ".noShadow": {
      shadowColor: null,
      shadowOffset: null,
      shadowOpacity: null,
      elevation: null
    },
    ".messages": {
      paddingVertical: 14,
      paddingHorizontal: 25,
    },
    ".profileCard": {
      backgroundColor: '#fff',
      height: 92,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 1
    },
    marginVertical: 0,  //5
    marginHorizontal: 0,  //2, 
    marginBottom: 5, //no
    borderWidth: variables.borderWidth,
    borderRadius: variables.cardBorderRadius,
    borderColor: variables.cardBorderColor,
    flexWrap: "nowrap",
    backgroundColor: variables.cardDefaultBg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3
  };

  return cardTheme;
};
