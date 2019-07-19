import React, { Component, Fragment } from "react";
import {
  Container,
  Content,
  Left,
  Right,
  Body,
  Thumbnail,
  Text,
  StyleProvider,
  List,
  ListItem,
  Icon,
  View
} from "native-base";

import { NativeModules, LayoutAnimation } from 'react-native';

import getTheme from "../../../../native-base-theme/components";
import platform from "../../../../native-base-theme/variables/platform";
import { GET_POSTS_STATUS_BY_CAMPAIGN } from "../../../../api/posts";
import { withApollo } from 'react-apollo';
import TimeAgo from 'javascript-time-ago'

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const NotificationBadge = (props) => (
  props.show ?
    <View style={{
      backgroundColor: "#EBF1FD",
      width: 27,
      height: 27,
      borderRadius: 13.5,
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Text
        style={{
          color: "#FF0091"
        }}>
        !
  </Text>
    </View>
    : null
)

class ConnectedPublishBadge extends Component {

  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  fetchState = async (campaignIds) => {
    const statuses = await Promise.all(campaignIds.map(async (c) => {
      const { data: { postsByCampaign } } = await this.props.client.query({
        query: GET_POSTS_STATUS_BY_CAMPAIGN,
        variables: { id: c }
      });

      return postsByCampaign.find(p => p.status === 'pending') ? true : false;;
    }));
    if (this._mount) {
      this.setState({ show: statuses.find(s => s === true) ? true : false });
    }
  }

  async componentDidMount() {
    this._mount = true;
    this.fetchState(this.props.campaignIds);
    setInterval(() => this.fetchState(this.props.campaignIds), 5000);
  }

  componentWillUnmount() {
    this._mount = false;
  }

  render = () => <NotificationBadge show={this.state.show} />

}

const ApolloConnectedPublishBadge = withApollo(ConnectedPublishBadge);

export class Current extends Component {

  constructor(props) {
    super(props);
    this.state = {
      expandApplied: true,
      expandSubmit: true,
      expandPublish: true
    }
    this.timeAgo = new TimeAgo('en-US');
  }

  renderPublish = (requests) => {
    const publishReq = this.filterPublish(requests);
    const campaignIds = publishReq.map(p => p.campaign.id);

    if (publishReq.length > 0) {
      return <Fragment><ListItem itemDivider icon
        style={{
          backgroundColor: "#15BF71"
        }}>
        <Body>
          <Text style={{
            color: "#FFFFFF"
          }}>
            PUBLISH CONTENT - {publishReq.length}
          </Text>
        </Body>
        <Right>
          <ApolloConnectedPublishBadge campaignIds={campaignIds} />

          <Icon name={this.state.expandPublish ? "ios-arrow-up" : "ios-arrow-down"}
            type="Ionicons"
            style={{
              color: "#FFFFFF"
            }}
            onPress={() => {
              LayoutAnimation.linear();
              this.setState({ expandPublish: !this.state.expandPublish })
            }} />
        </Right>
      </ListItem>
        {this.state.expandPublish ?
          <View style={this.state.expandPublish ? { display: 'block' } : { display: 'none' }}>
            {publishReq.map(v => this.renderSingleRequest(v,
              v.status === 'publish' ?
                { text: 'Ready to publish', color: "#15BF71" }
                : {}))}
          </View>
          : null}
      </Fragment>
    }
    else return null;
  }

  renderSubmit = (requests) => {
    const submitReq = this.filterSubmit(requests);
    if (submitReq.length > 0) {
      return <Fragment><ListItem itemDivider icon
        style={{
          backgroundColor: "#EBAC6D"
        }}>
        <Body>
          <Text style={{
            color: "#FFFFFF"
          }}>
            SUBMIT CONTENT - {submitReq.length}
          </Text>
        </Body>
        <Right>
          <Icon name={this.state.expandSubmit ? "ios-arrow-up" : "ios-arrow-down"}
            type="Ionicons"
            style={{
              color: "#FFFFFF"
            }}
            onPress={() => {
              LayoutAnimation.linear();
              this.setState({ expandSubmit: !this.state.expandSubmit })
            }} />
        </Right>
      </ListItem>
        {this.state.expandSubmit ?
          <View style={this.state.expandSubmit ? { display: 'block' } : { display: 'none' }}>
            {submitReq.map(v => this.renderSingleRequest(v,
              v.status === 'submit' ?
                { text: 'Ready to submit' }
                : {}))}
          </View>
          : null}
      </Fragment>
    }
    else return null;
  }

  renderApplied = (requests) => {
    const declined = this.filterDeclined(requests);
    const appliedReq = this.filterApplied(requests).concat(declined);
    if (appliedReq.length > 0) {
      return <Fragment>

        <ListItem itemDivider
          icon
          style={{
            backgroundColor: "#25CDDC"
          }}>
          <Body>
            <Text style={{
              color: "#FFFFFF"
            }}>
              CAMPAIGNS APPLIED - {appliedReq.length}
            </Text>
          </Body>
          <Right>
            <NotificationBadge show={declined.length > 0} />
            <Icon name={this.state.expandApplied ? "ios-arrow-up" : "ios-arrow-down"}
              type="Ionicons"
              style={{
                color: "#FFFFFF"
              }}
              onPress={() => {
                LayoutAnimation.linear();
                this.setState({ expandApplied: !this.state.expandApplied })
              }} />
          </Right>
        </ListItem>
        {this.state.expandApplied ?
          <View style={this.state.expandApplied ? { display: 'block' } : { display: 'none' }}>
            {appliedReq.map(v => this.renderSingleRequest(v,
              v.status === 'applied' ?
                { text: 'Applied' }
                : v.status === 'declined' ?
                  { text: 'Application declined', color: "#FF0000" }
                  : {}))}
          </View>
          : null}
      </Fragment>
    }
    else return null;
  }

  getReqPrice = (req) => {
    const postPrice = req.formData.find((v) => v.name.toLowerCase().trim() === 'price per post');
    const postNum = req.formData.find((v) => v.name.toLowerCase().trim() === 'how many posts included into campaign?');
    return parseInt(postPrice.value) * parseInt(postNum.value);
  }

  renderSingleRequest = (req, { text, color }) => {
    const price = this.getReqPrice(req);
    const thumb = req.campaign.media.find(v => v.mediaType === 'image').thumbnail
    const reqDate = this.timeAgo.format(parseInt(req.createdAt));
    return (
      <ListItem key={req.id} thumbnail
        onPress={() =>
          this.props.navigation.navigate("ContentOverview", {
            request: req,
            account: req.account,
            campaignId: req.campaign.id,
            declined: req.status === 'declined'
          })
        }>
        <Left>
          <Thumbnail square
            source={{
              uri: thumb
            }} />
        </Left>
        <Body>
          <Text>{req.campaign.title}</Text>
          <Text note
            style={color ? { color: color }
              : null}>
            {text}
          </Text>
        </Body>
        <Right>
          <Text note>{reqDate}</Text>
          <Text>${price}</Text>
        </Right>
      </ListItem>)
  }

  filterPublish = (requests) => {
    return requests.filter((v) => {
      return v.status === 'publish'
    })
  }

  filterSubmit = (requests) => {
    return requests.filter((v) => {
      return v.status === 'submit'
    })
  }

  filterApplied = (requests) => {
    return requests.filter((v) => {
      return v.status === 'applied'
    })
  }

  filterDeclined = (requests) => {
    return requests.filter((v) => {
      return v.status === 'declined'
    })
  }

  render() {

    const requests = this.props.requests;
    return (
      <StyleProvider style={getTheme(platform)}>
        <Container>
          <Content>
            <List>
              {this.renderPublish(requests)}
              {this.renderSubmit(requests)}
              {this.renderApplied(requests)}
            </List>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}

export default Current;
