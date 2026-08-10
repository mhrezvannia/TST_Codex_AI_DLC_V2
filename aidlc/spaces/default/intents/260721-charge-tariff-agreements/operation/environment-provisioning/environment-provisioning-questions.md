# Environment Provisioning Questions — W2-03

## Upstream context

This stage consumes every unit `deployment-architecture`,
`infrastructure-services`, and the approved `cd-config`. They define a local
Compose acceptance environment only. No AWS account, region, VPC, subnet,
security group, NACL, IAM role, Secrets Manager parameter, cross-account link,
or cloud IaC stack is approved.

## Decisions required

1. Validate only the existing local `linercore-wave-a` environment, or expand
   this feature into AWS provisioning?
2. Should environment mutation wait until all prerequisite capabilities pass,
   or attempt provisioning despite the Docker/native-writer blocks?
3. Keep explicit local-only credentials under the local profile, or introduce
   an unapproved cloud secrets service?

## Recommended answers

- Validate local Wave A only.
- Do not mutate the environment while required preflight capabilities are
  blocked; record inventory and validation evidence honestly.
- Keep the existing local-only secret boundary. Any non-local environment must
  fail closed until a separately approved platform supplies managed secret
  custody.

