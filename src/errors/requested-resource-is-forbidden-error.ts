import { ApplicationError } from "@/protocols";

export function requestedResourceForbiddenError(): ApplicationError {
  return {
    name: "requestedResourceisForbiddenError",
    message: "Requested resource is Forbidden !",
  };
}
