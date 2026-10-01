import { cn } from '@/lib/utils';

import Input from '@/components/elements/input';
import Label from '@/components/elements/label';
import InputError from '@/components/elements/input-error';

type FormFieldPropsInput = {
  htmlFor: string;
  label: string;
  message: string;
  className?: string;
} & React.ComponentProps<'input'>;

export default function FormFieldInput({
  htmlFor,
  label,
  message,
  className,
  ...props
}: FormFieldPropsInput) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={htmlFor} className="capitalize">
        {label}
      </Label>
      <Input {...props} />
      <InputError message={message} />
    </div>
  );
}