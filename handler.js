"use strict";

const AWS = require('aws-sdk');
const sharp = require('sharp');

//AWS S3 Client
const s3 = new AWS.S3();

module.exports.processFile = async (event, context) => {

  const s3MetaData = event.Records[0].s3;
  const bucketName = s3MetaData.bucket.name;
  const processed = 'processed'
  const fileKey = s3MetaData.object.key;

  console.log(
    `S3 Metadata bucketname : ${bucketName} and uploaded file key : ${fileKey}`
  );

  try {
    const params = {
        Bucket: bucketName,
        Key: fileKey
    };
    console.log(`Original params ${JSON.stringify(params)}`);
    var origimage = await s3.getObject(params).promise();

  } catch (error) {
      console.log(error);
      return;
  }

  // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const width  = 200;

  // Use the sharp module to resize the image and save in a buffer.
  try {
      var buffer = await sharp(origimage.Body).resize(width).toBuffer();

  } catch (error) {
      console.log(error);
      return;
  }

  // Upload the thumbnail image to the destination bucket
  try {
    const destparams = {
        Bucket: bucketName,
        Key: `${processed}/${fileKey.split("/").pop()}`,
        Body: buffer,
        ContentType: "image"
    };

    console.log(`Destination params ${JSON.stringify(destparams)}`);

    const putResult = await s3.putObject(destparams).promise();

} catch (error) {
    console.log(error);
    return;
}

  console.log(`File conversion done ${bucketName} / ${fileKey} ${JSON.stringify(putResult)}`);
  
  return {
    statusCode: 200
  };
};
