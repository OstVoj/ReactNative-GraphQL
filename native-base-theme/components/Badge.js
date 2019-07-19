// @flow

import variable from "./../variables/platform";

export default (variables /*: * */ = variable) => {
  const badgeTheme = {
    ".primary": {
      backgroundColor: variables.btnPrimaryBg
    },
    ".warning": {
      backgroundColor: variables.btnWarningBg
    },
    ".info": {
      backgroundColor: variables.btnInfoBg
    },
    ".success": {
      backgroundColor: variables.btnSuccessBg
    },
    ".danger": {
      backgroundColor: variables.btnDangerBg
    },
    "NativeBase.Text": {
      position: 'absolute',
      fontFamily: 'Poppins-Bold',
      color: variables.badgeColor,
      fontSize: 14,
      textAlign: 'center',
      alignSelf: 'center',
      letterSpacing: -0.2,
    },
    ".navigation": {
      position: 'absolute',
      borderRadius: 12,
      height: 24,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      paddingHorizontal: 10,
      padding: 10,
      marginLeft: 20,
      marginTop: -12,
    },
    backgroundColor: variables.badgeBg,
    //padding: variables.badgePadding,
    paddingHorizontal: 13,
    padding: 13,
    alignSelf: "flex-start",
    justifyContent: variables.platform === "ios" ? "center" : undefined,
    borderRadius: 13,
    height: 26
  };
  return badgeTheme;
};
