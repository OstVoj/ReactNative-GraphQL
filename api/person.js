import gql from "graphql-tag";

export const GET_PERSON = gql`
{
  person {
    firstName
    lastName
    phone
    email
    address
    address2
    city
    state
    country
    zipCode
    avatar
    balance
    totalEarned
    accounts {
      name
      id
      avatar
      verified
      verificationToken
    }
    requests {
      status
    }
  }
}
`;

export const EDIT_INFLUENCER = gql`
mutation editInfuencer(
  $firstName: String!
  $lastName: String!
  $country: String!
  $phone: String!
  $avatar: String! 
  $address: String!
  $address2: String!
  $city: String!
  $state: String!
  $zipCode: String! 
  $oldPassword: String! 
  $newPassword: String!
) {
  editInfuencer(
    firstName: $firstName, 
    lastName: $lastName, 
    country: $country, 
    phone: $phone, 
    avatar: $avatar, 
    address: $address, 
    address2: $address2, 
    city: $city, 
    state: $state, 
    zipCode: $zipCode, 
    oldPassword: $oldPassword, 
    newPassword: $newPassword
    ) {
      id
      firstName
      lastName
      phone
      email
      address
      address2
      city
      state
      country
      zipCode
      avatar
  }
}
`;

export const EDIT_INFLUENCER_NO_PASSWORD = gql`
mutation editInfuencer(
  $firstName: String!
  $lastName: String!
  $country: String!
  $phone: String!
  $avatar: String! 
  $address: String!
  $address2: String!
  $city: String!
  $state: String!
  $zipCode: String! 
) {
  editInfuencer(
    firstName: $firstName, 
    lastName: $lastName, 
    country: $country, 
    phone: $phone, 
    avatar: $avatar, 
    address: $address, 
    address2: $address2, 
    city: $city, 
    state: $state, 
    zipCode: $zipCode, 
    ) {
      id
      firstName
      lastName
      phone
      email
      address
      address2
      city
      state
      country
      zipCode
      avatar
  }
}
`;

export const REQUEST_PAYMENT = gql`
mutation requestPayment($amount: Int!){
  requestPayment(amount: $amount) {
    amount
    id
    status
    createdAt
    comment
  }
}
`;