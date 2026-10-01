import AppTemplate from "@/components/templates/app-template";
import CustomerReview from "@/components/layouts/review";
import { Link } from "@inertiajs/react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MenuProps {
  categories: Category[];
}

// const Menu = ({ categories }: MenuProps) => {
export default function Menu({ categories }: MenuProps) {
  return (
    // console.log("categories:", categories);

    <AppTemplate className="bg-[#FFFFFF]">
      <div className="mx-16 mt-4">
        <form>
          <input type="text" placeholder="Search For Menu.." className="w-full rounded-full p-3 border" />
        </form>
      </div>

      {/* Kategori dinamis database */}
      <nav aria-label="products navigation display">
        <ul className="flex justify-around p-3 mt-5 gap-3 bg-[#F3F3F3] text-2xl font-bold">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/menu/${cat.slug}`}
                className="text-black hover:bg-black hover:text-white px-5 py-1 rounded-full transition"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* jumbotron or others */}

      <CustomerReview />
    </AppTemplate>
  );
}