import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs'
import * as agw from 'aws-cdk-lib/aws-apigateway'
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
    const errorFunc = new NodejsFunction(this, errorfuncName, {
      ...lambdaBasicOpt,
      entry: 'src/my-lambda/error.ts'
    });

    // watch error function
    wf.watchLambdaFunction(errorfuncName, errorFunc)

    // lambda function for success
    const successfuncName = 'success-func'
    const successFunc = new NodejsFunction(this, successfuncName, {
      ...lambdaBasicOpt,
      entry: 'src/my-lambda/success.ts'
    });

    // watch success function
    wf.watchLambdaFunction(successfuncName, successFunc)

    // REST API
    const apiName = 'cdk-watchful-fs-api'
    const logGroup = new logs.LogGroup(this, `${apiName}-logs`)
    const api = new agw.RestApi(this, apiName, {
      deployOptions: {
        stageName: 'prod',
        loggingLevel: agw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new agw.LogGroupLogDestination(logGroup),
        accessLogFormat: agw.AccessLogFormat.jsonWithStandardFields()
      },
      defaultCorsPreflightOptions: {
        allowOrigins: agw.Cors.ALL_ORIGINS,
        allowMethods: agw.Cors.ALL_METHODS
      }
    })

    // watch API GW
    wf.watchApiGateway(apiName, api)

    // /test API resource
    const testApiResrc = api.root.addResource('test')
    // /test/error API resource
    const errorResrc = testApiResrc.addResource('error')
    // Add GET method (and errorFunc integration)
    errorResrc.addMethod('GET', new agw.LambdaIntegration(errorFunc))

    // /test/success API resource
    const successResrc = testApiResrc.addResource('success')
    // Add GET method (and errorFunc integration)
    successResrc.addMethod('GET', new agw.LambdaIntegration(successFunc))
  }
}
