import { News } from "@/types/news";

interface Props {
  news: News[];
}

export default function NewsFeed({ news }: Props) {

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <h2 className="mb-5 text-lg font-semibold">
        Latest News
      </h2>

      <div className="space-y-4">

        {news.map((item) => (

          <article
            key={item.id}
            className="border-b border-slate-800 pb-4"
          >

            <h3 className="text-sm font-medium">
              {item.title}
            </h3>

            {item.created_at && (
              <p className="mt-1 text-xs text-slate-500">
                {new Date(item.created_at).toLocaleString()}
              </p>
            )}

          </article>

        ))}

      </div>

    </div>
  );
}