#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";

const json = process.argv.includes("--json");
const localTools = path.join(process.cwd(), ".local-tools");
const localJavaHome = path.join(localTools, "jdk-21");
const localJava = path.join(localJavaHome, "bin", process.platform === "win32" ? "java.exe" : "java");
const localMaven = path.join(localTools, "apache-maven", "bin", process.platform === "win32" ? "mvn.cmd" : "mvn");
const authBypassEnabled =
  process.env.AUTH_BYPASS === "true" || process.env.REFERENCE_DATA_AUTH_BYPASS === "true";
const hostRuntimeEnabled = process.env.HOST_RUNTIME === "true";

const commands = [
  { id: "node", command: "node", args: ["--version"], required: true },
  {
    id: "yarn",
    command: "yarn",
    args: ["--version"],
    required: true,
    fallback: { command: process.execPath, args: [path.join(process.cwd(), ".yarn", "releases", "yarn-4.5.3.cjs"), "--version"], label: "vendored Yarn" }
  },
  { id: "java", command: "java", args: ["-version"], required: true, fallback: { command: localJava, args: ["-version"], label: "local JDK" } },
  {
    id: "maven",
    command: "mvn",
    args: ["--version"],
    required: true,
    fallback: {
      command: localMaven,
      args: ["--version"],
      label: "local Maven",
      env: { JAVA_HOME: localJavaHome, PATH: `${path.join(localJavaHome, "bin")}${path.delimiter}${process.env.PATH || ""}` }
    }
  },
  { id: "docker", command: "docker", args: ["version", "--format", "{{.Server.Version}}"], required: !hostRuntimeEnabled }
];

const ports = [
  { id: "postgres", port: 5432, required: true },
  { id: "keycloak", port: 8080, required: !authBypassEnabled && !hostRuntimeEnabled },
  { id: "identity-service", port: 8082, required: true },
  { id: "reference-data-service", port: 8083, required: true },
  { id: "nginx", port: 8088, required: true },
  { id: "schema-registry", port: 8081, required: false },
  { id: "kafka", port: 9092, required: false },
  { id: "grafana", port: 3001, required: false }
];

const commandResults = commands.map(checkCommand);
const portResults = await Promise.all(ports.map(checkPort));
const results = [...commandResults, ...portResults];
const blocked = results.filter((result) => result.required && result.status !== "ready");
const warnings = results.filter((result) => !result.required && result.status !== "ready");

const report = {
  status: blocked.length === 0 ? "ready" : "blocked",
  checkedAt: new Date().toISOString(),
  summary: {
    requiredReady: results.filter((result) => result.required && result.status === "ready").length,
    requiredBlocked: blocked.length,
    optionalWarnings: warnings.length
  },
  checks: results
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Local prerequisite status: ${report.status}`);
  for (const result of results) {
    const marker = result.status === "ready" ? "OK" : result.required ? "BLOCKED" : "WARN";
    console.log(`${marker.padEnd(7)} ${result.id.padEnd(24)} ${result.detail}`);
  }
}

process.exitCode = blocked.length === 0 ? 0 : 1;

function checkCommand({ id, command, args, required, fallback }) {
  const result = spawnCommand(command, args);
  if (result.error || result.status !== 0) {
    if (fallback) {
      const fallbackResult = spawnCommand(fallback.command, fallback.args, fallback.env);
      if (!fallbackResult.error && fallbackResult.status === 0) {
        const output = `${fallbackResult.stdout || fallbackResult.stderr}`.trim().split(/\r?\n/)[0];
        return {
          id,
          type: "command",
          required,
          status: "ready",
          detail: `${fallback.label}: ${output || "available"}`
        };
      }
    }

    const stderr = (result.stderr || result.error?.message || "not available").split(/\r?\n/)[0];
    return { id, type: "command", required, status: "blocked", detail: stderr || "not available" };
  }

  const output = `${result.stdout || result.stderr}`.trim().split(/\r?\n/)[0];
  return { id, type: "command", required, status: "ready", detail: output || "available" };
}

function spawnCommand(command, args, env = {}) {
  const useShell = process.platform === "win32" && command.endsWith(".cmd");
  const spawnCommandText = useShell ? [command, ...args].map(quoteShellArg).join(" ") : command;
  return spawnSync(spawnCommandText, useShell ? [] : args, {
    encoding: "utf8",
    env: { ...process.env, ...env },
    timeout: 10000,
    shell: useShell
  });
}

function quoteShellArg(value) {
  if (!/[\s"]/u.test(value)) return value;
  return `"${value.replaceAll("\"", "\\\"")}"`;
}

function checkPort({ id, port, required }) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port, timeout: 1000 });
    socket.once("connect", () => {
      socket.destroy();
      resolve({ id, type: "port", required, status: "ready", detail: `listening on 127.0.0.1:${port}` });
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve({ id, type: "port", required, status: "blocked", detail: `not listening on 127.0.0.1:${port}` });
    });
    socket.once("error", () => {
      resolve({ id, type: "port", required, status: "blocked", detail: `not listening on 127.0.0.1:${port}` });
    });
  });
}
