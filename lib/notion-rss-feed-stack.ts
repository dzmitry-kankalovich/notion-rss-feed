import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as targets from "@aws-cdk/aws-events-targets";
import * as events from "@aws-cdk/aws-events";
import * as s3 from "@aws-cdk/aws-s3"
import { config } from 'dotenv';
import * as assert from 'assert';
import { Duration } from "@aws-cdk/core";

config()

const {
  NOTION_INTEGRATION_TOKEN = '',
  NOTION_PAGE_NAME = ''
} = process.env

assert(
    NOTION_INTEGRATION_TOKEN &&
    NOTION_PAGE_NAME &&
    'No valid configuration provided. Cancelling deploy...'
)

export class NotionRssFeedStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'NotionRss', {});

    bucket.addLifecycleRule({
      enabled: true,
      expiration: Duration.days(30)
    })

    // Create the RSS Feed Lambda function
    const handler = new lambda.Function(this, 'NotionRssFeedHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('resources/lambda'),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(300),
      environment: {
        NOTION_INTEGRATION_TOKEN,
        NOTION_PAGE_NAME,
        RSS_BUCKET_NAME: bucket.bucketName
      }
    });

    bucket.grantReadWrite(handler);

    const eventRule = new events.Rule(this, 'NotionRssScheduleRule', {
      schedule: events.Schedule.expression('cron(30 5 * * ? *)') // every day at 5:30 UTC
    });
    eventRule.addTarget(new targets.LambdaFunction(handler));

    new cdk.CfnOutput(this, 'NotionRssFeedHandlerName', { value: handler.functionName });
    new cdk.CfnOutput(this, 'NotionRssBucketName', { value: bucket.bucketName });
  }
}
