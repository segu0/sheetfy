import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Author } from "../page";
import { CoverImage } from "./cover-image";
import { DateFormatter } from "./date-formatter";

type PostPreviewProps = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

export function PostPreview({ title, coverImage, date, excerpt, author, slug }: PostPreviewProps) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      <h3 className="mb-3 text-3xl leading-snug">
        <Link href={`/blog/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="mb-4 text-lg">
        <DateFormatter dateString={date} />
      </div>
      <p className="mb-4 text-lg leading-relaxed">{excerpt}</p>
      <Avatar className="h-11 w-11 rounded-full border-2 border-white outline outline-emerald-600">
        <AvatarImage width={44} height={44} src={author.picture} alt={author.name} />
        <AvatarFallback>{author.name}</AvatarFallback>
      </Avatar>
    </div>
  );
}
