import Fastify from "fastify";
import cors from "@fastify/cors";

const fastify = Fastify({
    disableRequestLogging: true,
    logger: {
        transport: {
            target: 'pino-pretty'
        },
        serializers: {
            res(reply) {
                // The default
                return {
                    statusCode: reply.statusCode
                }
            },
            req(request) {
                return {
                    method: request.method,
                    url: request.url,
                    path: request.routeOptions.url,
                    parameters: request.params,
                    // Including the headers in the log could be in violation
                    // of privacy laws, e.g. GDPR. You should use the "redact" option to
                    // remove sensitive fields. It could also leak authentication data in
                    // the logs.
                    headers: request.headers
                };
            }
        }
    }
})

fastify.addHook('preHandler', function (req, reply, done) {
    req.log.info({
        method: req.method,
        url: req.url,
        query: req.query,
        headers: req.headers,
        body: req.body,
    }, 'Got request');
    done()
});

// TODO - allow cors but require authentication and verify it with the home assistant api
await fastify.register(cors, {
    origin: true,
    credentials: true,
    // put your options here
});

// Not setting OPTIONS as it is handled by cors plugin
['delete', 'get', 'post', 'put', 'patch', 'head'].map(method => {
    fastify[method]('*', handleApi);
})
async function handleApi(req, res) {
    return {
        method: req.method,
        url: req.url,
        query: req.query,
        headers: req.headers,
        body: req.body,
    };
}

await fastify.listen({
    port: 3000,
    host: '0.0.0.0'
});
