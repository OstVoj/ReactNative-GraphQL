import React, { Component } from "react";

import { Text, Icon, Button, Thumbnail, Grid, Row, Col, Spinner } from "native-base";
import { StyleSheet } from "react-native";
import { GET_ACCOUNTS_TO_PICK } from "../../../../../api/accounts";
import { graphql } from 'react-apollo';

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#fff",
    height: 92,
    marginBottom: 1,
    flex: 1
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  name: {
    fontSize: 18,
    letterSpacing: -0.26
  },
  instaId: {
    fontSize: 12,
    letterSpacing: -0.17,
    opacity: 0.5,
    marginLeft: 5,
    marginTop: 5
  },
  checkIcon: {
    color: "#F2EBFD"
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    letterSpacing: -0.26
  }
});

const renderAccountRow = (account, onSelectAccount) => (
  <Row key={account.id} style={styles.row} onPress={() => onSelectAccount(account)}>
    <Col
      size={3}
      style={{
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Thumbnail
        style={styles.thumb}
        source={{
          uri: account.avatar
        }}
      />
    </Col>
    <Col
      size={5}
      style={{
        justifyContent: "center"
      }}
    >
      <Row
        style={{
          alignItems: "flex-end"
        }}
      >
        <Text style={styles.name}>{account.name}</Text>
      </Row>
      <Row>
        <Icon name="logo-instagram" />
        <Text style={styles.instaId}>{account.name}</Text>
      </Row>
    </Col>
    <Col size={2} style={{ justifyContent: "center" }}>
      <Icon name="check" type="AntDesign" style={styles.checkIcon} />
    </Col>
  </Row>
);

export class SelectAccount extends Component {
  render() {
    const { onSelectAccount } = this.props;
    const { data: { error, loading, accounts } } = this.props
    return !error ? !loading && accounts ? (
      <Grid>
        <Row
          style={{
            height: 98,
            backgroundColor: "#FFFFFF",
            marginBottom: 1
          }}
        >
          <Grid>
            <Row style={{ alignItems: "flex-end", justifyContent: "center" }}>
              <Text style={styles.description}>
                Please select an account to
              </Text>
            </Row>
            <Row style={{ justifyContent: "center" }}>
              <Text style={styles.description}>apply with:</Text>
            </Row>
          </Grid>
        </Row>
        {accounts.filter(a => a.verified).map(a => renderAccountRow(a, onSelectAccount))}
      </Grid>
    )
      : <Spinner style={styles.spinner} color='#000000' />
      : <Text style={styles.errorText}>Network error, please try again later</Text>
  }
}

export default graphql(GET_ACCOUNTS_TO_PICK)(SelectAccount);

