data "aws_caller_identity" "this" {}
data "aws_region" "this" {}

locals {
  account_id = data.aws_caller_identity.this.account_id
  region     = data.aws_region.this.name

  dynamodb_table_name = "AWSomeChat"

  api_gateway_stage_name = "prod"

  lambda_function_name       = "AWSomeChat"
  lambda_function_invoke_arn = "arn:aws:apigateway:${local.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${local.region}:${local.account_id}:function:${local.lambda_function_name}/invocations"
}