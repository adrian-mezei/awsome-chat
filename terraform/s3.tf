resource "aws_s3_bucket" "this" {
  bucket_prefix = "chat-"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.this.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

module "template_files" {
  source = "hashicorp/dir/template"

  base_dir = "${path.module}/../app/frontend/"
}

resource "aws_s3_object" "index" {
  for_each = module.template_files.files

  bucket       = aws_s3_bucket.this.bucket
  key          = each.key
  source       = each.value.source_path
  content_type = each.value.content_type
  etag         = filemd5(each.value.source_path)

  acl = "public-read"
}

resource "local_file" "config" {
  filename = "./config.js"
  content  = templatefile("${path.module}/../app/frontend/config.tpl", {
    api_id = aws_apigatewayv2_api.this.id
    region = data.aws_region.this.name
    stage  = aws_apigatewayv2_stage.this.name
  })
}

resource "aws_s3_object" "config" {
  bucket = aws_s3_bucket.this.bucket
  key    = "config.js"
  source = "./config.js"
  content_type = "text/javascript"

  acl = "public-read"

  depends_on = [local_file.config]
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.bucket

  block_public_acls = false
  block_public_policy = false
  ignore_public_acls = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "s3" {
  statement {
    principals {
      identifiers = ["*"]
      type        = "*"
    }
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.this.arn}/*"
    ]
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.bucket
  policy = data.aws_iam_policy_document.s3.json
}