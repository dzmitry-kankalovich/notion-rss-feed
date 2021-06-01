import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as targets from "@aws-cdk/aws-events-targets";
import * as events from "@aws-cdk/aws-events";
import { config } from 'dotenv';
import * as assert from 'assert';

config()

const {
  NOTION_INTEGRATION_TOKEN = '',
  NOTION_PAGE_NAME = '',
  RSS_FEED_URL = ''
} = process.env

assert(
    NOTION_INTEGRATION_TOKEN &&
    NOTION_PAGE_NAME &&
    RSS_FEED_URL,
    'No valid configuration provided. Cancelling deploy...'
)

export class NotionRssFeedStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the RSS Feed Lambda function
    const handler = new lambda.Function(this, 'NotionRssFeedHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('resources/lambda'),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(300),
      environment: {
        NOTION_INTEGRATION_TOKEN,
        NOTION_PAGE_NAME,
        RSS_FEED_URL
      }
    });

    const eventRule = new events.Rule(this, 'NotionRssScheduleRule', {
      schedule: events.Schedule.expression('cron(30 5 * * ? *)') // every day at 5:30 UTC
    });
    eventRule.addTarget(new targets.LambdaFunction(handler));

    // Print the ARN of created Lambda
    new cdk.CfnOutput(this, 'NotionRssFeedHandlerName', { value: handler.functionName });
  }
}
