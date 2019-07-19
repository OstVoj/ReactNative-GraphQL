import React, { Component } from "react";
import { Modal } from 'react-native';
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
  ListItem
} from "native-base";
import TimeAgo from 'javascript-time-ago'

import getTheme from "../../../../native-base-theme/components";
import platform from "../../../../native-base-theme/variables/platform";
import ApplyModal from "../Campaigns/apply/ApplyModal";


export class Invitations extends Component {

  constructor(props) {
    super(props);
    this.timeAgo = new TimeAgo('en-US');
    this.state = {
      modalVisible: false,
      campaignId: '',
      account: {}
    }
  }

  renderInvitations = (requests) => {
    const invited = this.filterInvitation(requests);

    return invited.map(req => {
      const reqDate = this.timeAgo.format(parseInt(req.createdAt));
      const thumb = req.campaign.media.find(v => v.mediaType === 'image').thumbnail
      return <ListItem key={req.id} thumbnail
        onPress={() => this.onRequestPressed(req)}>
        <Left>
          <Thumbnail
            square
            source={{
              uri: thumb
            }}
          />
        </Left>
        <Body>
          <Text>{req.campaign.title}</Text>
          <Text note>You're invited!</Text>
        </Body>
        <Right>
          <Text note>{reqDate}</Text>
        </Right>
      </ListItem>
    })
  }

  onRequestPressed = (req) => {
    this.setState({ modalVisible: true, campaignId: req.campaign.id, account: req.account })
  }

  filterInvitation = (requests) => {
    return requests.filter((v) => {
      return v.status === 'invited'
    })
  }

  render() {
    return (
      <StyleProvider style={getTheme(platform)}>
        <Container>
          <Content>
            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.modalVisible}
              onRequestClose={() => { }}
            >
              <ApplyModal
                campaignId={this.state.campaignId}
                account={this.state.account}
                onSuccess={() => {
                  this.setState({ modalVisible: false })
                }}
                onClose={() => {
                  this.setState({ modalVisible: false })
                }
                }
              />
            </Modal>
            <List>
              {this.renderInvitations(this.props.requests)}
            </List>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}

export default Invitations;
