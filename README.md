# OAI-PMH Viewer Example

## Building the service

```
docker build -t oai-pmh-view .
```

### Starting the service (Docker only, no docker compose)

**Note**: The service doesn't use the 'env' package. The
configuration is solely done with 'environment' variables.

Key | Description | Default
---:| ------- | ------
OAI_HOST | Hostname of the oai-pmh server | oai-pmh-service
OAI_PORT | Port number of the oai-pmh server | 3001
OAI_PREFIX | oai-pmh prefix for scicat | /scicat/oai 
WEB_PORT | Port of this web service | 8300

```
docker run \
  -e WEB_PORT=8300 \
  -e OAI_HOST=oai-pmh-service \
  -e OAI_PORT=3001 \
  -e OAI_PREFIX='/scicat/oai'  \
  --network scicatlive_default \
  -p 8300:8300 \
 oai-pmh-view
```

**Note**: The most recent version of  oai-pmh-view supports
```
-e OAI_PREFIX='/generic/oai'
```
which can be used with all formats.
