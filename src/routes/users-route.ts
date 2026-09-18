import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-services";

export const usersRoute = new Elysia({ prefix: "/api/users" }).post(
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
);
