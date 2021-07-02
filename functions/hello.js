"use strict";

const openTelemetryAPI = require("@opentelemetry/api");

let niceResponse;

const generate_a_nice_response = async () => {
  console.log(
    "nice response Span? ",
    openTelemetryAPI.getSpan(openTelemetryAPI.context.active())
  );

  return "Hi, there! Thanks how can i help you ?";
};

const hello = async (event, context) => {
  const tracer = openTelemetryAPI.trace.getTracer("helloTracer", "1.0");

  niceResponse = await generate_a_nice_response();

  const niceResponseSpan = tracer.startSpan("generating nice response");

  niceResponse = await openTelemetryAPI.context.with(
    openTelemetryAPI.setSpan(
      openTelemetryAPI.context.active(),
      niceResponseSpan
    ),
    generate_a_nice_response
  );

  niceResponseSpan.setStatus({ code: openTelemetryAPI.SpanStatusCode.OK });
  niceResponseSpan.end();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: niceResponse,
    }),
  };
};

module.exports.handler = hello;
