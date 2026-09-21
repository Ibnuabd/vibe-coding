import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

describe("User Registration Endpoint", () => {
  const app = new Elysia().use(usersRoute);

  it("should register a user successfully with valid data and return 201 Created", async () => {
    const uniqueEmail = `test-reg-success-${Date.now()}@localhost`;

    const response = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ibnu Valid",
          email: uniqueEmail,
          password: "securepassword123",
        }),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual({ data: "OK" });
  });

  describe("Validation Errors - Missing Required Fields", () => {
    it("should return 422 if name is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `missing-name-${Date.now()}@localhost`,
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should return 422 if email is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "No Email User",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should return 422 if password is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "No Password User",
            email: `missing-pass-${Date.now()}@localhost`,
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("Validation Errors - Max Length Exceeded (>255 chars)", () => {
    it("should return 422 if name exceeds 255 characters", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "A".repeat(256),
            email: `valid-name-len-${Date.now()}@localhost`,
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should return 422 if email exceeds 255 characters", async () => {
      const longEmail = `${"a".repeat(250)}@localhost.com`;
      const response = await app.handle(
        new Request("http://localhost/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Valid User",
            email: longEmail,
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should return 422 if password exceeds 255 characters", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Valid User",
            email: `valid-pass-len-${Date.now()}@localhost`,
            password: "P".repeat(256),
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  it("should return 400 Bad Request if email is already registered", async () => {
    const duplicateEmail = `test-duplicate-${Date.now()}@localhost`;

    // First registration - should succeed
    const firstResponse = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Original User",
          email: duplicateEmail,
          password: "password123",
        }),
      })
    );
    expect(firstResponse.status).toBe(201);

    // Second registration with the same email - should fail with 400
    const duplicateResponse = await app.handle(
      new Request("http://localhost/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate User",
          email: duplicateEmail,
          password: "differentpassword",
        }),
      })
    );

    expect(duplicateResponse.status).toBe(400);
    const body = await duplicateResponse.json();
    expect(body).toEqual({ error: "Email sudah terdaftar" });
  });
});
