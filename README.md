## hello-world 

### Requirements
- env variables: SQS_QUEUE_1_URL, DATABASE_REGION, DATABASE_URL, DATABASE_USERNAME, DATABASE_NAME. When deployed via ArgoCD, those are populated by `aws-infra-data-config` ConfigMap created by terraform code. See `/dev/deployment.yaml`

### Endpoints
- `GET /` hello world :)
- `GET /database` to test database connectivity and IAM permissions
- `GET /sqs-send` to send a dummy SQS message
- `GET /sqs-receive` to show all the messages in the queue

### Notes
- Code is trash, it's just meant to "work" and test the Service Account permissions when running in EKS Pod and IAM Auth method for RDS