export default class AuthApi {

    constructor({ url }) {
        this.url = url
    }

    signIn = async (email, password) => {
        try {
            const response = await fetch(this.url + '/auth/signin',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email, password: password }),
                });
            const data = await response.json();
            if (data && data.token) {
                return { token: data.token, error: '' };
            }
            else {
                return { error: data.message || 'unknown error' }
            }
        } catch (error) {
            console.log(`Error while performing network signin request: ${error}`);
            return { error: `Error while performing network signin request: ${error}` };
        };
    }

    signUp = async ({ email, password, firstName, lastName, country, phone }) => {
        try {
            const response = await fetch(this.url + '/auth/signup',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email, password: password, firstName: firstName,
                        lastName: lastName, country: country, phone: phone
                    }),
                });
            const data = await response.json();
            if (data && data.token) {
                return { token: data.token };
            }
            else {
                return { error: data.error || 'unknown error' }
            }
        } catch (error) {
            console.log(`Error while performing network signup request: ${error}`);
            return { error: `Error while performing network signup request: ${error}` };
        };
    }

    getUser = async (token) => {
        try {
            const response = await fetch(this.url + '/api/getuser',
                {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
            if (response.ok) {
                const data = await response.json();
                if (data && data._id) {
                    return { ...data };
                }
                else {
                    return { error: data.error || 'unknown error' }
                }
            } else {
                return { error: response.statusText }
            }
        } catch (error) {
            console.log(`Error while performing network getuser request: ${error}`);
            return { error: `Error while performing network getuser request: ${error}` };
        };
    }

}