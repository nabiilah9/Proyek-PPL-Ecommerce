import AuthLayoutTemplate from '@/components/layouts/auth/auth-simple-layout';

export default function AuthTemplate({
  children,
  title,
  description,
  ...props
}: {
  children: React.ReactNode;
  title: string;
  description: string
}) {
  return (
    <AuthLayoutTemplate title={title} description={description} {...props}>
      { children }
    </AuthLayoutTemplate>
  );
};