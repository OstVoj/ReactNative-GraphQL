import gql from "graphql-tag";

export const GET_CAMPAIGNS_FILTERS_DATA = gql`
query {
  campaigns {
    fields {
      category
    }
    platform
  }
}
`;

export const GET_CAMPAIGNS = gql`
query {
  requests {
    status
    account {
      id
      name
      avatar
    }
    campaign {
      id
    }
  }
  campaigns {
    title
    id
    description
    status
    budget
    media {
      mediaType
      url
    }
    fields {
      category
    }
    platform
  }
}
`;

export const GET_CAMPAIGN_BY_ID = gql`
query ($id: ID!){
  campaign(id: $id) {
    title
    description
    fields {
      about
      category
      creativeBrief
      goals
      requirements {
        name
        value
      }
    }
    platform
    media {
      mediaType
      url
      thumbnail
    }
  }
}
`;

export const GET_CAMPAIGN_FORM = gql`
query ($id: ID!){
  campaign(id: $id) {
    formData {
      fieldType
      name
    }
  }
}
`;

