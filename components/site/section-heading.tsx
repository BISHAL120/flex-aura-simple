import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
  className,
}: {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  as?: "h1" | "h2"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? <Badge variant="secondary">{eyebrow}</Badge> : null}
      <Heading id={id} className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </Heading>
      {description ? (
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
