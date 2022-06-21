https://cloud.google.com/run/docs/triggering/websockets#multiple-instances
https://cloud.google.com/run/docs/tutorials/websockets
https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service
https://cloud.google.com/run/docs/deploying-source-code
https://cloud.google.com/vpc/docs/serverless-vpc-access
https://cloud.google.com/vpc/docs/configure-serverless-vpc-access
https://cloud.google.com/run/docs/tutorials/identity-platform
https://cloud.google.com/memorystore/docs/redis/memory-management-best-practices#determine_the_initial_size_of_a_cloud_memorystore_instance
https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/4b997c231bc990c7f6dc2535b611b8e948cbce69/run/websockets/app.js

Handling request timeouts and client reconnects
WebSockets requests are treated as long-running HTTP requests in Cloud Run. They are subject to request timeouts (currently up to 60 minutes and defaults to 5 minutes) even if your application server does not enforce any timeouts.

Accordingly, if the client keeps the connection open longer than the required timeout configured for the Cloud Run service, the client will be disconnected when the request times out.

Therefore, WebSockets clients connecting to Cloud Run should handle reconnecting to the server if the request times out or the server disconnects. You can achieve this in browser-based clients by using libraries such as reconnecting-websocket or by handling "disconnect" events if you are using the SocketIO library.

Maximizing concurrency
WebSockets services are typically designed to handle many connections simultaneously. Since Cloud Run supports concurrent connections (up to 1000 per container), Google recommends that you increase the maximum concurrency setting for your container to a higher value than the default if your service is able to handle the load with given resources.

gcloud beta run deploy ws-testp --source . \
 --vpc-connector connector-ws-test \
--allow-unauthenticated \
 --timeout 3600 \
 --service-account ws-test-identity \
 --update-env-vars REDISHOST=$REDISHOST

This command is equivalent to running `gcloud builds submit --pack image=[IMAGE] .` and `gcloud run deploy ws-testp --image [IMAGE]`
