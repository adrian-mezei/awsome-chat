data "archive_file" "this" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/bundle"
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
      APIGW_ENDPOINT = "https://${aws_apigatewayv2_api.this.id}.execute-api.${local.region}.amazonaws.com/${local.api_gateway_stage_name}"
      TABLE_NAME     = local.dynamodb_table_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.this, aws_iam_role_policy_attachment.this]
}

resource "aws_lambda_permission" "this" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}