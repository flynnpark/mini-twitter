import createHttpError from 'http-errors';
import { NextApiRequest, NextApiResponse } from 'next';
import { Pagination, PublicTweetWithUser } from 'types';
import isInteger from 'libs/common/isInteger';
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

interface GetTweetsResult {
  items: PublicTweetWithUser[];
  pagination: Pagination;
}

interface GetTweetsRequest extends NextApiRequest {
  query: {
    size?: string;
    cursor?: string;
  };
}

async function getTweets(
  req: GetTweetsRequest,
  res: NextApiResponse<CommonResponseType<GetTweetsResult>>
) {
  const {
    query: { size, cursor },
  } = req;

  if ((size && !isInteger(size)) || (cursor && !isInteger(cursor))) {
    throw new createHttpError.BadRequest('올바르지 않은 요청입니다');
  }

  const parsedSize = size ? Number(size) : 20;
  const tweets = await client.tweet.findMany({
    where: {
      id: {
        lt: cursor ? Number(cursor) : undefined,
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
    take: parsedSize,
    orderBy: {
      id: 'desc',
    },
  });

  return res.status(200).json({
    success: true,
    result: {
      items: tweets,
      pagination: {
        size: parsedSize,
        count: tweets.length,
        cursor: tweets.at(-1)?.id,
      },
    },
  });
}

export default withHandler({
  POST: { handler: createTweet, isPrivate: true },
  GET: { handler: getTweets },
});
