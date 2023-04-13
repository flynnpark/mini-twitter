import createHttpError from 'http-errors';
import { NextApiRequest, NextApiResponse } from 'next';
import client from 'libs/server/db';
import withHandler, { CommonResponseType } from 'libs/server/withHandler';

interface CreateUserRequest extends NextApiRequest {
  body: {
    email?: string;
    name?: string;
  };
}

async function createUser(
  req: CreateUserRequest,
  res: NextApiResponse<CommonResponseType>
) {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new createHttpError.BadRequest('올바르지 않은 요청입니다');
  }

  const existingUser = await client.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUser) {
    throw new createHttpError.BadRequest('이미 가입된 이메일입니다');
  }

  const newUser = await client.user.create({
    data: {
      email,
      name,
    },
  });

  return res.status(201).json({
    success: true,
    user: {
      email: newUser.email,
      name: newUser.name,
    },
  });
}

export default withHandler({
  POST: { handler: createUser },
});
