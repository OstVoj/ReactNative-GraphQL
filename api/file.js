export default class FileApi {

    constructor({ url }) {
        this.url = url
    }

    uploadFile = async (token, filename) => {
        let responseString = ''
        try {
            let formData = new FormData();

            formData.append('mediaFile', { uri: filename, name: Date.now().toString() });
            const response = await fetch(this.url + '/api/uploadFile',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });
            responseString = response;
            const data = await response.json();
            if (data && data.url) {
                return { url: data.url };
            }
            else {
                console.log('No url in data whil uploading file: ', data);
                return { error: data.error || 'unknown error' }
            }
        } catch (error) {
            console.log(`Error while performing network file upload request: ${error}`);
            console.log(responseString);
            return { error: `Error while performing network file upload request: ${error}` };
        };
    }

}