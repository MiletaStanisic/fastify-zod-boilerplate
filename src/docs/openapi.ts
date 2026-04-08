import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { listActivityQuerySchema } from "../services/activity.js";
import { createClientSchema, listClientsQuerySchema } from "../services/clients.js";
import { createProjectSchema, listProjectsQuerySchema, projectStatusSchema, updateProjectSchema } from "../services/projects.js";
import { createTaskSchema, listTasksQuerySchema } from "../services/tasks.js";

extendZodWithOpenApi(z);

const errorSchema = z.object({
  error: z.string(),
  message: z.string(),
  issues: z.unknown().optional()
});

const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  createdAt: z.string()
});

const projectSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: projectStatusSchema,
  dueDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  done: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const activityEventSchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  type: z.string(),
  description: z.string(),
  entityId: z.string(),
  createdAt: z.string()
});

const paginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number()
  });

const idParamSchema = z.object({
  id: z.string()
});

const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.string()
});

const dashboardSummarySchema = z.object({
  totalClients: z.number(),
  totalProjects: z.number(),
  totalTasks: z.number(),
  projectsByStatus: z.record(projectStatusSchema, z.number()),
  activeProjectsCount: z.number(),
  activeProjects: z.array(projectSchema),
  overdueTasksCount: z.number(),
  overdueTasks: z.array(taskSchema)
});

function buildRegistry() {
  const registry = new OpenAPIRegistry();

  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["System"],
    responses: {
      200: {
        description: "Health check",
        content: {
          "application/json": {
            schema: healthSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/clients",
    tags: ["Clients"],
    request: {
      query: listClientsQuerySchema
    },
    responses: {
      200: {
        description: "Paginated clients",
        content: {
          "application/json": {
            schema: paginatedSchema(clientSchema)
          }
        }
      },
      400: {
        description: "Invalid query",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/clients",
    tags: ["Clients"],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createClientSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: "Created client",
        content: {
          "application/json": {
            schema: clientSchema
          }
        }
      },
      400: {
        description: "Invalid body",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/projects",
    tags: ["Projects"],
    request: {
      query: listProjectsQuerySchema
    },
    responses: {
      200: {
        description: "Paginated projects",
        content: {
          "application/json": {
            schema: paginatedSchema(projectSchema)
          }
        }
      },
      400: {
        description: "Invalid query",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/projects",
    tags: ["Projects"],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createProjectSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: "Created project",
        content: {
          "application/json": {
            schema: projectSchema
          }
        }
      },
      400: {
        description: "Invalid body",
        content: { "application/json": { schema: errorSchema } }
      },
      422: {
        description: "Invalid reference",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/projects/{id}",
    tags: ["Projects"],
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: updateProjectSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Updated project",
        content: {
          "application/json": {
            schema: projectSchema
          }
        }
      },
      400: {
        description: "Invalid body",
        content: { "application/json": { schema: errorSchema } }
      },
      404: {
        description: "Not found",
        content: { "application/json": { schema: errorSchema } }
      },
      422: {
        description: "Invalid reference",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/projects/kanban",
    tags: ["Projects"],
    responses: {
      200: {
        description: "Projects grouped by status",
        content: {
          "application/json": {
            schema: z.object({
              backlog: z.array(projectSchema),
              in_progress: z.array(projectSchema),
              review: z.array(projectSchema),
              done: z.array(projectSchema),
              blocked: z.array(projectSchema)
            })
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/projects/{id}/tasks",
    tags: ["Tasks"],
    request: {
      params: idParamSchema,
      query: listTasksQuerySchema
    },
    responses: {
      200: {
        description: "Paginated tasks",
        content: {
          "application/json": {
            schema: paginatedSchema(taskSchema)
          }
        }
      },
      400: {
        description: "Invalid query",
        content: { "application/json": { schema: errorSchema } }
      },
      404: {
        description: "Not found",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/projects/{id}/tasks",
    tags: ["Tasks"],
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createTaskSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: "Created task",
        content: {
          "application/json": {
            schema: taskSchema
          }
        }
      },
      400: {
        description: "Invalid body",
        content: { "application/json": { schema: errorSchema } }
      },
      404: {
        description: "Not found",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/dashboard/summary",
    tags: ["Dashboard"],
    responses: {
      200: {
        description: "Dashboard summary",
        content: {
          "application/json": {
            schema: dashboardSummarySchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/activity-feed",
    tags: ["Activity"],
    request: {
      query: listActivityQuerySchema
    },
    responses: {
      200: {
        description: "Activity feed",
        content: {
          "application/json": {
            schema: z.object({
              items: z.array(activityEventSchema),
              total: z.number(),
              limit: z.number()
            })
          }
        }
      },
      400: {
        description: "Invalid query",
        content: { "application/json": { schema: errorSchema } }
      }
    }
  });

  return registry;
}

const cachedDocuments = new Map<number, ReturnType<OpenApiGeneratorV31["generateDocument"]>>();

export function getOpenApiDocument(port = 4000) {
  const cachedDocument = cachedDocuments.get(port);
  if (cachedDocument) return cachedDocument;

  const registry = buildRegistry();
  const generator = new OpenApiGeneratorV31(registry.definitions);

  const document = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Agency Project Hub API",
      version: "1.0.0"
    },
    servers: [{ url: `http://localhost:${port}` }]
  });

  cachedDocuments.set(port, document);
  return document;
}

export function getSwaggerHtml(openApiUrl = "/openapi.json") {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Agency Project Hub API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body{margin:0;background:#fafafa}#swagger-ui{max-width:1200px;margin:0 auto}</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "${openApiUrl}",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`;
}
