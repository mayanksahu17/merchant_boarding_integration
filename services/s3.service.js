const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAQZFG5KJOCU2TILEG',
  secretAccessKey: '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'
});

const s3 = new AWS.S3();
const BUCKET_NAME = 'lodgezify';

const uploadFile = async (file, key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

const deleteFile = async (key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile
}; 