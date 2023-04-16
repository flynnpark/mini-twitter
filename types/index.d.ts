import { Tweet, User } from '@prisma/client';

type PublicUser = Omit<User, 'email' | 'updatedAt'>;

type PublicTweet = Omit<Tweet, 'userId'>;

interface PublicTweetWithUser extends PublicTweet {
  user: PublicUser;
}
