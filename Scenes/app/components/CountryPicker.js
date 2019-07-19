import React, { Component } from "react";
import { StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";

import countriesData from "../../../data/countries";

export class CountryPicker extends Component {
  render() {
    const { country, onSelectCountry } = this.props;

    return (
      <RNPickerSelect
        placeholder={{
          label: "Your Country",
          value: null,
          color: "#9EA0A4"
        }}
        items={countriesData.countries}
        onValueChange={(value, key) => {
          onSelectCountry({
            country: value,
            dialCode: countriesData.countries[key - 1].key
          });
        }}
        style={pickerSelectStyles}
        value={country}
      />
    );
  }
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 0,
    color: "black",
    paddingRight: 30
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    fontFamily: "Poppins-Regular",
    paddingVertical: 8,
    borderWidth: 0,
    color: "black",
    paddingRight: 30
  }
});

export default CountryPicker;
