############################ VPC ############################

resource "aws_vpc" "vpc" {
  cidr_block = local.vpc.cidr
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id
}

resource "aws_subnet" "publics" {
  for_each = local.public_subnets

  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = each.key
  availability_zone       = each.value
  map_public_ip_on_launch = true

  tags = {
    Name = "public_${each.value}"
  }
}

resource "aws_subnet" "privates" {
  for_each = local.private_subnets

  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = each.key
  availability_zone       = each.value
  map_public_ip_on_launch = true

  tags = {
    Name = "private_${each.value}"
  }
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "mapping" {
  for_each = aws_subnet.publics

  route_table_id = aws_route_table.rt.id
  subnet_id      = each.value.id
}

########################## ALB #####################################
# resource "aws_lb" "alb" {

#   name               = "self-alb"
#   internal           = false # true : vpc 내부에서 접속 , false : vpc 외부에서 접속
#   load_balancer_type = "application"
#   security_groups    = [aws_security_group.alb_sg.id]
#   subnets            = [for subnet in aws_subnet.publics : subnet.id]

#   tags = {
#     Name = "self_alb"
#   }
# }




########################### Security Group ##########################

resource "aws_security_group" "alb_sg" {
  name   = "alb_sg"
  vpc_id = aws_vpc.vpc.id

  // all traffic
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [local.public_ip]
  }

  // https
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [local.public_ip]
  }

  // 8080
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // gitlab instance
  # ingress {
  #     from_port = 443
  #     to_port = 443
  #     protocol = "-1"
  #     cidr_block = [local.public_ip]
  # }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb_sg"
  }
}

resource "aws_security_group" "allow_jenkins" {
  name   = "jenkin_sg"
  vpc_id = aws_vpc.vpc.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_jenkins"
  }
}

# resource "aws_security_group" "allow_gitlab" {
#   name   = "gitlab_sg"
#   vpc_id = aws_vpc.vpc.id

#   ingress {
#     from_port = 0
#     to_port = 0
#     protocol = "-1"
#     cidr_blocks = [local.public_ip]
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
# }

############################ ec2 #############################
resource "aws_key_pair" "jenkins_keypair" {
  key_name   = "jenkins_ssh"
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "aws_key_pair" "gitlab_keypair" {
  key_name   = "gitlab_ssh"
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "aws_eip" "eip" {
  instance = module.jenkins.id
  domain   = "vpc"
}

module "jenkins" {
  source = "terraform-aws-modules/ec2-instance/aws"

  name = "jenkins-ec2"

  ami           = local.ec2.ami
  key_name      = aws_key_pair.jenkins_keypair.key_name
  instance_type = local.ec2.instance_type

  availability_zone           = values(aws_subnet.publics)[0].availability_zone
  subnet_id                   = values(aws_subnet.publics)[0].id
  vpc_security_group_ids      = [aws_security_group.allow_jenkins.id]
  associate_public_ip_address = true

  tags = {
    Name = "jenkins"
  }
}

########################### Event Bridge #########################
module "eventbridge" {
  source   = "terraform-aws-modules/eventbridge/aws"
  bus_name = "ecr_practice_bus"

  rules = {
    orders = {
      event_pattern = <<EOF
        {
          "source": ["aws.ecr"],
          "detail-type": ["ECR Image Action"],
          "detail": {
            "action-type": ["PUSH"],
            "repository-name": ["ecr_practice"]
          }
        }
      EOF
      enabled = true
    }
  }

  targets = {
    orders = [
      {
        name = "hello-world-lambda"
        arn = "arn:aws:lambda:ap-northeast-2:182024812696:function:helloWorld"
      }
    ]
  }
}