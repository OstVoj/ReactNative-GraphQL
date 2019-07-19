import React, { Component } from 'react';
import {
  Container,
  Header,
  Title,
  Content,
  Left,
  Body,
  StyleProvider,
  Right,
  Button,
  Icon,
  Grid,
  Row,
  Col,
  Text,
  Thumbnail,
  Form,
  Item,
  Input,
  Footer,
  Spinner,
  Toast,
  Root
} from 'native-base';
import { StyleSheet, Switch, Modal } from 'react-native';

import getTheme from '../../native-base-theme/components';
import platform from '../../native-base-theme/variables/platform';

import CountryPicker from './components/CountryPicker';
import { graphql, compose } from 'react-apollo';
import { EDIT_INFLUENCER, EDIT_INFLUENCER_NO_PASSWORD } from '../../api/person';
import FileApi from '../../api/file';
import config from '../../config';
import withImagePicker from './components/withImagePicker';
import ImageViewer from './components/ImageViewer';
import { SecureStore } from 'expo';

const ImagePickerButton = withImagePicker(Button);

export class Settings extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      header: null,
      headerLeft: null,
      headerRight: null
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      uploadFile: null,
      submitted: false,
      uploading: false,
      initialized: false,
      country: null,
      dialCode: '',
      enableFaceId: true,
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      oldPassword: '',
      newPassword: '',
      newPasswordRepeat: '',
      avatar: '',
      inputErrors: ''
    };

    this.fileApi = new FileApi({ url: config.SERVER_URL });
  }

  onBackButtonPressed = () => {
    const { goBack } = this.props.navigation;
    goBack();
  };

  onSelectCountry = obj => {
    this.setState({
      country: obj.country,
      dialCode: obj.dialCode,
      phoneNumber: ''
    });
  };

  static getDerivedStateFromProps = (props, state) => {
    const person = props.navigation.getParam('person', null)
    if (!state.initialized && person) {
      return {
        initialized: true,
        country: person.country ? person.country : '',
        dialCode: '',
        email: person.email ? person.email : '',
        firstName: person.firstName ? person.firstName : '',
        lastName: person.lastName ? person.lastName : '',
        phoneNumber: person.phone ? person.phone : '',
        address: person.address ? person.address : '',
        address2: person.address2 ? person.address2 : '',
        city: person.city ? person.city : '',
        state: person.state ? person.state : '',
        zipCode: person.zipCode ? person.zipCode : '',
        oldPassword: '',
        newPassword: '',
        newPasswordRepeat: '',
        avatar: person.avatar ? person.avatar : '',
        inputErrors: ''
      }
    } else
      return null
  }

  validateEmail = (email) => {
    let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/
    return pattern.test(String(email).toLowerCase())
  }

  validateNumber = (num) => {

    const pattern = /^(\s*|\+\d{11})$/;
    return pattern.test(String(num));
  }

  onSaveChanges = () => {

    const phoneNumber = this.state.dialCode ? this.state.dialCode + this.state.phoneNumber : this.state.phoneNumber;

    const valid =
      this.state.country
        && this.validateEmail(this.state.email)
        && this.state.firstName
        && this.state.lastName
        && this.validateNumber(phoneNumber)
        && !this.state.newPassword && !this.state.oldPassword ? true :
        this.state.newPassword === this.state.newPasswordRepeat && this.state.newPassword.length > 5
        && this.state.oldPassword.length > 0

    // && this.state.address
    // && this.state.address2
    // && this.state.city
    // && this.state.state
    // && this.state.zipCode
    // && this.state.avatar;

    if (valid) {
      this.setState({ uploading: true, inputErrors: !valid });
      if (this.state.uploadFile) {
        this.uploadAvatar(this.state.uploadFile).then((result) => {
          if (result.url) {
            this.editProfileOnServer(result.url)
          } else {
            this.setState({ submitted: true, serverErrors: true })
          }
        })
      } else {
        this.editProfileOnServer(this.state.avatar)
      }
    } else {
      this.setState({ submitted: true, inputErrors: !valid })
    }

  }

  editProfileOnServer = (avatar) => {
    const phoneNumber = this.state.dialCode ? this.state.dialCode + this.state.phoneNumber : this.state.phoneNumber;

    const variables = {
      variables: {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        country: this.state.country,
        phone: phoneNumber,
        avatar: avatar,
        address: this.state.address,
        address2: this.state.address2,
        city: this.state.city,
        state: this.state.state,
        zipCode: this.state.zipCode,
        ...this.state.oldPassword ? { oldPassword: this.state.oldPassword } : null,
        ...this.state.newPassword ? { newPassword: this.state.newPassword } : null
      }
    }

    const editIfluencer = this.state.oldPassword ? this.props.editInfluencer
      : this.props.editInfluencerNoPassword;

    editIfluencer(variables).then(response => {
      if (response.data
        && response.data.editInfuencer
        && response.data.editInfuencer.id) {
        this.setState({ uploading: false, serverErrors: false, });
        this.props.navigation.goBack();
      } else {
        this.setState({ submitted: true, serverErrors: true, uploading: false })
      }
    }).catch(error => {
      this.setState({ submitted: true, serverErrors: true, uploading: false })
    })

  }

  uploadAvatar = async (uploadFile) => {
    const { uri } = uploadFile;
    this.setState({ sending: true });
    const userToken = await SecureStore.getItemAsync('userToken');

    if (userToken) {
      const result = await this.fileApi.uploadFile(userToken, uri);
      if (!this._mount) return;
      if (result.url) {
        return result;
      } else {
        Toast.show({
          text: 'Could not upload avatar, try again later',
          buttonText: 'Ok',
          duration: 5000
        });
        return result;
      }
    } else {
      console.log(`Error uploading avatar, userToken not found`)
      return { error: 'userToken not found' }
    }
  }

  onImagePicked = (result) => {
    this.setState({ uploadFile: result, avatar: result.uri })
  }

  componentDidMount() {
    this._mount = true;
  }

  componentWillUnmount() {
    this._mount = false;
  }

  render() {
    return (
      <Root>
        <StyleProvider style={getTheme(platform)}>

          <Container>

            <Header transparent>
              <Left>
                <Button
                  transparent
                  onPress={this.onBackButtonPressed}
                >
                  <Icon
                    name="arrow-back"
                    style={{
                      fontSize: 30,
                      color: 'black',
                      marginLeft: 20
                    }}
                  />
                </Button>
              </Left>
              <Body style={{ flex: 3 }}>
                <Title>Settings</Title>
              </Body>
              <Right>
                <Button
                  transparent
                  onPress={this.onSaveChanges}
                >
                  <Icon type="FontAwesome" name="check" style={{ color: '#25DC85' }} />
                </Button>
              </Right>
            </Header>
            <Content
              padder
              contentContainerStyle={styles.container}
            >
              <Grid>
                <Row style={styles.subContainer}>
                  <Grid>
                    <Row
                      style={{
                        justifyContent: 'center',
                        marginBottom: 16
                      }}
                    >
                      <Text style={styles.title}>General Info</Text>
                    </Row>
                    <Row
                      style={{
                        justifyContent: 'center',
                        marginBottom: 20
                      }}
                    >

                      <ImagePickerButton style={{ marginTop: 16 }}
                        transparent onImagePicked={this.onImagePicked}
                        mediaTypes='image'>
                        {this.state.avatar ?
                          <Thumbnail
                            style={styles.thumbnail}
                            source={{
                              uri: this.state.avatar
                            }}

                          />
                          : <Icon name='account-circle' type='MaterialCommunityIcons' style={[
                            styles.thumbnail, {
                              fontSize: 90,
                              color: 'black'
                            }]}></Icon>
                        }
                      </ImagePickerButton>

                    </Row>
                    <Form style={{ marginRight: 20 }}>
                      {this.state.inputErrors ?

                        <Text style={styles.errorCaptionText}>
                          We need some more info!
                          Please fill the forms marked red
                          and try to sumbit again
									      </Text>

                        : null
                      }
                      <Item style={styles.formItem}
                        error={this.state.submitted && !this.validateEmail(this.state.email)}>
                        <Input placeholder="Email"
                          style={styles.input}
                          onChangeText={text => this.setState({ email: text })}
                          value={this.state.email} />
                      </Item>
                      <Grid style={styles.formItem}>
                        <Col>
                          <Item
                            error={this.state.submitted && !this.state.firstName ? true : false}>
                            <Input
                              placeholder="First Name"
                              autoComplete="name"
                              style={styles.input}
                              onChangeText={text => this.setState({ firstName: text })}
                              value={this.state.firstName}
                            />
                          </Item>
                        </Col>
                        <Col>
                          <Item
                            error={this.state.submitted && !this.state.lastName ? true : false}>
                            <Input
                              placeholder="Last Name"
                              autoComplete="name"
                              style={styles.input}
                              onChangeText={text => this.setState({ lastName: text })}
                              value={this.state.lastName}
                            />
                          </Item>
                        </Col>
                      </Grid>

                      <Item style={styles.formItem}>
                        <CountryPicker country={this.state.country} onSelectCountry={this.onSelectCountry} />
                      </Item>
                      <Item style={styles.formItem}
                        error={this.state.submitted
                          && (this.state.dialCode ? !this.validateNumber(this.state.dialCode + this.state.phoneNumber)
                            : !this.validateNumber(this.state.phoneNumber))}>
                        <Text style={{ fontSize: 14, marginTop: 5 }}>
                          {this.state.dialCode}
                        </Text>
                        <Input
                          placeholder="Phone Number"
                          autoComplete="tel"
                          keyboardType="phone-pad"
                          style={styles.input}
                          onChangeText={text => this.setState({ phoneNumber: text })}
                          value={this.state.phoneNumber}
                        />
                      </Item>

                      <Item style={styles.formItem}>
                        <Input placeholder="Address line 1"
                          style={styles.input}
                          onChangeText={text => this.setState({ address: text })}
                          value={this.state.address} />
                      </Item>
                      <Item style={styles.formItem}>
                        <Input placeholder="Address line 2"
                          style={styles.input}
                          onChangeText={text => this.setState({ address2: text })}
                          value={this.state.address2} />
                      </Item>
                      <Item style={styles.formItem}>
                        <Input placeholder="City"
                          style={styles.input}
                          onChangeText={text => this.setState({ city: text })}
                          value={this.state.city} />
                      </Item>
                      <Item style={styles.formItem}>
                        <Input placeholder="State"
                          style={styles.input}
                          onChangeText={text => this.setState({ state: text })}
                          value={this.state.state} />
                      </Item>
                      <Item style={styles.formItem}>
                        <Input placeholder="Zip code"
                          style={styles.input}
                          onChangeText={text => this.setState({ zipCode: text })}
                          value={this.state.zipCode} />
                      </Item>

                    </Form>
                  </Grid>
                </Row>
                {/* <Row style={styles.subContainer}>
                <Col style={{ justifyContent: 'center' }}>
                  <Text>
                    Enable Face ID
                  </Text>
                </Col>
                <Col style={{ alignItems: 'flex-end' }}>
                  <Switch
                    onValueChange={(value) => this.setState({ enableFaceId: value })}
                    trackColor={{ true: "#FF0091" }}
                    value={this.state.enableFaceId} />
                </Col>
              </Row> */}
                <Row style={styles.subContainer}>
                  <Grid>
                    <Row
                      style={{
                        justifyContent: 'center',
                        marginBottom: 10
                      }}
                    >
                      <Text style={styles.title}>
                        Change Password
                    </Text>
                    </Row>
                    <Form style={{ marginRight: 20 }}>
                      <Item style={styles.formItem}
                        error={this.state.submitted && !this.state.oldPassword}>
                        <Input
                          placeholder="Old Password"
                          secureTextEntry
                          autoComplete="password"
                          style={styles.input}
                          onChangeText={text => this.setState({ oldPassword: text })}
                          value={this.state.oldPassword}
                        />
                      </Item>
                      {this.state.submitted && this.state.newPassword && this.state.newPassword.length < 6 ?
                        <Text style={styles.errorCaptionText}>Password length should 6 or more characters</Text>
                        : null}
                      <Item style={styles.formItem}
                        error={(this.state.submitted && this.state.newPassword != this.state.newPasswordRepeat)
                          || (this.state.submitted && this.state.newPassword.length < 6)}>
                        <Input
                          placeholder="New Password"
                          secureTextEntry
                          autoComplete="password"

                          onChangeText={text => this.setState({ newPassword: text })}
                          value={this.state.newPassword}
                          style={styles.input}
                        />
                      </Item>
                      <Item
                        error={this.state.submitted && this.state.newPassword != this.state.newPasswordRepeat}>
                        <Input
                          placeholder="Confirm New Password"
                          secureTextEntry
                          autoComplete="password"

                          style={styles.input}
                          onChangeText={text => this.setState({ newPasswordRepeat: text })}
                          value={this.state.newPasswordRepeat}
                        />
                      </Item>
                    </Form>
                  </Grid>
                </Row>
              </Grid>
              {!this.state.uploading ?
                <Button
                  block
                  style={styles.footerBtn}
                  onPress={this.onSaveChanges}
                >
                  <Text style={styles.footerBtnTxt}>
                    Save Changes
              </Text>
                </Button>
                : <Spinner style={styles.spinner} color='#FF0091' />
              }
            </Content>
          </Container>
        </StyleProvider>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  errorCaptionText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#FF0000',
    letterSpacing: -0.17,
    textAlign: 'center',
    paddingLeft: 60,
    paddingRight: 60
  },
  spinner: {
    flex: 1
  },
  container: {
    backgroundColor: '#EBF1FD',
  },
  subContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.45
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: 48
  },
  formItem: {
    marginBottom: 30
  },
  input: {
    fontSize: 14,
    letterSpacing: -0.2
  },
  footer: {
    paddingTop: 10
  },
  footerBtn: {
    flex: 1,
    width: '100%',
    marginLeft: 16,
    alignSelf: 'center',
    height: 64
  },
  footerBtnTxt: {
    fontSize: 18,
    letterSpacing: -0.26
  }
});

export default
  compose(graphql(EDIT_INFLUENCER, {
    name: 'editInfluencer',
    options: (props) => ({
      notifyOnNetworkStatusChange: true,
      variables: {
        firstName: '',
        lastName: '',
        country: '',
        phone: '',
        avatar: '',
        address: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        oldPassword: '',
        newPassword: ''
      }
    })
  }),
    graphql(EDIT_INFLUENCER_NO_PASSWORD, {
      name: 'editInfluencerNoPassword',
      options: (props) => ({
        notifyOnNetworkStatusChange: true,
        variables: {
          firstName: '',
          lastName: '',
          country: '',
          phone: '',
          avatar: '',
          address: '',
          address2: '',
          city: '',
          state: '',
          zipCode: '',
        }
      })
    })
  )(Settings);
