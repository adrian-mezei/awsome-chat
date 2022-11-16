resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${local.lambda_function_name}"
  retention_in_days = 3
}