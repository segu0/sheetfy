import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Author } from "../page";
import { CoverImage } from "./cover-image";
import { DateFormatter } from "./date-formatter";
import { PostTitle } from "./post-title";

type PostHeaderProps = {
  title: string;
  coverImage: string;
  date: string;
  author: Author;
};

export function PostHeader({ title, coverImage, date, author }: PostHeaderProps) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden items-center justify-between md:mb-12 md:flex">
        <div className="flex items-center gap-2">
          <Avatar className="h-11 w-11 rounded-full border-2 border-white outline outline-emerald-600">
            <AvatarImage width={44} height={44} src={author.picture} alt={author.name} />
            <AvatarFallback>{author.name}</AvatarFallback>
          </Avatar>
          <p className="text-lg font-medium text-zinc-900">{author.name}</p>
        </div>
        <DateFormatter dateString={date} />
      </div>
      <div className="mb-8 sm:mx-0 md:mb-16">
        <CoverImage title={title} src={coverImage} />
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 block md:hidden">
          <Avatar className="h-11 w-11 rounded-full border-2 border-white outline outline-emerald-600">
            <AvatarImage width={44} height={44} src={author.picture} alt={author.name} />
            <AvatarFallback>{author.name}</AvatarFallback>
          </Avatar>
          <DateFormatter dateString={date} />
        </div>
      </div>
    </>
  );
}
