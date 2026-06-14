#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RabbitholeStack } from '../lib/rabbithole-stack';

const app = new cdk.App();

const env = app.node.tryGetContext('env') as string ?? 'dev';

new RabbitholeStack(app, `RabbitholeStack-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-2',
  },
  appEnv: env,
});