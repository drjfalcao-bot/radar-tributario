export function BrandMark({ size = "md", dark = true }: { size?: "sm" | "md" | "lg"; dark?: boolean }) {
  const dimensions = size === "lg" ? "h-12 w-10" : size === "sm" ? "h-8 w-7" : "h-10 w-9";
  const innerBackground = dark ? "#062c2e" : "#ffffff";

  return (
    <span className={`relative inline-block shrink-0 ${dimensions}`} aria-label="Radar Tributário">
      <span
        className="absolute inset-0 bg-[#d8aa51]"
        style={{ clipPath: "polygon(50% 0%, 100% 22%, 100% 78%, 50% 100%, 0% 78%, 0% 22%)" }}
      />
      <span
        className="absolute inset-[3px]"
        style={{
          background: innerBackground,
          clipPath: "polygon(50% 0%, 100% 22%, 100% 78%, 50% 100%, 0% 78%, 0% 22%)",
        }}
      />
      <span className="absolute bottom-[20%] left-[25%] top-[28%] w-[13%] rounded-sm bg-[#d8aa51]" />
      <span className="absolute bottom-[13%] left-[44%] top-[18%] w-[13%] rounded-sm bg-[#d8aa51]" />
      <span className="absolute bottom-[20%] right-[25%] top-[28%] w-[13%] rounded-sm bg-[#d8aa51]" />
    </span>
  );
}
