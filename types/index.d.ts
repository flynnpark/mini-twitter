import { Tweet, User } from '@prisma/client';

type Pagination = {
  cursor: number | undefined;
  size: number;
  count: number;
};

type PublicUser = Omit<User, 'email' | 'updatedAt'>;

type PublicTweet = Omit<Tweet, 'userId'>;

interface PublicTweetWithUser extends PublicTweet {
  user: PublicUser;
}
