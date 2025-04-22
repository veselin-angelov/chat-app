# Questions & Answers

## 1. What kind of authentication for the users you will consider if this was a real work task?

If this was a real work task, I would consider using username and password authentication or the OAuth 2.0 authorization protocol, if we are integrating with third-party services.

For the authorization, I would consider using JWT (JSON Web Tokens) for secure stateless token-based authorization

OR

If the ability to revoke tokens is needed, I would consider using tokens (JWT or whatever) with a database to store user sessions.

The socket could authorize during the handshake phase with that token.

Specifically for WebSockets:

- The token could be passed as a query parameter in the WebSocket connection URL
- Or through a cookie that's read during the handshake
- Or after initial connection, the server would validate the token and either allow or reject the connection
- Due to limitations of the browsers, the token cannot be passed in the headers of the WebSocket handshake request

## 2. What kind of persistence for the service you will consider if this was a real work task?

For the users, rooms and messages there are numerous options.

### Relational databases (PostgreSQL, MySQL, etc.):

- **Pros**:
  - Strong schema and relationships
  - Good for complex queries
  - ACID compliance
- **Cons**:
  - Less flexible for unstructured data (Although with jsonb in PostgreSQL, this is not a problem)
  - Scaling write-heavy workloads requires more effort

### NoSQL databases (MongoDB, Cassandra, etc.):

- **Pros**:
  - Flexible schema
  - Good for unstructured data
  - Easier to scale horizontally
- **Cons**:
  - Data consistency requires careful design
  - More complex queries can be harder to implement

For storing the users presence, temporary memberships, and other ephemeral data, I would consider using an in-memory data store like **Redis**.

It would allow for quick access to user presence and temporary memberships without the overhead of a database query.
It would also make possible to track memberships and presence across multiple instances of the service.

It could also be used as the message broker for the service, allowing for real-time updates and notifications to clients.

A hybrid approach would be ideal for a chat application:

- User accounts, permissions and room definitions in a relational database
- Recent message history in a time-series optimized NoSQL database
- Media attachments stored in object storage (S3 or similar)

## 3. What strategy for scale-out you will consider if this was a real work task?

The system could be scaled out horizontally by adding more instances of the service behind a load balancer.

Also, the application can start as a monolith and then be split into microservices as needed as the traffic grows.

Redis could be used to store the session state, allowing for easy scaling of the WebSocket connections across multiple instances.

The database could be replicated for read-heavy workloads, allowing for multiple read replicas to handle the load.

The database could be sharded or partitioned to distribute the load across multiple instances.

Monitoring the performance of the system would be crucial to identify bottlenecks and areas for improvement.
