# Memory Leak Example

This example shows memory leak in node during usage of MongoDB and gridfile lib

## Setup:

- `npm run create` for creating table with blobs
- `npm run select` for reading n times

## Issue:

- memory is not cleared/realesed/flushed after query, even after closed connection

## Question:

- how to release memory after each query?
