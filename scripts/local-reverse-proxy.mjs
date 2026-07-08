#!/usr/bin/env node
import http from "node:http";
import { URL } from "node:url";

const port = Number(process.env.LOCAL_PROXY_PORT || 8088);
const routes = [
  { prefix: "/auth/", target: process.env.AUTH_APP_URL || "http://127.0.0.1:3000/" },
  { prefix: "/reference-data/", target: process.env.REFERENCE_DATA_APP_URL || "http://127.0.0.1:3001/" },
  { prefix: "/charge-agreements/", target: process.env.CHARGE_AGREEMENTS_APP_URL || "http://127.0.0.1:3002/" }
];

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("missing url\n");
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok\n");
    return;
  }

  const route = routes.find((candidate) => req.url.startsWith(candidate.prefix));
  if (!route) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found\n");
    return;
  }

  const target = new URL(req.url.slice(route.prefix.length), route.target);
  proxy(req, res, target);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`local reverse proxy listening on http://127.0.0.1:${port}`);
});

function proxy(req, res, target) {
  const upstream = http.request(
    target,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host,
        "x-forwarded-host": req.headers.host || "",
        "x-forwarded-proto": "http"
      }
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    }
  );

  upstream.on("error", (error) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "upstream_unavailable", detail: error.message }));
  });

  req.pipe(upstream);
}
