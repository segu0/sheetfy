type PostBodyProps = {
  content: string;
};

export function PostBody({ content }: PostBodyProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div
        className="text-lg leading-relaxed [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:leading-snug [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:leading-snug [&_p,&_ul,&_ol,&_blockquote]:my-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
