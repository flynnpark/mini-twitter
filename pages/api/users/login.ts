import createHttpError from 'http-errors';
import { NextApiRequest, NextApiResponse } from 'next';
import client from 'libs/server/db';
import withHandler, { CommonResponseType } from 'libs/server/withHandler';

interface LoginRequest extends NextApiRequest {
  body: {
    email?: string;
  };
}

async function login(
  req: LoginRequest,
  res: NextApiResponse<CommonResponseType>
) {
  const { email } = req.body;
  if (!email) {
    throw new createHttpError.BadRequest('올바르지 않은 요청입니다');
  }

  const user = await client.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new createHttpError.NotFound('해당 이메일로 가입한 유저가 없습니다');
  }

  req.session.user = { id: user.id };
  await req.session.save();

  return res.status(200).json({
    success: true,
  });
}

export default withHandler({
  POST: { handler: login },
});
