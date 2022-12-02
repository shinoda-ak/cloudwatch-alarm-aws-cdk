import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cwa from 'aws-cdk-lib/aws-cloudwatch-actions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cdk from 'aws-cdk-lib';


export class CdkStarterStack extends cdk.Stack {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const funcName = 'my-function'

    // 👇 lambda function definition
    const myFunction = new NodejsFunction(this, funcName, {
      bundling: {
        minify: true,
        target: 'es2020'
      },
      runtime: Runtime.NODEJS_16_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      entry: 'src/my-lambda/index.ts'
    });

    // 👇 define a metric for lambda errors
    const functionErrors = myFunction.metricErrors({
      period: cdk.Duration.minutes(1),
    });
    // 👇 define a metric for lambda invocations
    const functionInvocation = myFunction.metricInvocations({
      period: cdk.Duration.minutes(1),
    });

    // 👇 create Errors Alarm directly on the Metric
    const erorrsAlarm = functionErrors.createAlarm(this, `${funcName}-errors-alarm`, {
      threshold: 1,
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
      alarmDescription:
        `[${funcName}] Alarm if the SUM of Errors is greater than or equal to the threshold (1) for 1 evaluation period`,
      });

    // 👇 create Invocation Alarm directly on the Metric
    const invocationAlarm = functionInvocation.createAlarm(this, `${funcName}-invocation-alarm`, {
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription:
        `[${funcName}] if the SUM of Lambda invocations is greater than or equal to the  threshold (1) for 1 evaluation period`,
      });

      // 👇 create SNS topic for Alarm
      const snsTopic = new sns.Topic(this, 'lambda-alart-topic')

      // 👇 Add SNS cloudwatch actions
      invocationAlarm.addAlarmAction(new cwa.SnsAction(snsTopic))
      erorrsAlarm.addAlarmAction(new cwa.SnsAction(snsTopic))
  }
}
