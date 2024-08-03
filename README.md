# OAI-PMH Multi Viewer Example

### Building the service

```
docker build -t oai-pmh-view .
```
### Starting the multi service (Docker only, no docker compose)

Key | Description | Default
---:| ------- | ------
WEB_PORT   | HTTP Port Number| 80
HTTPS_PORT | HTTPS Port Number | 443
SITES_CONF | OAI-PMH Sites Configuration| 'src/view.json'
CERT_PATH  |Cert Full Chain| defaultCertPath 
KEY_PATH   |Cert Private Key | defaultKeyPath 
SECURE     | Should use https | false 
HTTPS_REDIRECT | To which https to redirect | 'none'

Configuration file format:
```
[
 {
    "key": "HTW",
    "server": "http://localhost:7002",
    "prefix": "/scicat/oai",
    "description": "HTW Example Scicat",
 } ,
 {
    "key": "B2FIND",
    "server": "http://b2find.eudat.eu:7002",
    "prefix": "/scicat/oai",
    "description": "B2Find (EUDAT) Harvester",
    "type": "harvester"
 } ,
 {
    "key": "HZDR",
    "server": "https://rodare.hzdr.de",
    "prefix": "/oai2d",
    "description": "Helmholtz-Zentrum Dresden-Rossendorf"
 }, ....
]
```

```
docker run \
  -e SITES_CONF='/home/node/app/config/view.json' \
  -e WEB_PORT=80 \
  -e SECURE=true
  -e HTTPS_PORT=443 \
  -e CERT_PATH='/etc/letsencrypt/live/zam12168.zam.kfa-juelich.de/fullchain.pem' \
  -e KEY_PATH='/etc/letsencrypt/live/zam12168.zam.kfa-juelich.de/fullchain.pem' \
  -p 80:80 \
  -p 443:443 \
  -v  /..:/home/node/app/config \
  -v  /etc/letsencrypt:/etc/letsencrypt \
 oai-pmh-view
```

# OAI-PMH Viewer Example

### Starting the service (Docker only, no docker compose)

**Note**: The service doesn't use the 'env' package. The
configuration is solely done with 'environment' variables.

Key | Description | Default
---:| ------- | ------
OAI_HOST | Hostname of the oai-pmh server | oai-pmh-service
OAI_PORT | Port number of the oai-pmh server | 3001
OAI_PREFIX | oai-pmh prefix for scicat | /scicat/oai 
WEB_PORT | Port of this web service | 8300
HTTPS_REDIRECT | Redirect to https server | none 



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

### Check
Check only works if the 'secret' is correctly configured.
