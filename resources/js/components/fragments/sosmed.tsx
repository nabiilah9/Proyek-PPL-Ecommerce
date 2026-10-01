type Icon = {
  alt: string;
  src: string;
  href: string;
};

type SocialIconsProps = {
  icons: Icon[];
  className?: string;
};

const SocialIcons: React.FC<SocialIconsProps> = ({ icons, className }) => {
  return (
    <nav aria-label="Social media" className={ className }>
      <ul className="flex gap-4 items-center">
        {icons.map((icon, index) => (
          <li key={ index }>
            <a href={ icon.href } target="_blank" rel="noopener noreferrer">
              <img src={ icon.src } alt={ icon.alt } className="w-10 h-10" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SocialIcons;