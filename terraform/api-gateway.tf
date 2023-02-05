resource "aws_apigatewayv2_api" "this" {
  name          = "AWSomeChat"
  protocol_type = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_integration" "this" {
  api_id           = aws_apigatewayv2_api.this.id
  integration_type = "AWS_PROXY"
  integration_method = "POST"
  integration_uri = local.lambda_function_invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"
  content_handling_strategy = "CONVERT_TO_TEXT"
}

resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "$connect"
  target = "integrations/${aws_apigatewayv2_integration.this.id}"
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "$disconnect"
  target = "integrations/${aws_apigatewayv2_integration.this.id}"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "$default"
  target = "integrations/${aws_apigatewayv2_integration.this.id}"
}

resource "aws_apigatewayv2_stage" "this" {
  api_id = aws_apigatewayv2_api.this.id
  name   = "prod"
  deployment_id = aws_apigatewayv2_deployment.this.id
}

resource "aws_apigatewayv2_deployment" "this" {
  api_id = aws_apigatewayv2_api.this.id

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeployment = sha256(jsonencode([
      aws_apigatewayv2_integration.this,

      aws_apigatewayv2_route.connect,
      aws_apigatewayv2_route.disconnect,
      aws_apigatewayv2_route.default,
    ]))
  }
}