locals {
  dynamodb_table_name = "AWSomeChat"
}

resource "aws_dynamodb_table" "this" {
  name = local.dynamodb_table_name
  hash_key = "connectionId"

  attribute {
    name = "connectionId"
    type = "S"
  }

  billing_mode = "PAY_PER_REQUEST"
}