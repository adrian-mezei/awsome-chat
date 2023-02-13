resource "aws_apigatewayv2_api" "this" {
  name                       = "AWSomeChat"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_integration" "this" {
  api_id             = aws_apigatewayv2_api.this.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = local.lambda_function_invoke_arn
}

resource "aws_apigatewayv2_route" "this" {
  for_each = toset(["$connect", "$disconnect", "$default"])

  api_id    = aws_apigatewayv2_api.this.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.this.id}"
}

resource "aws_apigatewayv2_deployment" "this" {
  api_id = aws_apigatewayv2_api.this.id

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeployment = sha256(jsonencode([
      aws_apigatewayv2_integration.this,
      aws_apigatewayv2_route.this,
    ]))
  }
}

resource "aws_apigatewayv2_stage" "this" {
  api_id        = aws_apigatewayv2_api.this.id
  name          = local.api_gateway_stage_name
  deployment_id = aws_apigatewayv2_deployment.this.id
}