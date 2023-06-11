locals {
  config = jsondecode(file("config.json"))

  public_ip = local.config.public_ip
  env       = local.config.env
  vpc       = local.config.vpc
  ec2       = local.config.ec2

  azs = [
    for az in local.vpc.azs : "${local.vpc.region}${az}"
  ]

  public_subnets = {
    for i, az in local.azs :
    local.config.subnet.public_cidrs[i] => az
  }

  private_subnets = {
    for i, az in local.azs :
    local.config.subnet.private_cidrs[i] => az
  }
}