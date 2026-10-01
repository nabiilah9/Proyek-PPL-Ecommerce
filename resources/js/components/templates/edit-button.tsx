import { Link } from '@inertiajs/react';
import { EditIcon } from 'lucide-react';
import { Button } from '@/components/elements/button';


export function EditButton({ endpoint, id }: { endpoint: string; id: string }) {
  return (
    <Button size="icon" className="cursor-pointer" variant="secondary">
      <Link href={route(`${endpoint}s.edit`, id)}>
        <EditIcon className="h-4 w-4" />
      </Link>
    </Button>
  );
};