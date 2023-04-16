import createHttpError from 'http-errors';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import globalErrorHandler from './globalErrorHandler';

export interface CommonResponseType<T = null> {
  success: boolean;
  message?: string | null;
  result?: T;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface HandlerType {
  handler: NextApiHandler;
  isPrivate?: boolean;
}

type ApiMethodHandlers = {
  [key in Uppercase<RequestMethod>]?: HandlerType;
};

export default function withHandler(handlers: ApiMethodHandlers) {
  return async function (
    req: NextApiRequest,
    res: NextApiResponse<CommonResponseType>
  ) {
    try {
      const method = req.method
        ? (req.method.toUpperCase() as keyof ApiMethodHandlers)
        : undefined;

      if (!method) {
        throw new createHttpError.MethodNotAllowed(
          `No method specified on path ${req.url}!`
        );
      }

      const methodHandler = handlers[method];
      if (!methodHandler) {
        throw new createHttpError.MethodNotAllowed(
          `Method ${req.method} Not Allowed on path ${req.url}!`
        );
      }

      if (methodHandler.isPrivate && !req.session.user) {
        throw new createHttpError.Unauthorized(
          `Unauthorized on path ${req.url}`
        );
      }
    } catch (error) {
      globalErrorHandler(error, res);
    }
  };
}
