import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="status" className={cn("rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800", className)} {...props} />;
}
