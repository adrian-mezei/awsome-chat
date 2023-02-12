output "bucket_url" {
  value = "http://${aws_s3_bucket.this.bucket}.s3-website.${local.region}.amazonaws.com"
}