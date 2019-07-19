import React, { Component } from "react";

import {
  Container,
  Header,
  Title,
  Content,
  Left,
  Body,
  StyleProvider,
  Right,
  Icon,
  Button,
  Spinner
} from "native-base";
import { StyleSheet } from "react-native";

import getTheme from "../../../../../native-base-theme/components";
import platform from "../../../../../native-base-theme/variables/platform";
import SelectAccount from "./SelectAccount";
import Questionnaire from "./Questionnaire";
import SuccessComponent from "../../SuccessComponent";
import { GET_CAMPAIGN_FORM } from '../../../../../api/campaigns'
import { graphql } from 'react-apollo';

//careful, derives state from props!
class ApplyModal extends Component {

  constructor(props) {
    super(props);
    this.state = props.account ?
      { index: 1, selectedAccount: props.account }
      : { index: 0, selectedAccount: {} }
  }

  onSelectAccount = (account) => {
    this.setState({
      index: 1,
      selectedAccount: account
    });

  };

  onApply = () => {
    this.setState({
      index: 2
    });
  };

  render() {
    const { onClose } = this.props;
    const { onSuccess } = this.props;
    const { index } = this.state;
    const { data: { error, loading, campaign } } = this.props
    if (campaign) {
      campaign.id = this.props.campaignId
    }
    return !error ? !loading && campaign ? (
      <StyleProvider style={getTheme(platform)}>
        <Container style={styles.container}>
          <Header transparent>
            <Left />
            <Body style={{ flex: 3 }}>
              <Title style={styles.title}>Apply</Title>
            </Body>
            <Right>
              <Button transparent onPress={() => this.state.index !== 2 ? onClose() : onSuccess()}>
                <Icon
                  name="md-close"
                  type="Ionicons"
                  style={styles.closeIcon}
                />
              </Button>
            </Right>
          </Header>
          <Content padder>
            {index === 0 && (
              <SelectAccount onSelectAccount={this.onSelectAccount} />
            )}
            {index === 1 && <Questionnaire account={this.state.selectedAccount} key={this.props.campaignId + String(this.props.loading)} campaign={campaign} onApply={this.onApply} />}
            {index === 2 && <SuccessComponent onClose={onSuccess}
              messageText='Submission Successful!'
              closeText='Thanks!' />}
          </Content>
        </Container>
      </StyleProvider>
    )
      : <Spinner style={styles.spinner} color='#FF0091' />
      : <Text style={styles.errorText}>Network error, please try again later</Text>
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#A556F6"
  },
  title: {
    color: "#FFFFFF"
  },
  closeIcon: {
    color: "#FFFFFF"
  }
});

export default graphql(GET_CAMPAIGN_FORM,
  {
    options: (props) => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      variables: {
        id: props.campaignId
      },
    })
  }
)(ApplyModal);
