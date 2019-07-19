import gql from "graphql-tag";

export const RequestStatus = Object.freeze({
  publish: "publish",
  invited: "invited",
  declined: "declined",
  submit: "submit",
  completed: "completed",
  applied: "applied",
})

export const GET_REQUESTS = gql`
query {
  requests {
    id
    createdAt
    account {
      id
      name
      avatar
    }
    campaign {
      id
      title
      media {
        mediaType
        thumbnail
      }
    }
    comment
    status
    formData {
      name
      value
      fieldType
    }
  }
}
`;

export const SUBMIT_REQUEST = gql`
mutation submitRequest(
  $campaign: ID! 
  $account: ID!
  $formData: [RequestFormData]!
) {
  submitRequest(
    campaign: $campaign, 
    account: $account, 
    formData: $formData
    ) 
  {
    id
    createdAt
    account {
      id
      name
      avatar
    }
    campaign {
      id
      title
      media {
        mediaType
        thumbnail
      }
    }
    comment
    status
    formData {
      name
      value
      fieldType
    }
  }
}
`;