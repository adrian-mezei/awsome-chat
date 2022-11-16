data "aws_iam_policy_document" "websocket_handler_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
  }
}

data "aws_iam_policy_document" "websocket_handler" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["${aws_cloudwatch_log_group.this.arn}:*"]
  }

  statement {
    actions = [
      "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:PutItem"
    ]
    resources = [aws_dynamodb_table.this.arn]
  }

  statement {
    effect = "Allow"
    actions = ["execute-api:ManageConnections"]
    resources = ["arn:aws:execute-api:${local.region}:${local.account_id}:${aws_apigatewayv2_api.this.id}/prod/POST/*"]
  }
}

resource "aws_iam_policy" "this" {
  name = "${local.lambda_function_name}RolePolicy"
  policy = data.aws_iam_policy_document.websocket_handler.json
}

resource "aws_iam_role" "this" {
  name = "${local.lambda_function_name}Role"
  assume_role_policy = data.aws_iam_policy_document.websocket_handler_assume_role.json
}

resource "aws_iam_role_policy_attachment" "this" {
  policy_arn = aws_iam_policy.this.arn
  role       = aws_iam_role.this.name
}