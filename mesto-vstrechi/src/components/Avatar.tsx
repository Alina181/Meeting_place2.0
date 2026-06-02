type AvatarProps = {
  color: string;
  image?: string;
  size?: "small" | "normal" | "large" | "hero";
};

export function Avatar({ color, image, size = "normal" }: AvatarProps) {
  return <span className={`avatar ${size}`} style={{ background: image ? `url(${image}) center/cover` : color }} />;
}
