import Image from 'next/image';
import { cn } from '@/lib/utils';

type PolicaiLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  withWordmark?: boolean;
};

export function PolicaiLogo({
  className,
  iconClassName,
  textClassName,
  withWordmark = true,
}: PolicaiLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/logo-policai.png"
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        className={cn('h-7 w-7 shrink-0 object-contain', iconClassName)}
      />
      {withWordmark ? (
        <span
          className={cn(
            'font-sans text-lg font-bold uppercase tracking-[0.18em] text-foreground',
            textClassName
          )}
        >
          Policai
        </span>
      ) : null}
    </span>
  );
}
