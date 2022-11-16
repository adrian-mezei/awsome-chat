output "api_gateway_url" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/prod"
}

output "bucket_url" {
  value = "http://${aws_s3_bucket.this.bucket}.s3-website.${local.region}.amazonaws.com"
}

output "account_id" {
  value = data.aws_caller_identity.this.account_id
}