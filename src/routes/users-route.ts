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
        name: t.String({ maxLength: 255 }),
        email: t.String({ maxLength: 255 }),
        password: t.String({ maxLength: 255 }),
      }),
      detail: {
        tags: ["Users"],
        summary: "Registrasi User Baru",
        description: "Mendaftarkan pengguna baru ke dalam sistem.",
      },
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
        email: t.String({ maxLength: 255 }),
        password: t.String({ maxLength: 255 }),
      }),
      detail: {
        tags: ["Users"],
        summary: "Login User",
        description: "Autentikasi pengguna dan mengembalikan token sesi baru.",
      },
    }
  )
  .guard(
    {
      beforeHandle({ headers, set }) {
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
      },
    },
    (app) =>
      app
        .derive(({ headers }) => {
          const authorization = headers["authorization"] || "";
          return {
            token: authorization.slice(7).trim(),
          };
        })
        .get(
          "/current",
          async ({ token, set }) => {
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
          },
          {
            detail: {
              tags: ["Users"],
              summary: "Get Current User",
              description:
                "Mendapatkan profil data pengguna yang sedang login berdasarkan token Bearer.",
            },
          }
        )
        .delete(
          "/logout",
          async ({ token, set }) => {
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
          },
          {
            detail: {
              tags: ["Users"],
              summary: "Logout User",
              description: "Menghapus token sesi aktif pengguna.",
            },
          }
        )
  );

