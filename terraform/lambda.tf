locals {
  lambda_function_name       = "AWSomeChat"
  lambda_function_invoke_arn = "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:${local.account_id}:function:${local.lambda_function_name}/invocations"
}

data "archive_file" "this" {
  type        = "zip"
  source_dir  = "${path.module}/../app/backend/bundle"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "this" {
  function_name    = local.lambda_function_name
  role             = aws_iam_role.this.arn
  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256

  handler = "index.handler"
  runtime = "nodejs16.x"

  environment {
    variables = {
      user           = "AWS User Group Budapest"
      APIGW_ENDPOINT = "https://${aws_apigatewayv2_api.this.id}.execute-api.${local.region}.amazonaws.com/prod"
      TABLE_NAME     = local.dynamodb_table_name
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.this,
    aws_iam_role_policy_attachment.this
  ]
}