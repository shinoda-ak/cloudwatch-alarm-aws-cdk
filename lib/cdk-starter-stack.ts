import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cdk from 'aws-cdk-lib';
import { Watchful } from 'cdk-watchful'

export class CdkStarterStack extends cdk.Stack {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create SNS topic for Alarm
    const alarmSns = new sns.Topic(this, 'system-alart-topic')

    // create Watchful instance
    const wf = new Watchful(this, 'watchful', {
      dashboardName: 'cdk-watchful-fs',
      alarmSns
    })

    // lambda function basic option
    const lambdaBasicOpt = {
      bundling: {
        minify: true,
        target: 'es2020'
      },
      runtime: Runtime.NODEJS_16_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
    }

    // lambda function for error
    const errorfuncName = 'error-func'
    const errorFunction = new NodejsFunction(this, errorfuncName, {
      ...lambdaBasicOpt,
      entry: 'src/my-lambda/error.ts'
    });

    // watch error function
    wf.watchLambdaFunction(errorfuncName, errorFunction)

    // lambda function for success
    const successfuncName = 'success-func'
    const successfunction = new NodejsFunction(this, successfuncName, {
      ...lambdaBasicOpt,
      entry: 'src/my-lambda/success.ts'
    });

    // watch success function
    wf.watchLambdaFunction(successfuncName, successfunction)
  }
}
