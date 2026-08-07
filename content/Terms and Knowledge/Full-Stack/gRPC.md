---
tags: [term, fullstack, api, microservices]
category: API & Networking
---

# gRPC

**Definition:** A high-performance RPC (remote procedure call) framework using binary protocol buffers instead of JSON.

## How It Works
- You define service methods and message types in a `.proto` file
- gRPC generates client and server code in multiple languages from that one definition
- The `.proto` file is the single source of truth, run `protoc` (the Protocol Buffers compiler) or `buf` against it, and it generates strongly-typed client stubs and server interfaces in whatever languages you need (Go, Java, Python, TypeScript, C++, and more), all guaranteed to agree on the wire format
- Calling a remote method looks exactly like calling a local function, `client.GetUser(request)`, the generated stub handles serialization, the network call, and deserialization behind that interface
- Every gRPC call runs over a single HTTP/2 connection, which multiplexes many concurrent requests/streams over one TCP connection without them blocking each other, unlike HTTP/1.1 where concurrent requests need separate connections or queue behind each other

## Why It Matters
- Much faster and smaller payloads than REST/JSON, common for internal microservice-to-microservice calls
- Code generation eliminates an entire category of integration bugs, hand-written REST clients that drift out of sync with the actual API shape, since the client and server stubs are generated from the exact same `.proto` file
- Protocol Buffers are a compact binary format, field names aren't repeated in every message like JSON keys are, and values are encoded efficiently (varints for integers, no whitespace/quoting overhead), typically 3-10x smaller on the wire than equivalent JSON
- The generated client/server code means the request/response shape is enforced by the compiler in both languages, a field renamed or removed on one side fails to compile rather than failing silently at runtime like an untyped REST JSON body can
- HTTP/2 multiplexing plus native support for streaming (see RPC types below) makes gRPC a natural fit for high-throughput internal service meshes, not just request/response but continuous data flows

## Common Pitfalls
- Not browser-friendly out of the box, needs gRPC-Web or a proxy
- Harder to debug than plain JSON since the wire format is binary
- Assuming gRPC is a drop-in replacement for public-facing REST APIs, it's a poor fit for third-party/public APIs where consumers need to inspect traffic with a browser, use `curl`, or work in languages/environments without good protobuf tooling
- Forgetting `.proto` field numbers are permanent once shipped, reusing a field number for a different field after removing the old one can silently corrupt data for any client still sending the old encoding, `reserved` keywords exist specifically to prevent this
- Treating a `.proto` change as automatically backward compatible without checking, removing a required field, changing a field's type, or renumbering fields breaks wire compatibility even though the file "still compiles"
- Not setting deadlines/timeouts on calls, gRPC supports per-call deadlines natively, but if you don't set one, a hung downstream service call can block indefinitely
- Load balancing gRPC like plain HTTP/1.1, since a gRPC connection is a single long-lived HTTP/2 connection, a naive L4 load balancer sends all calls on that connection to the same backend instance, defeating load balancing, you generally need L7/HTTP2-aware load balancing or client-side load balancing

## Under the Hood: Protocol Buffers Wire Format
Protobuf encodes each field as a `(field_number, wire_type)` tag followed by the value, not the field's name. This is why field numbers, not names, are the actual contract:
```protobuf
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```
On the wire, this is a stream of tag-value pairs like `[field 1, varint, 42][field 2, length-delimited, "Alice"]...`, no `"id":` or `"name":` strings anywhere. A field that's absent (using a default value) can be omitted from the encoding entirely, which is part of why messages are so compact. Because decoding relies on field numbers rather than names, you can add new fields (with new numbers) and old clients simply ignore them, forward and backward compatibility is a first-class design goal of the format, as long as you never reuse or repurpose a field number.

## RPC Types
gRPC supports four call patterns, all defined declaratively in the `.proto` file:
- **Unary** — one request, one response. The default, equivalent to a normal REST call
- **Server streaming** — one request, a stream of responses. E.g. subscribing to price updates for a stock after a single request
- **Client streaming** — a stream of requests, one final response. E.g. uploading a large file in chunks, server acknowledges once at the end
- **Bidirectional streaming** — both sides stream independently over the same connection. E.g. a chat service, or real-time collaborative editing

```protobuf
service PriceFeed {
  rpc GetPrice (PriceRequest) returns (PriceResponse);               // unary
  rpc StreamPrices (PriceRequest) returns (stream PriceResponse);    // server streaming
  rpc SubmitTrades (stream Trade) returns (TradeSummary);            // client streaming
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);        // bidirectional
}
```
This is a genuine capability gap versus plain REST/JSON over HTTP/1.1, streaming in either direction requires falling back to something like [[WebSocket]] or Server-Sent Events in a REST-based architecture, whereas gRPC gets it natively from HTTP/2 with the same generated client code.

