import AWS from 'aws-sdk';
const s3 = new AWS.S3();

export const getAndLogCsvFile = async (Bucket: string, bucketKey: string) => {
  const params = {
    Bucket: Bucket,
    Key: bucketKey,
  };
  try {
    const data = await s3.getObject(params).promise();
    const csvData = data?.Body?.toString('utf-8');

    return csvData?.split('\n');
  } catch (err) {
    console.error('Error getting CSV file:', err);
    return false;
  }
};
