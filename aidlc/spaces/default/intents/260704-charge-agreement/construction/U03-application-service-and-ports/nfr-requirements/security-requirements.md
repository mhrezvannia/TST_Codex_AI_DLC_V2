# Security Requirements - U03

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

| Control | Requirement |
| --- | --- |
| Authorization | Every use case calls `AuthorizationPort` with the canonical permission string for the resource/action being attempted. |
| Correlation | Mutating commands carry correlation IDs. |
| Reference validation | External IDs are validated through `ReferenceDataPort` when configured. |

## Production Permission Matrix

Canonical role names and permission resource/action strings:

| Role | Grants |
| --- | --- |
| `charge-agreement.viewer` | `charge-agreement/agreement:list`, `charge-agreement/agreement:read`, `charge-agreement/audit:read`, `shared-platform/reference-data:read` |
| `charge-agreement.editor` | Viewer grants plus `charge-agreement/agreement:create`, `charge-agreement/agreement:update`, `charge-agreement/rate-term:update`, `charge-agreement/agreement:submit`, `charge-agreement/agreement:withdraw` |
| `charge-agreement.approver` | Viewer grants plus `charge-agreement/agreement:approve`, `charge-agreement/agreement:reject`, `charge-agreement/agreement:activate`, `charge-agreement/agreement:expire` |
| `charge-agreement.admin` | Editor and approver grants plus `charge-agreement/agreement:archive`, `charge-agreement/permission:manage` |

`AuthorizationPort` must receive the actor, tenant or business unit context, resource identifier when present, and the exact permission string. Local auth bypass may map to `charge-agreement.admin` only when the runtime profile is explicitly local.

## Threat Notes

Local auth bypass must be an adapter concern and cannot bypass use-case authorization calls.
