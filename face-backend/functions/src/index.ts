import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const path = require('path');

const vision = require('@google-cloud/vision');

const visionClient =  new vision.ImageAnnotatorClient();

// Dedicated bucket for cloud function invocation
const bucketName = 'face-detector-3c108.appspot.com';

export const imageTrigger = functions.storage.bucket(bucketName).object().onFinalize(async (object) => {
    console.log(object);

    // File path in the bucket
    const filePath = object.name;

    // File name
    const fileName = path.basename(filePath);

    // Location of saved file in bucket
    const fileUrl = `gs://${bucketName}/${filePath}`;

    const fileId = fileName.split('.jpg')[0];

    const docRef  = admin.firestore().collection('photos').doc(fileId);

    // Await the cloud vision response
    const results = await visionClient.labelDetection(fileUrl);

    // Map the data to desired format
    const labels = results[0].labelAnnotations.map((obj:any) => obj.description);

    return docRef.set({labels});
});