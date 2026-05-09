import { HttpStatusCode } from "axios";

const OK = HttpStatusCode.Ok;

const BadRequest = HttpStatusCode.BadRequest;

const Unauthorized = HttpStatusCode.Unauthorized;

const Forbidden = HttpStatusCode.Forbidden;

const NotFound = HttpStatusCode.NotFound;

const InternalServerError = HttpStatusCode.InternalServerError;

export default {
  OK,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalServerError
}