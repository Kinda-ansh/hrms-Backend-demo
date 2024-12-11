/**
 * fileUploadController.js
 * @description :: exports all method related file upload
 */

const fs = require("fs");
const path = require("path");
const { formidable }= require("formidable");
const imageSize = require('image-size');
const AWS = require("aws-sdk");
const { randomNumber } = require("../utils/common");
// const { ImageRule } = require("../../utils/fileValidator");


/**
* @description : uploads file using formidable.
*/

const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    let options = {
        maxFileSize: 200 * 1024, //200 KB converted to bytes,
        allowEmptyFiles: false
    }

    const forms = formidable(options);
    forms.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return
      } else {
        resolve({fields, files });
      }
    });
  });
};

/**
 * @description : uploads file using formidable.
 * @param {Object} req : request of file upload API
 * @param {Object} res : response of file upload API.
 * @return {Object} : response of file upload. {status, message, data}
 */
async function upload(file, file_for, old_file=null) {
  return new Promise((resolve, reject) => {
    try {
      const allowedExtensions =file_for.ext;

      const ext = path.extname(file[0].originalFilename).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(`Invalid file extension. Only [${allowedExtensions}] are allowed.`);
      }
      // Validate image dimensions
      if(allowedExtensions[0] !== '.pdf')
      {
      const dimensions = imageSize(file[0].filepath);

      //if (dimensions.width !== file_for.width || dimensions.height !== file_for.height) {
       if (dimensions.width >= file_for.width || dimensions.height >= file_for.height) {
          throw new Error(`Invalid image dimensions. Required: ${file_for.width} X ${file_for.height}  pixels.`);
       }

     }
      // Move the file to the desired location (e.g., upload to S3, save to disk, etc.)
      const newFileName = `${randomNumber(8)}-${Date.now()}-${file[0].originalFilename}`;
      folderName = file_for.path;       
      
      resolve(uploadToS3(file[0], newFileName, folderName));
      if(old_file!=null)
      {
        resolve(deleteFile(`${folderName}/${old_file}`));   
      }

    } catch (error) {
      // Handle validation errors
      reject(error);
    }
  });
}

async function deleteUploadfile(file){
  deleteFile(`${folderName}/${old_file}`); 
}




// to upload multiple files

async function uploadMultiple(files, file_for, old_files = []) {
  const uploads = [];

  try {
    for (const file of files) {
      const allowedExtensions = file_for.ext;
      const ext = path.extname(file.originalFilename).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        throw new Error(`Invalid file extension. Only [${allowedExtensions}] are allowed.`);
      }

      // Validate image dimensions
      const dimensions = imageSize(file.filepath);

      if (dimensions.width >= file_for.width || dimensions.height >= file_for.height) {
        throw new Error(`Invalid image dimensions. Required: ${file_for.height} X ${file_for.width} pixels.`);
      }

      // Move the file to the desired location (e.g., upload to S3, save to disk, etc.)
      const newFileName = `${Date.now()}-${file.originalFilename}`;
      const folderName = file_for.path;

      // Push the promise for each upload to the uploads array
      uploads.push(uploadToS3(file, newFileName, folderName));

      // If there are old files, push the promise for each delete to the uploads array
      if (old_files.length > 0) {
        for (const oldFile of old_files) {
          uploads.push(deleteFile(`${folderName}/${oldFile}`));
        }
      }
    }
    // Wait for all uploads and deletes to complete
    const upload = await Promise.all(uploads);

    // Return something meaningful, e.g., success message or data
    return upload
  } catch (error) {
    // Handle errors, e.g., log or throw
    console.error(error);
    throw error;
  }
}



/**
 * @description : upload file to AWS s3
 * @param {Object} file : file to upload
 * @param {string} fileName : name of file
 * @return {Object} : response for file upload to AWS s3
 */
const deleteFile = async (key) => {
  let S3Config = {
    AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  };

  const s3 = new AWS.S3({
    region: S3Config.AWS_S3_REGION,
    accessKeyId: S3Config.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: S3Config.AWS_S3_SECRET_ACCESS_KEY,
  });
  const params = {
    Bucket: S3Config.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
  
  } catch (error) {
     console.log(error)
  }
};


const uploadToS3 = async (file, fileName, folderName) => {
  let S3Config = {
    AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  };

  const s3 = new AWS.S3({
    region: S3Config.AWS_S3_REGION,
    accessKeyId: S3Config.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: S3Config.AWS_S3_SECRET_ACCESS_KEY,
  });

  const bucketName=S3Config.AWS_S3_BUCKET_NAME;
  const folderKey = folderName ? folderName + '/' : '';

  // Create the folder if it doesn't exist
  await s3.headObject({ Bucket: bucketName, Key: folderKey }).promise().catch(async () => {
    await s3.putObject({ Bucket: bucketName, Key: folderKey }).promise();
  });
  
  // Read the file
  const fileContent = fs.readFileSync(file.filepath);

  // Upload the file to S3
  const params = {
    Bucket: bucketName,
    Key: folderKey + fileName,
    Body: fileContent
  };

  await s3.upload(params).promise();
  return fileName;
};







const deleteFileS3 = async (key) => {
  const S3Config = {
    AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  };

  const s3 = new AWS.S3({
    region: S3Config.AWS_S3_REGION,
    accessKeyId: S3Config.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: S3Config.AWS_S3_SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: S3Config.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  try {
    // Check if the file exists before deleting
    await s3.headObject(params).promise();
    console.log(`File found in S3: ${key}, proceeding with deletion...`);

    const result = await s3.deleteObject(params).promise();
    console.log(`File deleted successfully from S3: ${key}`);
    return result;
  } catch (error) {
    if (error.code === 'NotFound') {
      console.error(`File not found in S3: ${key}`);
    } else {
      console.error(`Failed to delete file from S3: ${key}`, error);
    }
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};






module.exports = { upload, uploadMultiple, parseForm, deleteFile , deleteFileS3 , deleteUploadfile};