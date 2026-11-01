import Image from "next/image";

type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Image
      src="/eventmatrix-logo-trim.png"
      alt="EventMatrix"
      width={1796}
      height={359}
      priority
      unoptimized
      className={`h-auto max-w-full ${className}`}
    />
  );
}
