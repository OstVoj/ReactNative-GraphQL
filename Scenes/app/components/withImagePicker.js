import React, { Component } from "react";

import { Alert } from 'react-native';
import { ActionSheet, Root, Toast } from "native-base";
import { ImagePicker, Permissions, FileSystem, Linking } from 'expo';

export default function withImagePicker(WrappedControl) {

    return class extends Component {
        constructor(props) {
            super(props);
        }

        processResult = async (result, onImagePicked) => {
            try {
                const fileInfo = await FileSystem.getInfoAsync(result.uri, { size: true });

                if (fileInfo.exists) {
                    if (fileInfo.size < 30 * 1024 * 1024) {
                        onImagePicked(result);
                    } else {
                        Toast.show({
                            text: 'File is too big, please try another one or resize it before choosing',
                            buttonText: 'Ok',
                            duration: 10000
                        });
                    }
                } else {
                    Toast.show({
                        text: 'File not found, please try again',
                        buttonText: 'Ok',
                        duration: 10000
                    });
                }
            } catch (e) {
                console.log(`Error while picking image media: ${e}`)
            }
        }

        pickImage = async () => {
            try {
                const { onImagePicked } = this.props;
                const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
                if (status === 'granted') {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        allowsEditing: this.props.allowsEditing === false ? false : true,
                        aspect: [4, 3],
                        mediaTypes: this.props.mediaTypes ?
                            this.props.mediaTypes === 'image' ? ImagePicker.MediaTypeOptions.Images
                                : this.props.mediaTypes === 'video' ? ImagePicker.MediaTypeOptions.Videos
                                    : this.props.mediaTypes === 'all' ? ImagePicker.MediaTypeOptions.All
                                        : ImagePicker.MediaTypeOptions.Image
                            : ImagePicker.MediaTypeOptions.All
                    });
                    if (!result.cancelled) {
                        await this.processResult(result, onImagePicked);
                    }
                } else {
                    this.showDeniedPermissionAlert();
                }
            } catch (error) {
                console.log('Error while launching image library:', error)
            }
        };

        captureImage = async () => {
            try {
                const { onImagePicked } = this.props;
                const { status } = await Permissions.askAsync(Permissions.CAMERA);
                if (status === 'granted') {
                    const result = await ImagePicker.launchCameraAsync({});
                    if (!result.cancelled) {
                        await this.processResult(result, onImagePicked);
                    }
                } else {
                    this.showDeniedPermissionAlert();
                }
            } catch (error) {
                console.log('Error while launching camera:', error)
            }
        };

        showImagePicker = () => {
            ActionSheet.show(
                {
                    options: ["From Gallery", "From Camera", "Cancel"],
                    cancelButtonIndex: 2,
                    title: "Pick Image"
                },
                buttonIndex => {
                    if (buttonIndex === 0) {
                        this.pickImage();
                    } else if (buttonIndex === 1) {
                        this.captureImage();
                    }
                }
            );
        };

        showDeniedPermissionAlert = () => {
            Alert.alert(
                'Permission denied',
                "Oops, it seems that you've denied permission to use camera and gallery. \
                To use this functionality, please go to application settings and check camera and gallery permissions",
                [
                    {
                        text: 'No, thank you', onPress: () => { }
                    },
                    {
                        text: 'Ok, take me to settings', onPress: () => {
                            Linking.openURL('app-settings:')
                        }
                    },
                ],
                { cancelable: false },
            );
        }

        render = () =>

            <WrappedControl onPress={this.showImagePicker} {...this.props}>
                {this.props.children}
            </WrappedControl>

    }
}