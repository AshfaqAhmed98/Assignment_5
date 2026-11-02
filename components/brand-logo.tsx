import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  className = "",
  priority = true,
}: BrandLogoProps) {
  return (
    <Image
      src="/eventmatrix-logo-trim.png"
      alt="EventMatrix"
      width={1796}
      height={359}
      priority={priority}
      unoptimized
      className={`h-auto max-w-full ${className}`}
    />
  );
}
