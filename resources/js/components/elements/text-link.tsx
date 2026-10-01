import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";
import { ComponentProps } from "react";

type TextLinkProps = {
  className?: string;
  children: React.ReactNode;
} & ComponentProps<typeof Link>;

const TextLink: React.FC<TextLinkProps> = ({ className = '', children, ...props }) => {
  return (
    <Link
        className={cn(
        'text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500',
        className,
      )}
      { ...props }
    >
      { children }
    </Link>
  );
};

export default TextLink;