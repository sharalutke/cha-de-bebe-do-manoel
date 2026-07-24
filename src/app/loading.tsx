export default function Loading() {
  return (
    <div className="page-shell py-12">
      <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        <div className="skeleton h-80 rounded-[32px]" />
        <div className="skeleton h-80 rounded-[32px]" />
      </div>
    </div>
  );
}
