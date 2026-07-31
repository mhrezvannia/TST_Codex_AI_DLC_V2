import { createHmac, randomBytes } from "node:crypto";

const KID = /^[A-Za-z0-9_-]{1,32}$/;
const CORRELATION = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const METHOD = /^[A-Z]+$/;
const CONTROL = /[\u0000-\u001f\u007f]/;

export type SubjectAssertionClaims = Readonly<{
  iss: "charge-agreements-bff";
  kid: string;
  sub: string;
  mth: string;
  pth: string;
  cid: string;
  iat: string;
  exp: string;
  nonce: string;
}>;

export type IssueSubjectAssertionInput = Readonly<{
  kid: string;
  secret: string | Uint8Array;
  subjectId: string;
  method: string;
  path: string;
  correlationId: string;
  nowSeconds?: number;
  nonceBytes?: Uint8Array;
}>;

export type IssuedSubjectAssertion = Readonly<{
  headerValue: string;
  claims: SubjectAssertionClaims;
  payloadUtf8Hex: string;
}>;

export function issueSubjectAssertion(input: IssueSubjectAssertionInput): IssuedSubjectAssertion {
  if (!KID.test(input.kid)) throw new Error("SUBJECT_ASSERTION_KID_INVALID");
  const method = input.method.toUpperCase();
  if (!METHOD.test(method)) throw new Error("SUBJECT_ASSERTION_METHOD_INVALID");
  const path = normalizeAssertionPath(input.path);
  if (!CORRELATION.test(input.correlationId)) throw new Error("SUBJECT_ASSERTION_CORRELATION_INVALID");
  const subject = claimValue(input.subjectId, 128, "SUBJECT_ASSERTION_SUBJECT_INVALID");
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(now) || now < 0) throw new Error("SUBJECT_ASSERTION_TIME_INVALID");
  const nonceBytes = input.nonceBytes ?? randomBytes(16);
  if (nonceBytes.byteLength !== 16) throw new Error("SUBJECT_ASSERTION_NONCE_INVALID");
  const claims: SubjectAssertionClaims = Object.freeze({
    iss: "charge-agreements-bff",
    kid: input.kid,
    sub: subject,
    mth: method,
    pth: path,
    cid: input.correlationId,
    iat: String(now),
    exp: String(now + 30),
    nonce: Buffer.from(nonceBytes).toString("base64url")
  });
  const payload = encodeSubjectAssertionPayload(claims);
  const payloadBase64 = payload.toString("base64url");
  const signingInput = `v1.${input.kid}.${payloadBase64}`;
  const signature = createHmac("sha256", input.secret).update(signingInput, "ascii").digest("base64url");
  return Object.freeze({
    headerValue: `${signingInput}.${signature}`,
    claims,
    payloadUtf8Hex: payload.toString("hex")
  });
}

export function encodeSubjectAssertionPayload(claims: SubjectAssertionClaims): Buffer {
  const fields: ReadonlyArray<readonly [keyof SubjectAssertionClaims, string]> = [
    ["iss", claims.iss],
    ["kid", claims.kid],
    ["sub", claims.sub],
    ["mth", claims.mth],
    ["pth", claims.pth],
    ["cid", claims.cid],
    ["iat", claims.iat],
    ["exp", claims.exp],
    ["nonce", claims.nonce]
  ];
  let record = "lc-bff-assertion:v1\n";
  for (const [name, value] of fields) {
    claimValue(value, 2048, `SUBJECT_ASSERTION_${name.toUpperCase()}_INVALID`);
    record += `${name}:${Buffer.byteLength(value, "utf8")}:${value}\n`;
  }
  return Buffer.from(record, "utf8");
}

export function normalizeAssertionPath(value: string): string {
  if (!value.startsWith("/") || value.includes("?") || value.includes("#")
    || value.includes("\\") || CONTROL.test(value)) {
    throw new Error("SUBJECT_ASSERTION_PATH_INVALID");
  }
  let decoded: string;
  try {
    decoded = decodeURI(value);
  } catch {
    throw new Error("SUBJECT_ASSERTION_PATH_INVALID");
  }
  const canonical = encodeURI(decoded).replace(/%[0-9a-f]{2}/g, (value) => value.toUpperCase());
  if (canonical.includes("//") || canonical.length > 2048) {
    throw new Error("SUBJECT_ASSERTION_PATH_INVALID");
  }
  return canonical;
}

function claimValue(value: string, maximum: number, code: string): string {
  if (!value || value.length > maximum || CONTROL.test(value)) throw new Error(code);
  return value;
}
