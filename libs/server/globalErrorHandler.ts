import createHttpError from 'http-errors';
import { NextApiResponse } from 'next';
import { ValidationError } from 'yup';

import { CommonResponseType } from './withHandler';

export default function globalErrorHandler(
  error: unknown,
  res: NextApiResponse<CommonResponseType>
) {
  if (createHttpError.isHttpError(error) && error.expose) {
    // Handle all errors thrown by http-errors module
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  } else if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ success: false, message: error.errors.join(', ') });
  } else {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
}
