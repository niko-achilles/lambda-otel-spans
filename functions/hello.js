"use strict";

const openTelemetryAPI = require("@opentelemetry/api");

let niceResponse;

const generate_a_nice_response = () => {
  console.log(
    "nice response Span? ",
    openTelemetryAPI.trace.getSpan(openTelemetryAPI.context.active())
  );

  /* -- getSpan Log ---
    nice response Span?  undefined
  */

  return "Hi, there! Thanks how can i help you ?";
};

const hello = async (event, context) => {
  const tracer = openTelemetryAPI.trace.getTracer();

  console.log("tracer", tracer);

  /* -- Tracer instance Log --   
    tracer ProxyTracer {
     _provider: ProxyTracerProvider {},
     name: undefined,
     version: undefined
  }*/

  const niceResponseSpan = tracer.startSpan("generating nice response");

  niceResponse = openTelemetryAPI.context.with(
    openTelemetryAPI.trace.setSpan(
      openTelemetryAPI.context.active(),
      niceResponseSpan
    ),
    generate_a_nice_response
  );

  niceResponseSpan.setStatus(openTelemetryAPI.SpanStatusCode.OK);
  niceResponseSpan.end();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: niceResponse,
    }),
  };
};

module.exports.handler = hello;
