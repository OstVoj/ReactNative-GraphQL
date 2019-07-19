import gql from "graphql-tag";

export const GET_TOTAL_UNREAD_MSG = gql`
query {
    unreadMessages
}
`;

export const GET_CAMPAIGN_MEDIA = gql`
query ($id: ID!){
  campaign(id: $id) {
    media {
      mediaType
      thumbnail
    }
  }
}
`;

export const GET_ALL_MSG = gql`
{
    messages {
      id
      createdAt
      campaign {
        id
        title
      }
      message {
        isRead
        content
        direction
        messageType
      }
    }
  }
  `;

export const GET_UNREAD_BY_CAMPAIGN = gql`
query ($id: ID!){
    unreadMessagesByCampaign (id: $id) 
}
`;

export const GET_MSG_BY_CAMPAIGN = gql`
query ($id: ID!){

  person {
    firstName
    lastName
    avatar
  }

  campaign(id: $id) {
    title
    media {
      mediaType
      thumbnail
    }
  }

  messagesByCampaign (id: $id ) {
    id
    createdAt
    message {
      isRead
      content
      direction
      messageType
    }
  }
}
`;

export const SEND_MESSAGE = gql`
mutation sendMessage (
  $campaign: ID!
  $messageType: String!
  $content: String!
) {
  sendMessage(
    campaign: $campaign, 
    messageType: $messageType, 
    content: $content
  ) {
    id
    createdAt
    message {
      messageType
      content
      isRead
      direction
    }
  }
}
  `;

export const READ_MESSAGE = gql`
  mutation readMessage ($message: ID!){
    readMessage(message: $message) {
      id
      message {
        isRead
      }
    }
  }
`;
