import { cn } from '@/lib/utils';
import { type ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';
import { type LucideProps } from 'lucide-react';

interface IconProps {
  iconNodeUI?: LucideIcon | null;
  className?: string;
};

function IconUI({ iconNodeUI: IconComponent, className }: IconProps) {
  if (!IconComponent) {
    return null;
  }
  return <IconComponent className={className} />;
};

interface IconProps extends Omit<LucideProps, 'ref'> {
  iconNode: ComponentType<LucideProps>;
};

function Icon({ iconNode: IconComponent, className, ...props }: IconProps) {
  return <IconComponent className={cn('h-4 w-4', className)} {...props} />;
};

export { IconUI, Icon };