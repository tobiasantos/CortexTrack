import type { Category } from '../../types';

const styles: Record<Category, string> = {
  productive: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  neutral: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  distraction: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

interface CategoryBadgeProps {
  category: Category;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[category]}`}>
      {category}
    </span>
  );
}
