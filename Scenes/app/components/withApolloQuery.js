import { Query } from 'react-apollo';
import React, { Fragment } from 'react';
import { Button, Text } from 'native-base';

export default withApolloQuery = (WrappedControl, { query, variables, poll, dataToProps, stateToProps }) => {
    return (props) => {
        return <Query
            query={query}
            variables={variables ? variables(props) : {}}
            pollInterval={poll}
            notifyOnNetworkStatusChange={true}
            fetchPolicy="cache-and-network"
        >
            {({ loading, error, data, startPolling, stopPolling, networkStatus, refetch }) => {
                const addProps = dataToProps({ loading, error, data, refetch }, props);
                return <WrappedControl {...addProps}>{props.children}</WrappedControl>
            }
            }
        </Query >
    }
}