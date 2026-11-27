import { ExternalLink, Smartphone } from "lucide-react";
import { AppleIcon } from "@/components/icons/BrandIcons";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type ExternalLinkButtonProps = {
  projectUrl: string | null | undefined;
  linkType: "website" | "android" | "ios" | "none";
  className?: string;
};

export default function ExternalLinkButton({
  projectUrl,
  linkType,
  className,
}: ExternalLinkButtonProps) {
  if (!projectUrl || linkType === "none" || !/^https?:\/\//i.test(projectUrl)) {
    return null;
  }

  let label = "Visit Website";
  let icon = <ExternalLink className="size-4 shrink-0" />;

  if (linkType === "android") {
    label = "Get it on Google Play";
    icon = <Smartphone className="size-4 shrink-0" />;
  } else if (linkType === "ios") {
    label = "Download on the App Store";
    icon = <AppleIcon className="size-4 shrink-0" />;
  }

  return (
    <a
      href={projectUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonClasses({ variant: "secondary", size: "md" }),
        "gap-2 font-medium",
        className,
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
