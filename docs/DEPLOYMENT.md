# Deployment Guide

## Production Environment

### Prerequisites
- AWS account with IAM permissions
- Terraform 1.5+
- Docker 24.0+

### Steps
1. Configure infrastructure:
```bash
cd infrastructure/terraform
terraform init
terraform apply -var="db_password=securepassword"
```

2. Deploy containers:
```bash
docker-compose -f docker/compose.prod.yml up -d
```

## Development Setup
```bash
docker-compose -f docker/compose.dev.yml up
```

## Monitoring
| Service          | URL                        |
|------------------|----------------------------|
| Grafana          | `http://monitoring:3000`   |
| Prometheus       | `http://prometheus:9090`   |
| Node Exporter    | `http://nodes:9100/metrics`|
