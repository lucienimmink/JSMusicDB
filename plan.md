# JSMusicDB OpenAPI client migration plan

## 1. Goal

Use the node-mp3stream OpenAPI specification as the authoritative source for
all HTTP communication between JSMusicDB and node-mp3stream.

The OpenAPI specification lives in:

    https://github.com/lucienimmink/node-mp3stream-openapi-spec

and is included in JSMusicDB as a Git submodule.

This plan only covers adoption of the OpenAPI specification and generated API
client.

It does NOT cover:

- DLNA
- PlaybackTarget architecture
- remote playback
- player architecture changes
- playlist architecture changes
- AudioContext changes
- audio sample-rate handling
- Media Session changes
- scrobbling changes
- UI changes unrelated to API migration
- node-mp3stream implementation changes

Those concerns are handled by separate plans and branches.

The desired end state is:

    node-mp3stream-openapi-spec
                |
                | Git submodule
                v
         api-spec/openapi.yaml
                |
                | generate
                v
       generated OpenAPI types
                |
                v
          typed API client
                |
                v
       JSMusicDB service layer
                |
                v
        JSMusicDB application

JSMusicDB must no longer manually construct requests for APIs represented by
the OpenAPI specification.

The OpenAPI specification is the single source of truth for:

- paths
- HTTP methods
- request parameters
- request bodies
- response bodies
- response status codes
- authentication requirements
- public API schemas


## 2. Core principles

The implementation must follow these principles.

1. Do not manually duplicate node-mp3stream API request or response types.

2. Do not manually duplicate endpoint URL paths represented by OpenAPI.

3. Do not create a handwritten node-mp3stream SDK.

4. Generate TypeScript API types from OpenAPI.

5. Use a typed OpenAPI client to invoke node-mp3stream.

6. Keep generated files separate from handwritten application code.

7. Never manually modify generated files.

8. Keep HTTP/OpenAPI details behind a small JSMusicDB API abstraction.

9. UI components must not depend directly on generated OpenAPI types unless
   there is a clear reason.

10. Existing application/domain models remain owned by JSMusicDB.

11. Conversion between API DTOs and JSMusicDB models occurs at the API/service
    boundary where required.

12. Updating the OpenAPI submodule must cause type errors or failing tests when
    JSMusicDB no longer satisfies the contract.

13. Generated output must be deterministic and checked in CI.

14. JWT authentication must follow the OpenAPI contract.

15. A JWT must never be placed in a URL.


## 3. Scope

Migrate all node-mp3stream HTTP communication present in this branch to the
generated client where the endpoint is represented in OpenAPI.

Relevant existing communication is currently concentrated primarily in:

    src/utils/node-mp3stream.ts

and in consumers of those utilities.

The migration must identify all direct uses of:

    fetch(...)
    EventSource(...)
    XMLHttpRequest

where the target is node-mp3stream.

Search for manually constructed node-mp3stream paths including:

    /authenticate
    /login
    /public-key
    /listen
    /rescan
    /progress
    /stream
    /image
    /proxy
    /version

Do not assume `src/utils/node-mp3stream.ts` is the only location.

Perform a repository-wide search before migration.


## 4. Explicitly out of scope

Do not implement endpoints merely because they exist in the OpenAPI
specification.

