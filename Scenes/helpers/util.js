import React from 'react';
import { Dimensions } from 'react-native';

const iPhoneSize = () => {
    const windowWidth = Dimensions.get('window').width;
    if(windowWidth === 320) {
        return 'small'; //iphone SE
    }else if(windowWidth === 414) {
        return 'large'; //iphone Plus
    }
    return 'medium'; //iphone 6/7
}

export default iPhoneSize;