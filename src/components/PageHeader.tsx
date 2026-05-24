interface Props {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: Props) {
  return (
    <div className="border-b border-card-border bg-card/60 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