In particular, this plan must not introduce functionality for:

    /api/playback/**

if the current JSMusicDB branch does not already use those operations.

The generated OpenAPI types may naturally contain those operations because
they are part of the shared contract.

That is acceptable.

Do not create:

- DLNA UI
- target selectors
- remote playback clients
- PlaybackTarget abstractions

as part of this task.

The purpose of this branch is to establish contract-driven communication
infrastructure only.


## 5. OpenAPI submodule

Add the specification repository as:

    api-spec/

Expected `.gitmodules` entry:

    [submodule "api-spec"]
        path = api-spec
        url = https://github.com/lucienimmink/node-mp3stream-openapi-spec.git
        branch = main

Initialize with:

    git submodule update --init --recursive

Intentionally update with:

    git submodule update --remote api-spec

The parent JSMusicDB repository must always record the exact API specification
commit against which it was developed.

Do not automatically consume arbitrary future versions of `main` during
application startup or deployment.


## 6. Proposed directory structure

Add:

    src/
      api/
        node-mp3stream/
          client.ts
          auth.ts
          errors.ts
          events.ts
          index.ts

          generated/
            schema.d.ts
            manifest.json

Keep generated files inside the node-mp3stream API boundary.

Do not place generated API definitions together with general JSMusicDB domain
types.


## 7. Toolchain

Use:

    openapi-typescript

to generate TypeScript types from the OpenAPI 3.1 specification.

Use:

    openapi-fetch

as the typed HTTP client.

Use:

    @redocly/cli

for specification linting and bundling.

The intended dependency relationship is:

    openapi.yaml
        |
        v
    openapi-typescript
        |
        v
    paths / operations / components
        |
        v
    openapi-fetch
        |
        v
    typed HTTP calls

Do not use a generator that produces a large framework-specific SDK unless a
concrete limitation in openapi-fetch requires it.

The generated `paths` type plus openapi-fetch is deliberately lightweight.


## 8. Bundle the specification

Before generating TypeScript, bundle the OpenAPI specification.

Conceptually:

    redocly bundle \
      api-spec/openapi.yaml \
      --output <temporary-or-generated-location>

Generation must always use the bundled specification.

Reasons:

- validates references;
- resolves future multi-file specifications;
- provides deterministic generator input;
- avoids coupling generation to the internal layout of the spec repository.

Do not require the specification to remain a single YAML file forever.


## 9. Generate OpenAPI types

Generate:

    src/api/node-mp3stream/generated/schema.d.ts

Conceptually:

    openapi-typescript \
      <bundled-openapi-file> \
      --output src/api/node-mp3stream/generated/schema.d.ts

The generated file provides:

    paths
    operations
    components

No equivalent handwritten types should exist for public API DTOs.


## 10. Generated manifest

Generate:

    src/api/node-mp3stream/generated/manifest.json

Containing at least:

    {
      "specCommit": "...",
      "generatedAt": "...",
      "generator": "openapi-typescript",
      "generatorVersion": "..."
    }

`specCommit` must identify the API-spec submodule commit.

The manifest is diagnostic metadata.

Application behaviour must not depend on `generatedAt`.


## 11. Generated files

Generated files must be committed to JSMusicDB.

Reasons:

- PRs show contract changes.
- CI can detect stale generation.
- editors have types immediately.
- builds do not need to generate API types implicitly.
- coding agents can inspect the effective contract without a setup step.

Generated files must contain a clear generated-code warning.

Never manually edit:

    generated/schema.d.ts


## 12. Package scripts

Add scripts equivalent to:

    spec:lint
    spec:bundle
    spec:generate
    spec:check

Extend the existing repository validation pipeline with:

    typecheck
    test

Provide a single command, preferably:

    pnpm run validate

or integrate this into the project's existing equivalent.

The logical order is:

    OpenAPI lint
        |
        v
    OpenAPI bundle
        |
        v
    generate types
        |
        v
    generated drift check
        |
        v
    TypeScript typecheck
        |
        v
    tests


## 13. Generated drift check

CI must regenerate the API types and compare them with Git.

Equivalent behaviour:

    pnpm run spec:generate
    git diff --exit-code -- src/api/node-mp3stream/generated

This must fail when:

- the spec submodule was updated without regenerating;
- generated code was manually modified;
- generator output changed because dependencies changed.

Generation must be deterministic.


## 14. Typed client

Create:

    src/api/node-mp3stream/client.ts

Import:

    createClient

from:

    openapi-fetch

and generated:

    paths

Conceptually:

    import createClient from 'openapi-fetch';
    import type { paths } from './generated/schema.js';

Create the client against the configured node-mp3stream server.

Do not have every application component independently create an openapi-fetch
client.


## 15. Client creation

Provide one client factory.

Conceptually:

    createNodeMp3StreamClient({
      baseUrl,
      token,
    })

The factory configures:

    baseUrl

and Bearer authentication.

The Authorization header must be:

    Authorization: Bearer <jwt>

Do not append:

    ?jwt=

Do not use:

    X-Cred


## 16. Authentication header

The client must add Bearer authentication to operations requiring it.

Prefer middleware or a single client configuration location rather than adding
the Authorization header independently at every call site.

Conceptually:

    client.use({
      async onRequest({ request }) {
        const jwt = await getJwt();

        if (jwt) {
          request.headers.set(
            'Authorization',
            `Bearer ${jwt}`,
          );
        }

        return request;
      },
    });

The exact implementation should account for the current asynchronous IndexedDB
storage of the JWT.

Do not cache the JWT indefinitely in module state unless existing logout and
token-refresh behaviour remains correct.


## 17. Public operations

The OpenAPI document contains public and authenticated operations.

Do not require a JWT for operations documented as public, such as
authentication bootstrap operations.

The client abstraction must allow:

    /public-key
    /authenticate

to function before a JWT exists.


## 18. Remove URL-based JWT authentication

Search the complete JSMusicDB source tree for:

    jwt=
    ?jwt
    &jwt
    X-Cred

Remove these uses for node-mp3stream communication.

Add a test or source-level validation that ensures no node-mp3stream request
construction contains a JWT query parameter.

JWTs must not occur in:

- fetch URL
- EventSource URL
- audio URL
- proxy URL
- image URL
- media URL


## 19. Existing utility migration

`src/utils/node-mp3stream.ts` currently contains multiple concerns.

Do not simply replace `fetch()` with openapi-fetch inside one increasingly large
utility file.

Move HTTP communication into:

    src/api/node-mp3stream/

Keep compatibility wrappers temporarily only where they reduce migration risk.

For example:

    old application call
        |
        v
    existing exported helper
        |
        v
    new typed client

Then migrate consumers and remove the wrapper when no longer required.


## 20. API facade

Do not expose raw openapi-fetch calls throughout the application unnecessarily.

Provide domain-oriented functions where useful.

For example:

    getServerVersion()
    startLibraryScan()
    getScanProgress()
    findCachedImage()
    uploadCachedImage()
    proxyImage()

These functions use the generated client internally.

They should not manually reconstruct endpoint schemas.


## 21. Do not duplicate OpenAPI DTOs

Bad:

    interface ScanProgressResponse {
      progress: number;
      status: string;
    }

when OpenAPI already defines it.

Use:

    components['schemas']['ScanProgress']

or derive the type from the operation.

When JSMusicDB genuinely needs a different domain model, define a JSMusicDB
domain type and explicitly map the API DTO to it.


## 22. Operation-based typing

Where possible, type by operation rather than component when implementing a
specific API call.

This keeps the client coupled to what the endpoint actually returns.

Use generated:

    operations

for operation-specific helpers.

Create small local type utilities if necessary to avoid unreadable nested
indexing.

Do not manually replicate request and response definitions.


## 23. API error handling

Create:

    src/api/node-mp3stream/errors.ts

Provide a single error representation for JSMusicDB.

For example:

    class NodeMp3StreamApiError extends Error {
      status: number;
      code?: string;
      details?: unknown;
    }

Convert openapi-fetch:

    data
    error
    response

results in one place.

Application components should not all implement their own:

    if (!response.ok) ...

logic.


## 24. Error behaviour

Distinguish:

- network unavailable;
- authentication failure;
- documented API error;
- malformed/unexpected server response;
- abort;
- request timeout if client-side timeouts are used.

Never treat every error as "server unavailable".

Preserve enough information for existing UI error handling.


## 25. Authentication failure

A `401` from an authenticated call must be represented consistently.

Keep logout/login behaviour compatible with the existing JSMusicDB
authentication flow.

Do not scatter:

    delete jwt
    redirect to login

through API functions.

Authentication state changes belong in the existing authentication/application
layer.


## 26. Fetch ownership

Once an operation has been migrated, its consumers must not call node-mp3stream
directly with `fetch`.

A repository search should eventually find no manually constructed
node-mp3stream fetch calls for operations represented by OpenAPI.

Exceptions must be documented.


## 27. Media URL migration

The new API contract uses:

    POST /api/media

to create a temporary capability URL.

The resulting URL can then be assigned to media elements.

This solves the browser limitation that an HTMLAudioElement cannot set a
custom Authorization header.

The OpenAPI client is used for:

    POST /api/media

The media element itself receives only the returned opaque URL.

The implementation must never append the JWT to that URL.


## 28. Media creation helper

Create a helper conceptually similar to:

    createMediaResource(path, purpose)

which invokes the typed OpenAPI operation.

Return only application-useful information such as:

    mediaId
    url
    expiresAt

Do not expose openapi-fetch response internals to player code.


## 29. Media resource lifecycle

This migration should preserve current playback behaviour.

Do not introduce new playback architecture.

When a track needs a media URL:

1. obtain a temporary media resource through the API;
2. assign the returned URL to the existing playback mechanism;
3. preserve current player behaviour.

This plan does not change:

- playlist ownership
- AudioContext behaviour
- ReplayGain
- continuous play
- shuffle
- visualizer architecture

Only media URL acquisition changes where required by the API contract.


## 30. SSE special case

The OpenAPI client can represent `/stream`, but normal REST helpers cannot
consume an indefinitely streaming SSE body as a JSON response.

Implement SSE separately while still sourcing its contract from OpenAPI.

Do not use native:

    EventSource

because Bearer authentication requires a custom Authorization header.

Use:

    fetch()

with:

    Authorization: Bearer <jwt>
    Accept: text/event-stream

and process the returned ReadableStream.


## 31. SSE implementation location

Create:

    src/api/node-mp3stream/events.ts

Responsibilities:

- open authenticated SSE stream;
- parse SSE frames;
- expose named events;
- handle reconnect;
- track Last-Event-ID where useful;
- support AbortSignal;
- normalize stream/network errors;
- deserialize JSON event payloads.

Do not put SSE parsing into UI components.


## 32. SSE authentication

Use the same authentication provider as the OpenAPI client.

The SSE request must use:

    Authorization: Bearer <jwt>

Never:

    /stream?jwt=...


## 33. SSE payload typing

Use generated OpenAPI component types for SSE payload data where provided.

Provide a typed event map around the generated schemas.

For example:

    interface NodeMp3StreamEventMap {
      'library.scan-progress':
        components['schemas']['LibraryScanEventData'];

      ...
    }

Only include events used by this branch.

Do not implement unused playback/DLNA behaviour merely because playback event
schemas exist in OpenAPI.


## 34. SSE parser tests

Test the SSE parser independently from the network layer.

Fixtures should include:

- one event;
- multiple events;
- JSON data;
- event ID;
- multiline data;
- blank-line frame termination;
- partial chunk boundaries;
- multiple events in one chunk;
- comments/keepalive frames;
- malformed JSON;
- reconnect;
- AbortSignal cancellation.

Do not assume each ReadableStream chunk equals one SSE event.


## 35. `/progress` migration

Use the generated API client for polling scan status.

The existing application behaviour that chooses SSE or polling where applicable
may remain.

This plan does not require changing the user-facing scan behaviour.


## 36. `/rescan` migration

Replace manually constructed rescanning requests with the corresponding typed
operation.

Do not manually specify:

- path
- HTTP method
- authentication format

outside the generated client/API facade where the spec already defines them.


## 37. Version endpoint

Migrate version retrieval early.

It is a simple operation suitable for proving the generated client integration.

Use the documented response type.

Preserve existing JSMusicDB capability/version logic unless the contract
explicitly requires change.


## 38. Authentication bootstrap migration

Migrate:

    /public-key
    /authenticate
    /login

carefully because these calls bootstrap the API client itself.

The public-key and authentication calls operate before a JWT exists.

The login-validation operation uses Bearer authentication.

Remove X-Cred handling.


## 39. Artwork migration

Migrate existing image-cache operations represented by OpenAPI.

This includes relevant:

    /image
    /proxy

calls.

Do not change the artwork domain logic.

Only replace handwritten HTTP communication and types.


## 40. Proxy requests

The `remote` URL remains a normal API query parameter because it is application
data, not authentication.

Bearer authentication goes in the Authorization header.

Do not confuse the new "no JWT in query" rule with a ban on all query
parameters.


## 41. Request cancellation

Preserve or introduce AbortSignal support for long-running client-side
operations where useful.

The API facade should allow a caller to provide an AbortSignal for operations
that can reasonably be cancelled.

Do not invent cancellation behaviour for existing flows unless necessary.


## 42. Generated SDK versus generated types

Do not generate a large committed client library if openapi-fetch plus generated
`paths` provides the required functionality.

The effective SDK is:

    generated OpenAPI paths
        +
    openapi-fetch
        +
    JSMusicDB node-mp3stream facade

This prevents large quantities of generated runtime code while still making
the API contract authoritative.


## 43. Tests: generation

Add tests/validation for API generation.

Validate:

1. OpenAPI lints successfully.
2. OpenAPI bundles successfully.
3. openapi-typescript generation succeeds.
4. generated output matches committed output.
5. spec commit in manifest matches checked-out submodule.


## 44. Tests: compile-time client contract

TypeScript must catch invalid API usage.

Add compile-time examples where useful using:

    // @ts-expect-error

Examples:

- invalid path parameter type;
- nonexistent endpoint;
- invalid request body;
- missing required property;
- invalid enum value.

The test passes only when TypeScript correctly rejects the invalid example.


## 45. Tests: client factory

Test the client factory.

Verify:

- correct base URL;
- public request works without JWT;
- authenticated request uses Authorization;
- header format is exactly `Bearer <jwt>`;
- token changes are reflected;
- no JWT enters the URL;
- absent JWT does not produce `Bearer undefined`.


## 46. Tests: security invariant

Add explicit tests asserting:

    URL does not contain JWT

for all migrated authenticated operations.

Search generated request URLs where practical.

Add a repository-level source check for legacy patterns:

    ?jwt=
    &jwt=
    X-Cred

The check may allow documentation/test fixtures only when explicitly needed.

Production source must contain none.


## 47. Tests: API facade

Mock the OpenAPI client boundary.

Test each facade function for:

- correct operation invocation;
- correct request parameters;
- successful DTO mapping;
- documented API error;
- authentication error;
- network error.

Do not mock global fetch independently in every application-component test.


## 48. Tests: media resource

Test:

    createMediaResource()

Verify:

- correct path sent;
- correct purpose sent;
- target ID if relevant to existing branch behaviour;
- returned media URL accepted;
- JWT absent from returned/constructed URL;
- errors normalized.


## 49. Tests: authentication

Test complete client-side authentication flow:

    public-key
        |
        v
    credential encryption
        |
        v
    authenticate
        |
        v
    JWT storage
        |
        v
    authenticated operation

Existing cryptography-specific tests remain separate from API transport tests.


## 50. Tests: login validation

Test:

- valid stored JWT;
- expired/rejected JWT;
- missing JWT;
- server unavailable;
- login endpoint called with Bearer header;
- X-Cred not used.


## 51. Tests: SSE

Test the network wrapper with a mocked streaming Response.

Verify:

- Bearer header;
- Accept header;
- no query JWT;
- event parsing;
- reconnect;
- cancellation;
- event dispatch;
- malformed event handling.


## 52. Tests: integration with mock node-mp3stream

Provide integration tests using a controlled HTTP/mock server that implements a
small subset of the OpenAPI contract.

Test at minimum:

    GET/POST authentication-related flow as appropriate
    version
    progress
    rescan
    media creation

Assertions must include actual HTTP:

- path;
- method;
- Authorization header;
- content type;
- body;
- response mapping.


## 53. Contract fixture validation

Where mock API responses are stored as fixtures, validate those fixtures against
the OpenAPI schemas.

Do not allow test fixtures to become another unofficial version of the API.


## 54. Tests for current JSMusicDB behaviour

The migration must not change existing application behaviour unintentionally.

Ensure coverage around current consumers of node-mp3stream including:

- login/authentication;
- server version detection;
- library rescan;
- progress;
- artwork;
- proxy;
- media URL acquisition;
- SSE-connected behaviour.

This branch is an API client refactoring, not a feature rewrite.


## 55. Repository-wide migration check

After migration, search production source for:

    fetch(

Each remaining use must be reviewed.

It is acceptable for fetch to remain for:

- Fetch-based SSE implementation;
- APIs unrelated to node-mp3stream;
- functionality not represented by the node-mp3stream OpenAPI contract.

A remaining direct node-mp3stream REST fetch must be treated as a migration
defect unless documented.


## 56. API path duplication check

Search production source for manually embedded node-mp3stream endpoint paths.

Examples:

    "/authenticate"
    "/rescan"
    "/progress"
    "/api/media"

Once migrated, application code should not need these strings.

The generated client owns normal REST endpoint paths.

SSE may require `/stream` at its specialized transport boundary, depending on
the capabilities of the selected client library.


## 57. Error regression tests

Ensure errors remain meaningful to the current UI.

Test:

- unreachable server;
- 401;
- 400 validation error;
- 404;
- 500;
- unexpected/non-JSON server response.

Do not leak openapi-fetch's internal response representation into Lit
components.


## 58. CI

The CI pipeline must check out submodules.

Example GitHub Actions setup:

    - uses: actions/checkout@v4
      with:
        submodules: recursive

Then:

    install dependencies
        |
        v
    lint OpenAPI
        |
        v
    bundle OpenAPI
        |
        v
    generate types
        |
        v
    check generated diff
        |
        v
    TypeScript check
        |
        v
    lint JSMusicDB
        |
        v
    tests
        |
        v
    build

Use the repository's existing package manager and lockfile.

Do not introduce a second package manager for API generation.


## 59. Spec update workflow

When the shared API contract changes:

    git submodule update --remote api-spec

Review the new spec commit.

Then:

    npm run spec:generate
    npm run typecheck
    npm test
    npm run build

Fix compile errors by adapting JSMusicDB to the changed contract.

Commit together:

- new submodule pointer;
- regenerated types;
- required JSMusicDB adaptations.

This is the intended mechanism by which contract changes become visible.


## 60. Do not automatically hide spec incompatibilities

Do not use:

    any
    unknown as SomeApiType
    @ts-ignore

to make a changed OpenAPI contract compile.

When the spec changes incompatibly, JSMusicDB should fail compilation until the
code is deliberately updated.

That failure is a feature of this architecture.


## 61. Dependency pinning

Pin:

- openapi-typescript;
- openapi-fetch;
- Redocly CLI;

through the normal package lock.

CI must not rely on globally installed tooling.

Generator upgrades should be explicit dependency updates.


## 62. Migration sequence

### Phase 1: contract infrastructure

1. Add OpenAPI submodule.
2. Add OpenAPI linting.
3. Add bundling.
4. Add type generation.
5. Add generated manifest.
6. Add drift validation.
7. Add required dependencies.
8. Add CI submodule checkout.

No application behaviour changes yet.


### Phase 2: typed client

1. Add node-mp3stream client factory.
2. Add Bearer authentication middleware.
3. Add common API error handling.
4. Add facade/index exports.
5. Add client tests.

Prove the client using the version endpoint.


### Phase 3: authentication

Migrate:

    /public-key
    /authenticate
    /login

Remove:

    X-Cred
    JWT query authentication

Add security regression tests.


### Phase 4: simple API operations

Migrate:

    /version
    /progress
    /rescan

Remove corresponding handwritten HTTP code.


### Phase 5: artwork operations

Migrate:

    /image
    /proxy

Keep existing artwork behaviour.


### Phase 6: media resource API

Migrate browser media acquisition to:

    POST /api/media

Use returned opaque media URL for current browser playback.

Do not refactor the player beyond what is required to acquire the new URL.

Remove use of:

    /listen?...jwt=...


### Phase 7: SSE

Replace native EventSource/query JWT with:

    Fetch
    Authorization: Bearer
    ReadableStream SSE parser

Keep existing application event behaviour.

Do not add DLNA playback event handling in this branch unless already required
by existing functionality.


### Phase 8: cleanup

1. Remove obsolete HTTP helpers.
2. Remove duplicate API DTO interfaces.
3. Remove X-Cred code.
4. Remove query JWT code.
5. Audit direct fetch usage.
6. Audit manual endpoint path strings.
7. Run complete validation.


## 63. Validation before completion

From a clean checkout:

    git submodule update --init --recursive
    package-manager install
    npm run validate
    npm run build

Everything must succeed without globally installed OpenAPI tooling.


## 64. Definition of Done

The migration is complete when all conditions below are met.

### Specification

- The OpenAPI specification exists as a Git submodule.
- JSMusicDB records an exact spec commit.
- The specification passes linting and bundling.
- TypeScript definitions are generated from the specification.
- Generated output is deterministic.
- Stale generated output fails CI.

### API client

- openapi-fetch uses the generated `paths`.
- A single client factory configures node-mp3stream.
- REST paths are no longer manually constructed in application code.
- Request/response DTOs are not manually duplicated.

### Authentication

- Authenticated REST requests use `Authorization: Bearer`.
- X-Cred is no longer used.
- JWT query parameters are no longer used.
- JWTs are not present in media URLs.
- JWTs are not present in SSE URLs.

### Media

- Media capability creation uses the typed API.
- Existing browser playback receives an opaque media URL.
- Player architecture beyond this URL acquisition is unchanged.

### SSE

- SSE uses Fetch with Bearer authentication.
- SSE framing is parsed correctly across arbitrary stream chunks.
- Existing relevant events continue to reach their consumers.
- No EventSource URL contains credentials.

### Error handling

- API errors are normalized centrally.
- Authentication failures are handled consistently.
- Network errors can be distinguished from API errors.
- UI components do not depend on openapi-fetch response internals.

### Tests

- Generation tests pass.
- Type checking passes.
- API client tests pass.
- Authentication tests pass.
- Security invariant tests pass.
- Media API tests pass.
- SSE parser tests pass.
- Integration tests pass.
- Existing affected JSMusicDB behaviour remains covered.

### CI

- Submodules are initialized.
- OpenAPI is linted.
- Types are regenerated.
- Generated drift is checked.
- Type checking runs.
- Tests run.
- JSMusicDB build succeeds.

### Architectural scope

- No DLNA functionality was introduced.
- No PlaybackTarget functionality was introduced.
- No remote playback architecture was introduced.
- No playlist ownership changes were made.
- No AudioContext redesign was performed.
- No unrelated player refactoring was performed.

The result of this branch is intentionally boring:

JSMusicDB communicates with node-mp3stream through one typed, specification-
driven boundary, while existing JSMusicDB application behaviour remains
functionally unchanged.
