#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { NotionRssFeedStack } from '../lib/notion-rss-feed-stack';

const app = new cdk.App();
new NotionRssFeedStack(app, 'NotionRssFeedStack');
