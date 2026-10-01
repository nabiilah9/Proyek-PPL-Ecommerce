export default function FormSimpleLayout({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 p-3">
      <div className="grid gap-2">{children}</div>
    </form>
  );
};