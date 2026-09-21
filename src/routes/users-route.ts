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
        name: t.String({
          maxLength: 255,
          examples: ["John Doe"],
        }),
        email: t.String({
          maxLength: 255,
          examples: ["john.doe@example.com"],
        }),
        password: t.String({
          maxLength: 255,
          examples: ["secretpassword123"],
        }),
      }),
      detail: {
        tags: ["Users"],
        summary: "Registrasi User Baru",
        description:
          "Mendaftarkan pengguna baru ke dalam sistem dengan nama, email, dan password.",
        responses: {
          201: {
            description: "Pendaftaran pengguna berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "string",
                      example: "OK",
                    },
                  },
                  required: ["data"],
                },
                example: {
                  data: "OK",
                },
              },
            },
          },
          400: {
            description: "Email sudah terdaftar",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Email sudah terdaftar",
                    },
                  },
                  required: ["error"],
                },
                example: {
                  error: "Email sudah terdaftar",
                },
              },
            },
          },
          422: {
            description:
              "Validasi input gagal (field wajib kosong atau karakter melebihi 255)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      example: "validation",
                    },
                    on: {
                      type: "string",
                      example: "body",
                    },
                    summary: {
                      type: "string",
                      example:
                        "Expected string length less than or equal to 255",
                    },
                  },
                },
                example: {
                  type: "validation",
                  on: "body",
                  summary: "Expected string length less than or equal to 255",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Internal server error",
                    },
                  },
                  required: ["error"],
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
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
        email: t.String({
          maxLength: 255,
          examples: ["john.doe@example.com"],
        }),
        password: t.String({
          maxLength: 255,
          examples: ["secretpassword123"],
        }),
      }),
      detail: {
        tags: ["Users"],
        summary: "Login User",
        description:
          "Autentikasi pengguna dan mengembalikan token sesi baru dalam format UUID.",
        responses: {
          200: {
            description: "Login berhasil, mengembalikan token sesi",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "string",
                      format: "uuid",
                      example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                    },
                  },
                  required: ["data"],
                },
                example: {
                  data: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                },
              },
            },
          },
          400: {
            description: "Kredensial login salah (email atau password salah)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Email atau password salah",
                    },
                  },
                  required: ["error"],
                },
                example: {
                  error: "Email atau password salah",
                },
              },
            },
          },
          422: {
            description: "Validasi input gagal",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      example: "validation",
                    },
                    on: {
                      type: "string",
                      example: "body",
                    },
                    summary: {
                      type: "string",
                      example: "Expected string",
                    },
                  },
                },
                example: {
                  type: "validation",
                  on: "body",
                  summary: "Expected string",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Internal server error",
                    },
                  },
                  required: ["error"],
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
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
              security: [{ bearerAuth: [] }],
              responses: {
                200: {
                  description: "Data profil pengguna berhasil diambil",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          data: {
                            type: "object",
                            properties: {
                              id: {
                                type: "integer",
                                example: 1,
                              },
                              name: {
                                type: "string",
                                example: "John Doe",
                              },
                              email: {
                                type: "string",
                                example: "john.doe@example.com",
                              },
                              create_at: {
                                type: "string",
                                format: "date-time",
                                example: "2026-09-21T14:30:00.000Z",
                              },
                            },
                            required: ["id", "name", "email", "create_at"],
                          },
                        },
                        required: ["data"],
                      },
                      example: {
                        data: {
                          id: 1,
                          name: "John Doe",
                          email: "john.doe@example.com",
                          create_at: "2026-09-21T14:30:00.000Z",
                        },
                      },
                    },
                  },
                },
                401: {
                  description:
                    "Unauthorized (Token Bearer tidak valid, kosong, atau sesi tidak ditemukan)",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          error: {
                            type: "string",
                            example: "Unauthorized",
                          },
                        },
                        required: ["error"],
                      },
                      example: {
                        error: "Unauthorized",
                      },
                    },
                  },
                },
                500: {
                  description: "Internal server error",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          error: {
                            type: "string",
                            example: "Internal server error",
                          },
                        },
                        required: ["error"],
                      },
                      example: {
                        error: "Internal server error",
                      },
                    },
                  },
                },
              },
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
              description:
                "Menghapus token sesi aktif pengguna dari database.",
              security: [{ bearerAuth: [] }],
              responses: {
                200: {
                  description: "Logout berhasil, sesi dihapus",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          data: {
                            type: "string",
                            example: "OK",
                          },
                        },
                        required: ["data"],
                      },
                      example: {
                        data: "OK",
                      },
                    },
                  },
                },
                401: {
                  description:
                    "Unauthorized (Token tidak valid atau tidak ditemukan di database)",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          error: {
                            type: "string",
                            example: "Unauthorized",
                          },
                        },
                        required: ["error"],
                      },
                      example: {
                        error: "Unauthorized",
                      },
                    },
                  },
                },
                500: {
                  description: "Internal server error",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          error: {
                            type: "string",
                            example: "Internal server error",
                          },
                        },
                        required: ["error"],
                      },
                      example: {
                        error: "Internal server error",
                      },
                    },
                  },
                },
              },
            },
          }
        )
  );

