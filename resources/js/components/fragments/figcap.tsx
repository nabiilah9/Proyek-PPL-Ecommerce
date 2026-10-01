import React from "react";

import { cn } from "@/lib/utils";

type FigureCapProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLImageElement>;

const FigureCap: React.FC<FigureCapProps> = ({ src, alt, className, imgClassName, children }) => {
  return (
    <figure className={cn("flex flex-col", className)}>
      <img src={ src } alt={ alt } className={cn( imgClassName )} />
      <figcaption className="mt-2 text-sm text-gray-500">
        { children }
      </figcaption>
    </figure>
  );
};

export default FigureCap;