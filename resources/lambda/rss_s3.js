const md5 = require('md5')
const getStream = require("get-stream");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand
} = require("@aws-sdk/client-s3")

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION
})

exports.getRssFile = async function (bucket, url) {
  const key = md5(url)

  try {
    const s3Response = await s3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key
    }))

    // noinspection JSCheckFunctionSignatures
    return JSON.parse(await getStream(s3Response.Body))
  } catch (e) {
    const statusCode = e?.$metadata?.httpStatusCode
    if (404 === statusCode || 403 === statusCode) {
      console.warn(`Cannot find file [${key}] for comparison.`)
      return null
    } else {
      throw e
    }
  }
}

exports.putRssFile = async function (bucket, rssEndpoint) {
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: md5(rssEndpoint.url),
      Body: JSON.stringify(rssEndpoint.originalItems)
    }))
  } catch (e) {
    const statusCode = e.$metadata.httpStatusCode
    console.error(e)
    throw new Error(`S3 Error Status Code: ${statusCode}`)
  }
};