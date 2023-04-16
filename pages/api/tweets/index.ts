import createHttpError from 'http-errors';
import { NextApiRequest, NextApiResponse } from 'next';
import { PublicTweetWithUser } from 'types';
import client from 'libs/server/db';
import withHandler, { CommonResponseType } from 'libs/server/withHandler';

interface CreateTweetRequest extends NextApiRequest {
  body: {
    text?: string;
  };
}

async function createTweet(
  req: CreateTweetRequest,
  res: NextApiResponse<CommonResponseType<PublicTweetWithUser>>
) {
  const {
    body: { text },
    session: { user },
  } = req;
  if (!text) {
    throw new createHttpError.BadRequest('올바르지 않은 요청입니다');
  }

  const newTweet = await client.tweet.create({
    data: {
      text,
      user: {
        connect: {
          id: user?.id,
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      },
    },
  });

  return res.json({ success: true, result: newTweet });
}

export default withHandler({
  POST: { handler: createTweet, isPrivate: true },
});
