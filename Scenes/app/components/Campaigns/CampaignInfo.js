import React, { Component, Fragment } from "react";
import {
  Container,
  Content,
  Text,
  StyleProvider,
  Thumbnail,
  View,
  Grid,
  Row,
  Col,
  Button,
  Right,
  Icon,
  Header,
  Spinner
} from "native-base";
import _ from "lodash";
import { StyleSheet, Dimensions, Modal } from "react-native";
import ImageViewer from '../../components/ImageViewer';
import VideoViewer from '../../components/VideoViewer';

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

import getTheme from "../../../../native-base-theme/components";
import platform from "../../../../native-base-theme/variables/platform";

export class CampaginInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      samplePostModalVisible: false,
      postMedia: ''
    };
  }

  showSamplePostModal = (mediaItem) => {
    this.setState({
      samplePostModalVisible: true,
      postMedia: mediaItem
    });
  };

  renderGoals = (goals) => {
    return goals.map((goal, index) => {
      return (
        <View key={index} style={styles.category}>
          <View style={styles.dotContainer}>
            <View style={styles.dot} />
          </View>
          <Text style={styles.categoryTitle}>{goal}</Text>
        </View>
      )
    })
  }

  renderRequirements = (requirements) => {
    return requirements.map((req, index) => {
      return (
        <Row key={index}>
          <Col style={styles.col}>
            <Text style={styles.descriptionRequirements}>{req.name}</Text>
          </Col>
          <Col style={styles.line} />
          <Col style={styles.col}>
            <Text style={styles.descriptionRequirements}>{req.value}</Text>
          </Col>
        </Row>
      )
    });
  }

  renderSamplePosts = (media) => {
    const rows = _.chunk(media, 3);
    //hack to make always 3 in a row for correct align
    const rows3 = rows.map(i => i.concat(new Array(3 - i.length > 0 ? 3 - i.length : 0).fill({})));
    return rows3.map((item, index) => this.renderSamplePostsRow(item, index));
  }

  renderSamplePostsRow = (media, key) => {
    return (
      <Row key={key}>
        {media.map((item, index) => {
          return item.url ?
            (<Col key={item.url} onPress={() => this.showSamplePostModal(item)}>
              <Thumbnail
                square
                source={{
                  uri: item.thumbnail
                }}
                style={styles.postImg}
              />
              {item.mediaType === 'video' ?
                <Icon style={styles.videoIcon} name="playcircleo" type='AntDesign' />
                : null
              }
            </Col>)
            : <Col key={index}></Col>
        })}
      </Row >
    )
  }

  render() {
    const { title, description, media, fields: { category, creativeBrief, goals, about, requirements } } = this.props.campaign;
    const mediaTitle = media.find(i => i.mediaType == 'image');
    return (
      <StyleProvider style={getTheme(platform)} >
        <View>
          <Thumbnail
            square
            source={{
              uri: mediaTitle ? mediaTitle.url : "https://picsum.photos/300/300/?random"
            }}
            style={styles.heroImg}
          />
          <View style={styles.content}>
            {title ?
              <Grid style={styles.headerBlock}>
                <Col size={10}><Text style={styles.header}>
                  {title}
                </Text></Col>
                <Col size={1} style={styles.instaHeader}>
                  <Icon
                    name="logo-instagram"
                  /></Col>
              </Grid>
              : null}
            {description ?
              <Text style={styles.heroTxt}>
                {description}
              </Text>
              : null
            }
            {about ?
              <Fragment><Text style={styles.title}>About the brand</Text>
                <Text style={styles.description}>
                  {about}
                </Text>
              </Fragment>
              : null}
            {goals ?
              <Fragment>
                <Text style={styles.title}>CAMPAIGN GOALS</Text>
                <View style={styles.goals}>
                  {this.renderGoals(goals)}
                </View>
              </Fragment>
              : null}
            {requirements ?
              <Fragment>
                <Text style={styles.title}>Influencer Requirements</Text>
                <Grid>
                  {this.renderRequirements(requirements)}
                </Grid>
              </Fragment>
              : null}
            {creativeBrief ?
              <Fragment>
                <Text style={styles.title}>Creative Brief</Text>
                <Text style={styles.description}>
                  {creativeBrief}
                </Text>
              </Fragment>
              : null}
            {media ?
              <Fragment>
                <Text style={styles.title}>Sample Posts</Text>
                <Grid style={styles.postContainer}>
                  {this.renderSamplePosts(media)}
                </Grid>
              </Fragment>
              : null}
          </View>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.samplePostModalVisible}
            onRequestClose={() => { }}
          >
            {this.state.postMedia ?
              this.state.postMedia.mediaType == 'video' ?
                <VideoViewer
                  source={{
                    uri: this.state.postMedia ? this.state.postMedia.url : ''
                  }}
                  onClose={() =>
                    this.setState({ samplePostModalVisible: false })
                  } />
                : <ImageViewer
                  source={{
                    uri: this.state.postMedia ? this.state.postMedia.url : ''
                  }}
                  onClose={() =>
                    this.setState({ samplePostModalVisible: false })
                  } />
              : null}
          </Modal>
        </View>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  goals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  videoIcon: {
    position: 'absolute',
    left: '22%',
    color: 'white',
    top: '23%',
    fontSize: 60
  },
  headerBlock: {
    paddingBottom: 16
  },
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#000000',
    letterSpacing: -0.91,
  },
  instaHeader: {
    justifyContent: 'center',
    alignSelf: 'center'
  },
  heroImg: {
    width: deviceWidth,
    height: deviceWidth
  },
  content: {
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 24
  },
  heroTxt: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    lineHeight: 28
  },
  title: {
    fontFamily: "Poppins-Bold",
    paddingTop: 24,
    textTransform: "uppercase",
    fontSize: 14,
    color: "#FF0091"
  },
  description: {
    paddingTop: 8,
    fontSize: 14,
    lineHeight: 28,
    color: '#404040'
  },
  descriptionRequirements: {
    paddingTop: 8,
    fontSize: 14,
    lineHeight: 28,
    color: '#000000'
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#FF0091"
  },
  dotContainer: {
    height: 28,
    paddingTop: 8,
    justifyContent: "center",
    marginRight: 8
  },
  category: {
    flexDirection: "row",
    paddingRight: 30
  },
  categoryTitle: {
    paddingTop: 8,
    fontSize: 14,
    height: 28
  },
  col: {
    width: "auto"
  },
  line: {
    paddingTop: 8,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#EBF1FD"
  },
  postContainer: {
    marginTop: 9
  },
  postImg: {
    width: (deviceWidth - 54) / 3,
    height: (deviceWidth - 54) / 3,
    marginTop: 2
  },
  fullImg: {
    width: deviceWidth,
    height: deviceWidth,
    marginTop: (deviceHeight / 2) - (deviceWidth / 2) - 128
  },
  applyButton: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 24,
    width: "100%"
  }
});

export default CampaginInfo;
