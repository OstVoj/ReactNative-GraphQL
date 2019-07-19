import React, { Component } from "react";
import {
  Container,
  Content,
  Icon,
  Left,
  Right,
  Body,
  Thumbnail,
  Text,
  StyleProvider,
  List,
  ListItem,
  Row
} from "native-base";
import TimeAgo from 'javascript-time-ago'

import getTheme from "../../../../native-base-theme/components";
import platform from "../../../../native-base-theme/variables/platform";

export class Completed extends Component {

  constructor(props) {
    super(props);
    this.timeAgo = new TimeAgo('en-US');
  }

  renderComplete = (requests) => {
    const complete = this.filterComplete(requests);

    return complete.map(req => {
      const reqDate = this.timeAgo.format(parseInt(req.createdAt));
      const thumb = req.campaign.media.find(v => v.mediaType === 'image').thumbnail
      return <ListItem key={req.id} thumbnail>
        <Left>
          <Thumbnail
            square
            source={{
              uri: thumb
            }}
          />
        </Left>
        <Body>
          <Row>
            <Icon type="FontAwesome" name="check" />
            <Text
              style={{
                marginLeft: 10
              }}
            >
              {req.campaign.title}
            </Text>
          </Row>
          <Text note>Completed</Text>
        </Body>
        <Right>
          <Text note>{reqDate}</Text>
        </Right>
      </ListItem>

    })
  }

  filterComplete = (requests) => {
    return requests.filter((v) => {
      return v.status === 'completed'
    })
  }

  render() {
    return (
      <StyleProvider style={getTheme(platform)}>
        <Container>
          <Content>
            <List>
              {this.renderComplete(this.props.requests)}
            </List>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}

export default Completed;
