const opentracing = require('opentracing')
const jaeger = require('jaeger-client')
const config = require('../config')

// Initialize Jaeger tracer
const jaegerConfig = {
  serviceName: config.SERVICE_NAME,
  sampler: {
    type: config.JAEGER_SAMPLER_TYPE,
    param: config.JAEGER_SAMPLER_PARAM
  },
  reporter: {
    logSpans: config.NODE_ENV === 'development',
    agentHost: config.JAEGER_ENDPOINT.split('://')[1].split(':')[0],
    agentPort: 6832
  }
}

const options = {
  logger: {
    info: (msg) => console.log('JAEGER INFO:', msg),
    error: (msg) => console.log('JAEGER ERROR:', msg)
  }
}

const tracer = jaeger.initTracer(jaegerConfig, options)

// Set as global tracer
opentracing.initGlobalTracer(tracer)

module.exports = tracer
