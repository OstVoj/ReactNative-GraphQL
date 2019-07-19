import gql from "graphql-tag";

const Accounts = {
  fragments: {
    AboutInfo: gql`
    fragment AboutInfo on AccountType {
      id
      postPrice {
        min
        max
      }
      storyPrice {
        min
        max
      }
      storyViews
      linkBio {
        accept
        price
      }
      bulkDiscount
      productReady
      contentCreation
      about
      age
      categories {
        id
        name
      }
      otherBrands {
        status
        brands
      }
    }
  `,
  }
};

export const GET_ACCOUNTS_TO_PICK = gql`{
    accounts {
      id
      avatar
      name
      verified
    }
  }
  `;

export const GET_INSTA_ACCOUNT = gql`
query ($name: String!) {
    getInstagramAccount(name: $name) {
      bio
      profile_name
      profile_id
      profile_pic
    }
  }
  `;
export const ADD_INSTA_ACCOUNT = gql`
  mutation addInstagramAccount($name: String!) {
    addInstagramAccount(name: $name){
      id
      verificationToken
    }
  }
  `;

export const VERIFY_INSTA_ACCOUNT = gql`
  mutation verifyInstagramAccount($id: ID!) {
    verifyInstagramAccount(id: $id) {
      verified
    }
  }
  `;

export const GET_CATEGORIES = gql`
  {
    categories {
      id
      name
    }
  }
  `;

export const EDIT_INSTA_ACCOUNT = gql`
  mutation editInstagramAccount(
    $id: ID!
    $postPriceMin: Int!
    $postPriceMax: Int!
    $storyPriceMin: Int!
    $storyPriceMax: Int!
    $storyViews: Int!
    $linkBio: Boolean!
    $linkBioPrice: Int!
    $bulkDiscount: Boolean!
    $productReady: String!
    $contentCreation: Int!
    $about: String!
    $age: Int!
    $categories: [String]!
    $otherBrands: Boolean!
    $brandsList: String!
  ){
    editInstagramAccount(
      id: $id, 
      postPriceMin: $postPriceMin, 
      postPriceMax: $postPriceMax, 
      storyPriceMin: $storyPriceMin, 
      storyPriceMax: $storyPriceMax, 
      storyViews: $storyViews, 
      linkBio: $linkBio, 
      linkBioPrice: $linkBioPrice, 
      bulkDiscount: $bulkDiscount, 
      productReady: $productReady, 
      contentCreation: $contentCreation, 
      about: $about, 
      age: $age, 
      categories: $categories,
      otherBrands: $otherBrands,
      brandsList: $brandsList
    ) {
      ...AboutInfo
    }
  }
  ${Accounts.fragments.AboutInfo}
  `;

export const GET_ACCOUNT_INFO = gql`
  query getAccountAboutInfo($id: ID!) {
    categories {
      id
      name
    }
    account(id: $id) {
      ...AboutInfo
    }
  }
  ${Accounts.fragments.AboutInfo}
  `;