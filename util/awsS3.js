const AWS = require('aws-sdk');

//amazon s3 credentials
const s3 = new AWS.S3({
    accessKeyId: process.env.IAM_ACCESS_KEY,
    secretAccessKey: process.env.IAM_SECRET_KEY
});

module.exports = s3;