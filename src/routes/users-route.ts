import { Elysia, t } from "elysia";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/users-services";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);
        set.status = 201;
        return result;
      } catch (error: any) {
        if (error.message === "Email sudah terdaftar") {
          set.status = 400;
          return {
            error: "Email sudah terdaftar",
          };
        }

        set.status = 500;
        return {
          error: error.message || "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const result = await loginUser(body);
        set.status = 200;
        return result;
      } catch (error: any) {
        if (error.message === "Email atau password salah") {
          set.status = 400;
          return {
            error: "Email atau password salah",
          };
        }

        set.status = 500;
        return {
          error: error.message || "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/current", async ({ headers, set }) => {
    const authorization = headers["authorization"];
    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }

    try {
      const result = await getCurrentUser(token);
      set.status = 200;
      return result;
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }

      set.status = 500;
      return {
        error: error.message || "Internal server error",
      };
    }
  })
  .delete("/logout", async ({ headers, set }) => {
    const authorization = headers["authorization"];
    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }

    try {
      const result = await logoutUser(token);
      set.status = 200;
      return result;
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }

      set.status = 500;
      return {
        error: error.message || "Internal server error",
      };
    }
  });

