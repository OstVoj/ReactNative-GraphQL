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
  Grid,
  Row,
  Col,
  Button,
  Root,
  View
} from "native-base";

import { NativeModules, LayoutAnimation } from 'react-native';

import getTheme from "../../../../native-base-theme/components";
import platform from "../../../../native-base-theme/variables/platform";
import ContentSubmitForm from "./form/ContentSubmitForm";
import { Permissions } from "expo";
import { StyleSheet } from "react-native";
import TimeAgo from 'javascript-time-ago'

import SubmitStoryForm from "./form/SubmitStoryForm";
import PublishForm from "./form/PublishForm";

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const PublishedPost = ({ post }) => {
  return <Body>
    <Grid style={{ marginBottom: 12 }}>
      <Row>
        <Col style={{
          width: "auto",
          justifyContent: "center"
        }} >
          <Thumbnail square
            source={{ uri: post.mediaContent }}
            style={{
              width: 121,
              height: 121
            }} />
        </Col>
        <Col style={{ justifyContent: "center" }} >
          <Text style={{
            fontSize: 10,
            lineHeight: 22,
            opacity: 0.8
          }}  >
            {post.textContent}
          </Text>
        </Col>
      </Row>
    </Grid>
  </Body>
}

export class ContentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      expandPosts: [],
      expandSections: ['submit', 'ready', 'published']
    };
    this.timeAgo = new TimeAgo('en-US');
  }

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
  }

  categorizePosts = posts => {
    const numberedPosts = posts.sort((a, b) => parseInt(b.postDate) - parseInt(a.postDate))
      .map((p, index) => ({ ...p, index: index + 1 }));
    return {
      submit: numberedPosts.filter(p => p.status === 'pending' || p.status === 'declined'),
      ready: numberedPosts.filter(p => p.status === 'approved'),
      published: numberedPosts.filter(p => p.status === 'published' || p.status === 'verified'),
    }
  }

  // pending, declined - submit content
  // approved,в publish content
  // published, verified - в already published

  togglePostExpand = id => {
    LayoutAnimation.linear();
    this.setState({
      expandPosts: this.state.expandPosts.find(p => p === id) ?
        this.state.expandPosts.filter(p => p !== id)
        : [...this.state.expandPosts, id]
    })
  }

  isPostExpanded = id => {
    return this.state.expandPosts.find(p => p === id)
  }

  toggleSectionExpand = name => {
    LayoutAnimation.linear();
    this.setState({
      expandSections: this.state.expandSections.find(p => p === name) ?
        this.state.expandSections.filter(p => p !== name)
        : [...this.state.expandSections, name]
    })
  }

  isSectionExpanded = name => {
    return this.state.expandSections.find(p => p === name)
  }

  renderPublishedPost = post => {
    const date = this.timeAgo.format(parseInt(post.postDate));
    return <Fragment key={post.id}>
      <ListItem thumbnail
        onPress={() => this.togglePostExpand(post.id)} >
        <Left>
          {post.postType === 'image' ?
            <Thumbnail square
              source={{ uri: post.mediaContent }} />
            : <Icon style={styles.videoIcon}
              name="playcircleo" type='AntDesign' />
          }
        </Left>
        <Body>
          <Text>POST {post.index}</Text>
        </Body>
        <Right style={{
          flexDirection: "row",
          alignItems: "center"
        }} >
          <Text style={{
            color: "#5DB5CA",
            marginRight: 10
          }}>
            {post.status !== 'verified' ? 'Published' : 'Verified'}</Text>
          <Icon name={this.isPostExpanded(post.id) ? "ios-arrow-up" : "ios-arrow-down"}
            type="Ionicons"
            style={{ color: "#000000" }} />
        </Right>
      </ListItem>
      {this.isPostExpanded(post.id) ?
        <ListItem style={{ display: this.isPostExpanded(post.id) ? "block" : "none" }}>
          <PublishedPost post={post} />
        </ListItem>
        : null}
    </Fragment >
  }

  renderSubmitPost = post => {
    const date = this.timeAgo.format(parseInt(post.postDate));
    return <Fragment key={post.id}>
      <ListItem thumbnail
        style={post.status === 'declined' ? styles.declinedItem : null}
        onPress={() => this.togglePostExpand(post.id)} >
        <Left>
          {post.mediaContent ?

            post.postType === 'image' ?
              <Thumbnail square
                source={{ uri: post.mediaContent }} />
              : <Icon style={styles.videoIcon}
                name="playcircleo" type='AntDesign' />

            : <Button style={styles.addBtn}
              onPress={() => this.togglePostExpand(post.id)}>
              <Text style={{ color: "#FF0091" }} >
                +
            </Text>
            </Button>}
        </Left>
        <Body>
          <Text>POST {post.index}</Text>
        </Body>
        <Right style={{
          flexDirection: "row",
          alignItems: "center"
        }} >
          {post.status === 'declined' ?
            <Text style={styles.declinedNote}>Declined</Text>
            : <Text note style={{ marginRight: 10 }}>
              {date}
            </Text>
          }
          <Icon name={this.isPostExpanded(post.id) ? "ios-arrow-up" : "ios-arrow-down"}
            type="Ionicons"
            style={{ color: "#000000" }} />
        </Right>
      </ListItem>
      {this.isPostExpanded(post.id) ?
        <ListItem style={{ display: this.isPostExpanded(post.id) ? "block" : "none" }}>
          <ContentSubmitForm post={post} />
        </ListItem>
        : null}
    </Fragment >
  }

  renderReadyPost = post => {
    return <Fragment key={post.id}>
      <ListItem thumbnail
        onPress={() => this.togglePostExpand(post.id)} >
        <Left>
          {post.postType === 'image' ?
            <Thumbnail square
              source={{ uri: post.mediaContent }} />
            : <Icon style={styles.videoIcon}
              name="playcircleo" type='AntDesign' />
          }
        </Left>
        <Body>
          <Text>POST {post.index}</Text>
        </Body>
        <Right style={{
          flexDirection: "row",
          alignItems: "center"
        }} >
          <Text style={styles.readyToPublishItem}>
            Ready to publish
    </Text>
          <Icon name={this.isPostExpanded(post.id) ? "ios-arrow-up" : "ios-arrow-down"}
            type="Ionicons"
            style={{ color: "#000000" }} />
        </Right>
      </ListItem>
      {this.isPostExpanded(post.id) ?
        <ListItem style={{ display: this.isPostExpanded(post.id) ? "block" : "none" }}>
          <PublishForm post={post} />
        </ListItem>
        : null}
    </Fragment >
  }

  renderReadySection = (posts) => {
    return (<Fragment>
      <List>
        <ListItem itemDivider
          icon
          style={{
            backgroundColor: "#15BF71"
          }} >
          <Body>
            <Text style={{
              color: "#FFFFFF"
            }}>
              PUBLISH CONTENT - {posts.length}
            </Text>
          </Body>
          <Right>
            <Icon name={this.isSectionExpanded('ready') ? "ios-arrow-up" : "ios-arrow-down"}
              onPress={() => this.toggleSectionExpand('ready')}
              type="Ionicons"
              style={{
                color: "#FFFFFF"
              }} />
          </Right>
        </ListItem>
      </List>
      {this.isSectionExpanded('ready') ?
        <List style={[styles.innerList, { display: this.isSectionExpanded('ready') ? "block" : "none" }]}>
          {posts.map(p => this.renderReadyPost(p))}
        </List>
        : null}
    </Fragment >
    )
  }

  renderSubmitSection = (posts) => {
    return (<Fragment>
      <List>
        <ListItem itemDivider
          icon
          style={{
            backgroundColor: "#EBAC6D"
          }} >
          <Body>
            <Text style={{
              color: "#FFFFFF"
            }} >
              SUBMIT CONTENT - {posts.length}
            </Text>
          </Body>
          <Right>
            <Icon name={this.isSectionExpanded('submit') ? "ios-arrow-up" : "ios-arrow-down"}
              onPress={() => this.toggleSectionExpand('submit')}
              type="Ionicons"
              style={{
                color: "#FFFFFF"
              }} />
          </Right>
        </ListItem>
      </List>
      {this.isSectionExpanded('submit') ?
        <List style={[styles.innerList, { display: this.isSectionExpanded('submit') ? "block" : "none" }]}>
          {posts.map(p => this.renderSubmitPost(p))}
        </List>
        : null}
    </Fragment >
    )
  }

  renderPublishedSection = (posts) => {
    return (<Fragment>
      <List>
        <ListItem itemDivider
          icon
          style={{
            backgroundColor: "#25CDDC"
          }} >
          <Body>
            <Text style={{
              color: "#FFFFFF"
            }} >
              ALREADY PUBLISHED - {posts.length}
            </Text>
          </Body>
          <Right>
            <Icon name={this.isSectionExpanded('published') ? "ios-arrow-up" : "ios-arrow-down"}
              onPress={() => this.toggleSectionExpand('published')}
              type="Ionicons"
              style={{
                color: "#FFFFFF"
              }} />
          </Right>
        </ListItem>
      </List>
      {this.isSectionExpanded('published') ?
        <List style={[styles.innerList, { display: this.isSectionExpanded('published') ? "block" : "none" }]}>
          {posts.map(p => this.renderPublishedPost(p))}
        </List>
        : null}
    </Fragment >
    )
  }

  render() {
    const { image } = this.state;
    const { posts } = this.props;
    const { submit, ready, published } = this.categorizePosts(posts);
    return (
      <Root>
        <StyleProvider style={getTheme(platform)}>
          <Container
            style={{
              backgroundColor: "#EBF1FD"
            }}
          >
            <Content>
              {ready.length ? this.renderReadySection(ready) : null}
              {submit.length ? this.renderSubmitSection(submit) : null}
              {published.length ? this.renderPublishedSection(published) : null}
            </Content>
          </Container>
        </StyleProvider>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  videoIcon: {
    color: 'black',
    fontSize: 40,
    alignSelf: 'center',
    textAlign: 'center',
    width: 55,
  },
  innerList: {
    marginTop: 12,
    marginBottom: 24,
    marginLeft: 24,
    marginRight: 24,
    backgroundColor: "#FFFFFF"
  },
  warningBadge: {
    backgroundColor: "#EBF1FD",
    width: 27,
    height: 27,
    borderRadius: 13.5,
    alignItems: "center",
    justifyContent: "center"
  },
  readyToPublishItem: {
    color: "#15BF71",
    fontSize: 14,
    marginRight: 10
  },
  addBtn: {
    width: 55,
    height: 55,
    backgroundColor: "#EBF1FD",
    marginRight: 7,
    justifyContent: "center"
  },
  declinedItem: {
    borderColor: "#FF0000",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    marginLeft: 0,
    paddingLeft: 15
  },
  declinedNote: {
    fontSize: 14,
    color: "#FF0000",
    marginRight: 10
  },
  declinedThumb: {
    marginLeft: 15
  }
});

export default ContentView;
