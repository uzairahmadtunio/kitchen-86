import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/lib/site-data";

export function WhatsAppFloat() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 60_000 });
  const number = (settings?.whatsapp ?? "+923064379361").replace(/\D/g, "");
  if (!number) return null;
  const url = `https://wa.me/${number}?text=${encodeURIComponent("Hi Kitchen 86! I'd like to order 🍔")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Order via WhatsApp"
      className="group fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#22C55E] text-white shadow-2xl shadow-[#22C55E]/40 hover:scale-110 transition-transform"
    >
      <span className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-40 pointer-events-none" />
      <svg viewBox="0 0 24 24" className="relative h-7 w-7 fill-current" aria-hidden="true">
        <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.89c0 2.09.55 4.13 1.59 5.93L0 24l6.32-1.66a11.86 11.86 0 0 0 5.73 1.46h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.43-8.42ZM12.06 21.4h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.21-3.75.98 1-3.65-.23-.37a9.5 9.5 0 0 1-1.46-5.05c0-5.25 4.27-9.52 9.53-9.52 2.54 0 4.94 1 6.74 2.8a9.45 9.45 0 0 1 2.79 6.73c0 5.26-4.27 9.62-9.42 9.62Zm5.44-7.13c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.07.15.2 2.1 3.21 5.08 4.5.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"/>
      </svg>
      <span className="absolute right-16 whitespace-nowrap rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Order via WhatsApp 🍔
      </span>
    </a>
  );
}
