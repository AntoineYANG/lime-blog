import Link from "next/link";
import type { FC } from "react";

import type { ListPostResult } from "@actions/post";


export interface IPostListProps {
  items: ListPostResult['items'];
}

const PostList: FC<IPostListProps> = ({ items }) => {
  return (
    <ol className="overflow-x-hidden overflow-y-auto scroll-style-none divide-y">
      {items.map((res, i) => (
        <li key={i}>
          <Link href={`/p/${res.id}`} className="block px-2 landscape:px-4 py-3 opacity-90 hover:opacity-100 focus-within:opacity-100 hover:bg-gray-400/10 focus:bg-gray-400/10">
            <div className="pointer-events-none !space-y-0.5">
              <p className="font-semibold capitalize">{res.title}</p>
              <p className="font-thin text-[96%] !leading-5 line-clamp-4">{res.preview}</p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
};


export default PostList;
