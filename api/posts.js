import gql from "graphql-tag";

export const PostStatus = Object.freeze({
  pending: "pending",
  declined: "declined",
  submit: "approved",
  completed: "published",
  applied: "verified",
})

export const GET_POSTS_STATUS_BY_CAMPAIGN = gql`
query ($id: ID!){

postsByCampaign(id: $id) {
    id
    status
  }
}
`;

export const GET_POSTS_BY_CAMPAIGN = gql`
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
  postsByCampaign(id: $id) {
    id
    postDate
    postType
    mediaContent
    textContent
    status
    verification
    bioLink
    comment
  }
}
`;

export const SUBMIT_POST_VERIFICATION = gql`
mutation submitPostVerification(
  $post: ID!
  $url: String!
) {
  submitPostVerification(
    post: $post, 
    url: $url
  ) {
    id
    status
    verification
  }
}
`;

export const SUBMIT_CONTENT = gql`
mutation submitContent(
  $post: ID!
  $mediaContent: String!
  $postType: String!
  $textContent: String!
) {
  submitContent(
    post: $post, 
    mediaContent: $mediaContent, 
    postType: $postType, 
    textContent: $textContent
    ) {
    id
    postDate
    postType
    mediaContent
    textContent
    status
    verification
    bioLink
    comment
  }
}
`;