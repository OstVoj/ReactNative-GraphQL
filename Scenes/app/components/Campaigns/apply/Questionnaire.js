import React, { Component } from "react";

import {
  Text,
  Icon,
  Button,
  Thumbnail,
  Grid,
  Row,
  Col,
  Item,
  Input,
  Switch,
  Spinner
} from "native-base";
import { StyleSheet } from "react-native";
import { graphql } from "react-apollo";
import { SUBMIT_REQUEST, GET_REQUESTS } from "../../../../../api/requests";
import { GET_CAMPAIGNS } from "../../../../../api/campaigns";

export class Questionnaire extends Component {
  /*
  * Derives inner stare from props, use only with key={key} for your props change!
  */
  constructor(props) {
    super(props);

    this.state = {
      fields: props.campaign && props.campaign.formData ? this.createFieldsState(props.campaign.formData)
        : props.request && props.request.formData ? this.createFieldsState(props.request.formData)
          : {},
      valid: true,
      editing: props.campaign ? true : false
    };
    console.disableYellowBox = true;
  }

  createFieldsState = (fields) => {
    return fields.reduce((acc, field) => {
      acc[field.name] = {
        value: field.fieldType !== 'radio' ? field.value ? field.value : '' : 'No',
        type: field.fieldType
      };
      return acc;
    }, {})
  }

  renderFormFields = (fields, editing) => {
    return fields.map(f => {
      switch (f.fieldType) {
        case 'price': return this.renderPrice(f.name, editing);
        case 'number': return this.renderNumber(f.name, editing);
        case 'textarea': return this.renderTextarea(f.name, editing);
        case 'radio': return this.renderRadio(f.name, editing);
        default: return null;
      }
    });
  }

  setFormValue = (name) => (val) => {
    const v = {}

    v[name] = this.state.fields[name].type !== 'radio' ? { value: val, type: this.state.fields[name].type }
      : { value: val ? 'Yes' : 'No', type: this.state.fields[name].type }
    this.setState({
      fields: { ...this.state.fields, ...v }
    });
  }

  renderPrice = (name, editing) => {
    const {
      valid
    } = this.state;
    const fieldVal = this.state.fields[name].value;
    return <Row key={name} style={styles.row}>
      <Col style={styles.col} size={8}>
        <Text>{name}</Text>
      </Col>
      <Col style={styles.desCol} size={2}>
        {editing ?
          <Item style={!valid && !parseInt(fieldVal) ? styles.error : {}}>
            <Input
              keyboardType="numeric"
              value={`${fieldVal}`}
              onChangeText={this.setFormValue(name)}
            />
            <Text style={{ color: "#FF0091" }}>$</Text>
          </Item>
          : <Text style={styles.desc}>{fieldVal}$</Text>
        }
      </Col>
    </Row>
  }

  renderNumber = (name, editing) => {
    const {
      valid
    } = this.state;
    const fieldVal = this.state.fields[name].value;
    return <Row key={name} style={styles.row}>
      <Col style={styles.col} size={8}>
        <Text>{name}</Text>
      </Col>
      <Col style={styles.desCol} size={2}>
        {editing ?
          <Item style={!valid && !(parseInt(fieldVal) >= 0) ? styles.error : {}}>
            <Input
              keyboardType="numeric"
              value={`${fieldVal}`}
              onChangeText={this.setFormValue(name)}
            />
          </Item>
          : <Text style={styles.desc}>{fieldVal}</Text>
        }
      </Col>
    </Row>
  }

  renderTextarea = (name, editing) => {
    const {
      valid
    } = this.state;
    const fieldVal = this.state.fields[name].value;
    return <Row key={name} style={styles.row}>
      <Grid>
        <Row>
          <Col size={9}>
            <Text note={editing ? true : false}>
              {name}
            </Text>
          </Col>
          <Col size={1} />
        </Row>
        <Row style={{ marginTop: 12 }}>
          {editing ? <Item
            style={[
              { width: "100%" },
              !fieldVal && !valid ? styles.error : {}
            ]}>
            <Input
              value={`${fieldVal}`}
              multiline={true}
              onChangeText={this.setFormValue(name)}
              style={{ width: "100%" }}
            />
          </Item>
            : <Text note>{fieldVal}</Text>
          }
        </Row>
      </Grid>
    </Row>
  }

  renderRadio = (name, editing) => {
    const fieldVal = this.state.fields[name].value;
    return <Row key={name} style={styles.row}>
      <Col style={styles.col} size={8}>
        <Text>{name}</Text>
      </Col>
      <Col style={styles.desCol} size={2}>
        {editing ?
          <Switch
            onValueChange={this.setFormValue(name)}
            trackColor="#FF0091"
            value={fieldVal === 'Yes' ? true : false}
          />
          : fieldVal === 'Yes' ? <Icon name='ios-checkmark-circle-outline' style={{ fontSize: 26, color: '#FF0091' }} />
            : <Icon name='ios-close-circle-outline' style={{ fontSize: 26, color: '#FF0091' }} />
        }
      </Col>
    </Row>
  }

