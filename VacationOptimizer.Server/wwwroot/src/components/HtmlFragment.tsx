interface HtmlFragmentProps {
  html: string;
  className?: string;
}

export default function HtmlFragment({ html, className }: HtmlFragmentProps) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
