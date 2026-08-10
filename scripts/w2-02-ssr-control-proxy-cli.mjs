import { CONTROL_PORT, createControlProxy } from "./w2-02-ssr-control-proxy.mjs";

const server = createControlProxy();
server.listen(CONTROL_PORT, "0.0.0.0", () => console.log(`W2-02 SSR control proxy listening on ${CONTROL_PORT}`));
