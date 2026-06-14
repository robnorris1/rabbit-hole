import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ses from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

export interface RabbitholeStackProps extends cdk.StackProps {
  appEnv: string;
}

export class RabbitholeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RabbitholeStackProps) {
    super(scope, id, props);

    const { appEnv } = props;
    const isProd = appEnv === 'prod';

    // Stripe secrets — still managed via Secrets Manager (Phase 5)
    const stripeSecret = new secretsmanager.Secret(this, 'StripeSecret', {
      secretName: `rabbithole/${appEnv}/stripe`,
      description: 'Stripe API keys — set via AWS console after deploy',
    });

    // ── Cognito User Pool ────────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `rabbithole-${appEnv}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        preferredUsername: { required: false, mutable: true },
      },
      customAttributes: {
        proStatus: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 10,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(24),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // ── S3 Assets Bucket ─────────────────────────────────────────────────────
    const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `rabbithole-assets-${appEnv}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: isProd,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
    });

    // ── SES ──────────────────────────────────────────────────────────────────
    // Domain identity — complete verification in AWS console after deploy
    new ses.EmailIdentity(this, 'SesIdentity', {
      identity: ses.Identity.domain('rabbithole.app'),
    });

    // ── Next.js (OpenNext via cdk-nextjs-standalone) ─────────────────────────
    const nextjs = new Nextjs(this, 'NextjsSite', {
      nextjsPath: '../',
      environment: {
        NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
        NEXT_PUBLIC_COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
        NEXT_PUBLIC_API_URL: '',
        COGNITO_USER_POOL_ID: userPool.userPoolId,
        SES_FROM_ADDRESS: 'noreply@rabbithole.app',
        // DATABASE_URL is passed at deploy time via GitHub Actions secret
        // and baked into the Lambda environment (encrypted at rest by AWS)
        DATABASE_URL: process.env.DATABASE_URL ?? '',
      },
    });

    // Allow the Next.js Lambda to read Stripe secrets (Phase 5)
    stripeSecret.grantRead(nextjs.serverFunction.lambdaFunction);

    // ── Outputs ──────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${nextjs.distribution.distributionDomain}`,
    });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'AssetsBucketName', { value: assetsBucket.bucketName });
  }
}