import React, { Component, Fragment } from "react";
import {
  Container,
  Header,
  Text,
  Tab,
  Tabs,
  TabHeading,
  StyleProvider,
  Icon,
  Thumbnail,
  Grid,
  Col,
  Row,
  Content,
  Spinner,
  Button
} from "native-base";
import { StyleSheet, TouchableOpacity } from 'react-native';

import getTheme from "../../native-base-theme/components";
import platform from "../../native-base-theme/variables/platform";

import ContentView from "./components/contentOverView/Content";
import CampaignInfo from "./components/Campaigns/CampaignInfo";
import MyApplication from "./components/contentOverView/MyApplication";

import { graphql } from 'react-apollo';
import { GET_POSTS_BY_CAMPAIGN } from "../../api/posts";
import Questionnaire from "./components/Campaigns/apply/Questionnaire";

export class ContentOverview extends Component {
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
  }

  onBackButtonPressed = () => {
    const { goBack } = this.props.navigation;

    goBack();
  };

  render() {
    const { data: { loading, campaign, postsByCampaign, error, refetch } } = this.props;
    const { status } = this.props.navigation.getParam('request', '')

    return (
      <StyleProvider style={getTheme(platform)}>
        <Container>
          {!error ? !loading && postsByCampaign ?
            <Fragment>
              <Header transparent hasTabs>
                <Grid>
                  <Col style={{
                    width: 38,
                    justifyContent: "center",
                    alignItems: "center"
                  }} >
                    <TouchableOpacity
                      style={{ width: 58, marginLeft: -20, flex: 1, justifyContent: 'center', alignItems: 'center' }}
                      onPress={this.onBackButtonPressed}
                    >
                      <Icon
                        name="arrow-back"
                        style={{ color: "black" }}
                      />
                    </TouchableOpacity>
                  </Col>
                  <Col style={{
                    justifyContent: "center"
                  }}>
                    <Grid>
                      <Col style={{
                        justifyContent: "center",
                        width: 48
                      }} >
                        <Thumbnail square style={{
                          width: 48,
                          height: 48
                        }}
                          source={{
                            uri: campaign.media.find(m => m.mediaType === 'image').thumbnail
                          }} />
                      </Col>
                      <Col style={{
                        marginLeft: 12
                      }} >
                        <Row style={{
                          alignItems: "flex-start",
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Text style={{
                            fontWeight: "bold",
                            fontSize: 24
                          }} >
                            {campaign.title}
                          </Text>
                          <Text style={{
                            fontSize: 14
                          }}>
                            {campaign.fields.category}
                          </Text>
                        </Row>
                      </Col>
                    </Grid>
                  </Col>
                  {status === 'declined' ? (
                    <Col style={{
                      width: "auto",
                      justifyContent: "center",
                      alignItems: "flex-end",
                      marginRight: 16
                    }} >
                      <Text style={{
                        fontSize: 14,
                        color: "#FF0000"
                      }}>
                        Declined
                      </Text>
                    </Col>)
                    : null}
                </Grid>
              </Header>
              <Tabs>
                {status === 'publish' || status === 'submit' ?
                  <Tab heading={
                    <TabHeading>
                      <Text>Content</Text>
                    </TabHeading>
                  }>
                    <ContentView posts={postsByCampaign} />
                  </Tab>
                  : null
                }
                <Tab heading={
                  <TabHeading>
                    <Text>Campaign Info</Text>
                  </TabHeading>
                } >
                  <Content><CampaignInfo campaign={campaign} /></Content>
                </Tab>
                <Tab heading={
                  <TabHeading>
                    <Text>My Application</Text>
                  </TabHeading>
                } >
                  <Container style={{
                    backgroundColor: "#EBF1FD"
                  }}>
                    <Content padder>
                      <Questionnaire
                        request={this.props.navigation.getParam('request', '')}
                        account={this.props.navigation.getParam('account', '')}
                        onApply={() => { }}
                        onWithdraw={() => { }} />
                    </Content>
                  </Container>
                </Tab>
              </Tabs>
            </Fragment>
            : <Spinner style={{ paddingTop: 150 }} color='#FF0091' />
            : <Text style={styles.errorText}>Network error, please try again later</Text>}
        </Container>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  errorText: {
    alignSelf: 'center',
    textAlign: 'center',
  }
})

export default
  graphql(GET_POSTS_BY_CAMPAIGN, {
    options: (props) => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      variables: {
        id: props.navigation.getParam('campaignId', '')
      },
    })
  })(ContentOverview);