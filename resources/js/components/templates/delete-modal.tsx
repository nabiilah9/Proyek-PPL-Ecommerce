import { useForm } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/elements/button';

export function DeleteModal({
  resourceName,
  id,
}: {
  resourceName: string;
  id: number;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const { delete: destroy } = useForm();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    destroy(route(`${resourceName}s.destroy`, id), {
      onFinish: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="cursor-pointer" variant="destructive">
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete <span className="capitalize">{resourceName}</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {resourceName}?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogFooter>
            <Button type="submit">Delete</Button>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}