import React, { Component } from "react";
import {
  Container,
  Content,
  Thumbnail,
  Text,
  StyleProvider,
  Icon,
  Grid,
  Row,
  Col,
  Button,
  Item,
  Input,
  CheckBox,
  ListItem
} from "native-base";
import { StyleSheet } from "react-native";

import getTheme from "../../../../native-base-theme/components";
import platform from "../../../../native-base-theme/variables/platform";

export class MyApplication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pricePerPost: 280,
      postCount: 4,
      notes: "Travel + Fitness. Male Model Influencer",
      storyCount: 2,
      signedNda: true,
      editing: false
    };
  }

  onEditPress = () => {
    const { editing } = this.state;
    this.setState({
      editing: !editing
    });
  };

  render() {
    const {
      pricePerPost,
      postCount,
      notes,
      storyCount,
      signedNda,
      editing
    } = this.state;
    const { declined } = this.props;

    return (
      <StyleProvider style={getTheme(platform)}>
        <Container
          style={{
            backgroundColor: "#EBF1FD"
          }}
        >
          <Content padder>
            <Grid>
              {declined && (
                <Row
                  style={{
                    marginBottom: 8,
                    paddingTop: 24,
                    paddingLeft: 49,
                    paddingBottom: 24,
                    paddingRight: 49,
                    borderWidth: 1,
                    borderColor: "#FF0000",
                    backgroundColor: "#FFFFFF"
                  }}
                >
                  <Grid>
                    <Row
                      style={{
                        justifyContent: "center"
                      }}
                    >
                      <Text
                        style={{
                          color: "#FF0000",
                          textAlign: "center",
                          fontSize: 12
                        }}
                      >
                        Application Declined
                      </Text>
                    </Row>
                    <Row
                      style={{
                        marginTop: 8
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 14
                        }}
                      >
                        Reason: Price per post is too high, 6 stories needed
                        instead of 4
                      </Text>
                    </Row>
                  </Grid>
                </Row>
              )}
              <Row
                style={{
                  backgroundColor: "#fff",
                  height: 92
                }}
              >
                <Col
                  size={3}
                  style={{
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Thumbnail
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30
                    }}
                    source={{
                      uri: "https://picsum.photos/300/300/?random"
                    }}
                  />
                </Col>
                <Col
                  size={7}
                  style={{
                    justifyContent: "center"
                  }}
                >
                  <Row
                    style={{
                      alignItems: "flex-end"
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        letterSpacing: -0.6
                      }}
                    >
                      Dann Johnson
                    </Text>
                  </Row>
                  <Row>
                    <Icon name="logo-instagram" />
                    <Text
                      style={{
                        fontSize: 12,
                        letterSpacing: -0.17,
                        opacity: 0.5,
                        marginLeft: 5,
                        marginTop: 5
                      }}
                    >
                      danny95
                    </Text>
                  </Row>
                </Col>
              </Row>
            </Grid>
            <Grid style={{ paddingTop: 4 }}>
              <Row style={styles.row}>
                <Col style={styles.col} size={8}>
                  <Text>Price per Post</Text>
                </Col>
                <Col style={styles.desCol} size={2}>
                  {editing ? (
                    <Item>
                      <Input
                        keyboardType="numeric"
                        value={`${pricePerPost}`}
                        onChangeText={val => {
                          this.setState({
                            pricePerPost: val
                          });
                        }}
                      />
                    </Item>
                  ) : (
                    <Text style={styles.desc}>${pricePerPost}</Text>
                  )}
                </Col>
              </Row>
              <Row style={styles.row}>
                <Col style={styles.col} size={8}>
                  <Text>How many posts included into campaign?</Text>
                </Col>
                <Col style={styles.desCol} size={2}>
                  {editing ? (
                    <Item>
                      <Input
                        keyboardType="numeric"
                        value={`${postCount}`}
                        onChangeText={val => {
                          this.setState({
                            postCount: val
                          });
                        }}
                      />
                    </Item>
                  ) : (
                    <Text style={styles.desc}>{postCount}</Text>
                  )}
                </Col>
              </Row>
              <Row style={styles.row}>
                <Grid>
                  <Row>
                    <Col size={9}>
                      <Text>
                        Briefly explain what you do and your personal process
                      </Text>
                    </Col>
                    <Col size={1} />
                  </Row>
                  <Row style={{ marginTop: 12 }}>
                    {editing ? (
                      <Item style={{ width: "100%" }}>
                        <Input
                          value={`${notes}`}
                          onChangeText={val => {
                            this.setState({
                              notes: val
                            });
                          }}
                          style={{ width: "100%" }}
                        />
                      </Item>
                    ) : (
                      <Text note>{notes}</Text>
                    )}
                  </Row>
                </Grid>
              </Row>
              <Row style={styles.row}>
                <Col style={styles.col} size={8}>
                  <Text>How many stories included into campaign?</Text>
                </Col>
                <Col style={styles.desCol} size={2}>
                  {editing ? (
                    <Item>
                      <Input
                        keyboardType="numeric"
                        value={`${storyCount}`}
                        onChangeText={val => {
                          this.setState({
                            storyCount: val
                          });
                        }}
                      />
                    </Item>
                  ) : (
                    <Text style={styles.desc}>{storyCount}</Text>
                  )}
                </Col>
              </Row>
              <Row style={styles.row}>
                <Col style={styles.col} size={8}>
                  <Text>Are you ready to sign an NDA document?</Text>
                </Col>
                <Col style={styles.desCol} size={2}>
                  {editing ? (
                    <CheckBox
                      checked={signedNda}
                      onPress={() => this.setState({ signedNda: !signedNda })}
                      style={{
                        marginRight: 20
                      }}
                    />
                  ) : (
                    <Icon
                      name="ios-arrow-down"
                      type="Ionicons"
                      style={{
                        color: signedNda ? "#FF0091" : "grey"
                      }}
                    />
                  )}
                </Col>
              </Row>
              <Row>
                <Button
                  block
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                    width: "100%",
                    backgroundColor: "#2590DC"
                  }}
                  onPress={this.onEditPress}
                >
                  <Text>{editing ? "Save" : "Edit"}</Text>
                </Button>
              </Row>
              {!declined && (
                <Row>
                  <Button
                    transparent
                    style={{
                      marginLeft: 0,
                      marginRight: 0,
                      width: "100%"
                    }}
                    onPress={() => this.onWithDrawApplication()}
                  >
                    <Text style={{ color: "#FF0000", fontSize: 10 }}>
                      Withdraw application
                    </Text>
                  </Button>
                </Row>
              )}
            </Grid>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#FFFFFF",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 24,
    paddingBottom: 24,
    marginBottom: 2
  },
  col: {
    justifyContent: "center"
  },
  desCol: {
    alignItems: "flex-end",
    justifyContent: "center"
  },
  desc: {
    color: "#FF0091"
  }
});

export default MyApplication;
