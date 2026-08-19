import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-white/10 bg-transparent px-8 py-4">
      <Link href="/" className="flex items-center gap-3 no-underline">
        <Image src="/logo-2.png" alt="Breach Pointer" width={28} height={28} className="rounded-md object-contain" />
        <span className="text-[15px] font-semibold tracking-tight text-white">Breach Pointer</span>
        <span className="text-white/30">·</span>
        <span className="text-[13px] text-white/50">by TAI Labs</span>
      </Link>
    </header>
  );
}