  onApply = async () => {
    const { fields } = this.state;

    if (Object.values(fields)
      .reduce((acc, val) =>
        val.type !== 'radio' ?
          val.type === 'price' ?
            parseInt(val.value) && acc
            : val.type === 'number' ?
              parseInt(val.value) >= 0 && acc
              : val.value && acc
          : acc && (val.value === 'Yes' || val.value === 'No'))
    ) {
      this.setState({
        valid: true
      });
      const sendRequestResult = await this.submitRequestToServer();
      if (sendRequestResult && sendRequestResult.id) {
        this.props.onApply();
      } else {
        this.setState({
          valid: false
        });
      }
    } else {
      this.setState({
        valid: false
      });
    }
  };

  submitRequestToServer = async () => {
    const formFields = Object.entries(this.state.fields).map(
      ([key, val]) => {
        return { name: key, value: val.value, fieldType: val.type }
      }
    )

    const variables = {
      variables: {
        campaign: this.props.campaign ? this.props.campaign.id
          : this.props.request ? this.props.request.campaign.id : '',
        account: this.props.account.id,
        formData: formFields
      }
    }

    this.setState({ uploading: true })
    try {
      const response = await this.props.submitRequest(variables);

      if (response.data
        && response.data.submitRequest
        && response.data.submitRequest.id) {
        this.setState({ uploading: false, serverErrors: false, });
        return response.data.submitRequest;
      } else {
        this.setState({ submitted: true, serverErrors: true, uploading: false })
        return response.data.submitRequest;
      }
    } catch (error) {
      console.log(`Error while submitting campaign request: ${error}`)
      this.setState({ submitted: true, serverErrors: true, uploading: false })
      return { error: `Server request error: ${error}` };
    }
  }

  render() {
    const {
      valid
    } = this.state;
    const { campaign, account, request } = this.props

    return (
      <Grid>

        {
          !valid && (
            <Col style={styles.errorCol}>
              <Text style={styles.errorTxt}>We need some more info!</Text>
              <Text style={styles.errorTxt}>Please fill the forms marked red</Text>
              <Text style={styles.errorTxt}>and try to submit again</Text>
            </Col>
          )
        }

        {request && request.status === 'declined' ? (
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
                  marginTop: 8,
                  justifyContent: 'center'
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 14
                  }}
                >
                  {request.comment}
                </Text>
              </Row>
            </Grid>
          </Row>)
          : null}
        {account ?
          <Row style={styles.topRow}>
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
              <Icon name="angle-down" type="FontAwesome" />
            </Col>
          </Row>
          : null}

        <Row>
          <Grid>
            {campaign ?
              this.renderFormFields(campaign.formData, this.state.editing) : null}
            {request ?
              this.renderFormFields(request.formData, this.state.editing) : null}

            {campaign ?
              <Row>
                <Button
                  block
                  onPress={() => this.onApply()}
                  style={styles.applyBtn}
                >
                  <Text>Apply</Text>
                </Button>
              </Row>
              : null}

            {request
              && this.state.editing ?
              <Row>
                {!this.state.uploading ? <Button
                  block
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                    width: "100%",
                    backgroundColor: "#2590DC"
                  }}
                  onPress={!this.state.editing ?
                    () => this.setState({ editing: true })
                    : () => this.onApply()}
                >
                  <Text>{this.state.editing ? "Save" : "Edit"
                  }</Text>
                </Button>
                  : <Spinner style={styles.spinner} color='#FF0091' />
                }
              </Row>
              : null}

            {/* {request && request.status != 'declined' ? (
              <Row>
                <Button
                  transparent
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                    width: "100%"
                  }}
                  onPress={() => this.props.onWithdraw()}
                >
                  <Text style={{ color: "#FF0000", fontSize: 10 }}>
                    Withdraw application
                    </Text>
                </Button>
              </Row>)
              : null} */}


          </Grid>
        </Row>
      </Grid>
    )
  }
}

const styles = StyleSheet.create({
  spinner: {
    flex: 1
  },
  desCol: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  desc: {
    color: "#FF0091"
  },
  errorCol: {
    backgroundColor: "#fff",
    height: 99,
    marginBottom: 4,
    justifyContent: "center"
  },
  errorTxt: {
    color: "#FF0000",
    textAlign: "center",
    fontSize: 12
  },
  topRow: {
    backgroundColor: "#fff",
    height: 92,
    marginBottom: 4
  },
  row: {
    backgroundColor: "#FFFFFF",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomColor: "#EBF1FD",
    borderBottomWidth: 1
  },
  col: {
    justifyContent: "center"
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
  applyBtn: {
    width: "100%",
    backgroundColor: "#25DC85",
    marginLeft: 0,
    marginRight: 0
  },
  error: {
    borderBottomColor: "#FF0000"
  }
});

export default graphql(SUBMIT_REQUEST, {
  name: 'submitRequest',
  options: (props) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      campaign: '',
      account: '',
      formData: ''
    },
    update: (cache, { data: { submitRequest } }) => {
      const dataCampaigns = cache.readQuery({
        query: GET_CAMPAIGNS,
      });

      dataCampaigns.requests.push(submitRequest);

      cache.writeQuery({
        query: GET_CAMPAIGNS,
        data: dataCampaigns
      });

    },
  })
})(Questionnaire);