## Comparison
| | gRPC | REST/JSON | GraphQL |
|---|---|---|---|
| Payload format | Binary (Protocol Buffers) | Text (JSON) | Text (JSON) |
| Schema | Strict, `.proto`-defined, code-generated | Optional (OpenAPI), not enforced by the wire format | Strict, GraphQL SDL |
| Browser support | Needs gRPC-Web + proxy | Native | Native |
| Streaming | Native (all 4 patterns) | Not native (needs WebSocket/SSE) | Subscriptions (via WebSocket under the hood) |
| Human readability on the wire | No, binary | Yes | Yes |
| Typical use | Internal service-to-service | Public APIs, browser clients | Client-driven data fetching, aggregating multiple sources |

See [[REST API]] and [[GraphQL]] for the two most common alternatives.

## Code Example
```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
}

message GetUserRequest {
  int32 id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

```go
// Server (Go)
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.db.FindUser(req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user %d not found", req.Id)
    }
    return &pb.User{Id: user.ID, Name: user.Name, Email: user.Email}, nil
}
```

```go
// Client (Go)
conn, _ := grpc.Dial("user-service:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
client := pb.NewUserServiceClient(conn)

ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 42})
```

## Best Practices
- Reserve removed field numbers and names (`reserved 4, "old_field";`) instead of letting them be reused accidentally by a future change
- Set explicit deadlines on every client call rather than relying on defaults, so a slow downstream doesn't cascade into your own service hanging
- Use `buf` (or equivalent) to lint and check `.proto` changes for backward compatibility in CI before merging
- Prefer gRPC for internal service-to-service calls where you control both ends; expose a REST or GraphQL gateway at the edge for browser/public clients rather than forcing gRPC-Web everywhere
- Use interceptors (gRPC's middleware equivalent) for cross-cutting concerns, auth, logging, tracing, instead of duplicating that logic in every service method

## Error Handling
Unlike REST's overloaded use of HTTP status codes, gRPC defines its own status code enum (`OK`, `NOT_FOUND`, `INVALID_ARGUMENT`, `DEADLINE_EXCEEDED`, `UNAVAILABLE`, `PERMISSION_DENIED`, and more), returned alongside an optional human-readable message and, if needed, structured error details via the `google.rpc.Status` type. This gives clients a consistent, language-agnostic way to branch on error type across every service, rather than each REST API inventing its own error body shape. `DEADLINE_EXCEEDED` in particular is worth calling out: because deadlines propagate automatically along a chain of gRPC calls (service A calls B calls C, all sharing one deadline budget), a slow downstream service surfaces as the same well-defined error all the way back up the call chain instead of each hop needing its own ad hoc timeout logic.

## Common Interview Questions
- "Why is gRPC generally faster than REST/JSON?" — Expect binary encoding (no field names repeated per message, compact varint encoding) plus HTTP/2 multiplexing (many concurrent calls over one connection, header compression via HPACK) as the two main answers
- "When would you choose REST over gRPC?" — Expect public/third-party APIs, browser clients without a gRPC-Web proxy, and situations where human-readable/debuggable payloads and broad tooling support matter more than raw throughput
- "How does gRPC handle backward compatibility?" — Expect an explanation of field numbers (not names) driving the wire format, so adding new fields is safe but reusing or renumbering old ones isn't

## FAQ
**Can browsers call gRPC directly?** Not the raw protocol, browsers can't control HTTP/2 trailers the way gRPC needs. Use gRPC-Web (a client library plus a proxy like Envoy that translates gRPC-Web calls to native gRPC) to bridge browser clients to gRPC backends.

**Is gRPC always faster than REST?** For internal, high-volume, low-latency service calls, generally yes due to binary encoding and HTTP/2 multiplexing. For a handful of infrequent calls, the difference is negligible, and REST's simplicity/tooling often wins.

**Do I need [[Microservices vs Monolith|microservices]] to benefit from gRPC?** No, but that's where it shines most. A monolith has no network calls between its internal modules, so gRPC's main advantages (fast, typed inter-service calls) don't apply until you actually split services apart.

**How does gRPC compare to message queues like Kafka or RabbitMQ for service-to-service communication?** They solve different problems. gRPC is synchronous request/response (or streaming) between two services that both need to be up at the same time; a [[Message Queue]] decouples producer and consumer in time, the consumer can be down or slow and the message just waits. Many architectures use both, gRPC for calls that need an immediate answer, a queue for events that can be processed asynchronously.

## Related Terms
- [[REST API]]
- [[Microservices vs Monolith]]
- [[GraphQL]]
- [[WebSocket]]
- [[Message Queue]]
- [[Load Balancer]]

## Example
An order service and an inventory service talking over gRPC internally for speed. The order service calls `inventoryClient.ReserveStock(ctx, &pb.ReserveRequest{Sku: "WIDGET-1", Qty: 1})`, generated client code serializes that to a compact binary payload over an existing HTTP/2 connection, the inventory service deserializes it into a strongly-typed struct, and responds in milliseconds, all while an entirely separate public-facing REST API (or GraphQL gateway) is what the actual storefront's browser client talks to.

This split, gRPC internally, REST/GraphQL at the edge, is common enough to have a name: an API gateway pattern, where one edge-facing service translates public HTTP/JSON requests into internal gRPC calls fanned out across the microservice mesh, giving external consumers a stable, browser-friendly contract while internal services keep gRPC's speed and type safety.
