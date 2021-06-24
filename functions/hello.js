"use strict";

const openTelemetryAPI = require("@opentelemetry/api");

let niceResponse;

const generate_a_nice_response = async () => {
  // wait here before getting the span
  // await forSomeMilliSeconds(2000);

  console.log(
    "nice response Span? ",
    openTelemetryAPI.trace.getSpan(openTelemetryAPI.context.active())
  );

  /* -- getSpan Log ---
    nice response Span?  undefined
  */

  return "Hi, there! Thanks how can i help you ?";
};

/* -- timer function-- 
this function is written in order to
a. execute after the tracer starts a Span with the purpose to get the span created 
b. execute after the tracer ends the created span with the purpose to see the app-developer created traces in X-RAY
c. execute at the beginning of Lambda invocation, before gettting an instance of a Tracer
*/
const forSomeMilliSeconds = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`time of ${time}ms expired`);
    }, time);
  });
};

const hello = async (event, context) => {
  const waitOnLambdaInvocation = await forSomeMilliSeconds(2000);

  console.log(`on Lambda Invocation, ${waitOnLambdaInvocation}`);

  const tracer = openTelemetryAPI.trace.getTracer("helloTracer", "1.0");

  console.log("tracer", tracer);

  /* -- Tracer instance Log --   
    tracer ProxyTracer {
    _provider: ProxyTracerProvider {},
      name: 'helloTracer',
      version: '1.0'
  }*/

  const niceResponseSpan = tracer.startSpan("generating nice response");

  niceResponse = await openTelemetryAPI.context.with(
    openTelemetryAPI.trace.setSpan(
      openTelemetryAPI.context.active(),
      niceResponseSpan
    ),
    generate_a_nice_response
  );

  niceResponseSpan.setStatus(openTelemetryAPI.SpanStatusCode.OK);
  niceResponseSpan.end();

  const waitEndSpanResult = await forSomeMilliSeconds(3000);
  console.log(`after end span, ${waitEndSpanResult}`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: niceResponse,
    }),
  };
};

module.exports.handler = hello;
