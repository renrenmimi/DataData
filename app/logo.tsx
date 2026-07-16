// 品牌标:三个由浅入深的方块节点 + 一条连线,寓意「数据 + 结构」。
// 纯 SVG,继承 currentColor,放在渐变底的 .brand-mark 里。

export function BrandMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2.5" y="13.5" width="8" height="8" rx="2.2" fill="currentColor" opacity="0.55" />
      <rect x="8" y="7" width="8" height="8" rx="2.2" fill="currentColor" opacity="0.8" />
      <rect x="13.5" y="2.5" width="8" height="8" rx="2.2" fill="currentColor" />
      <path
        d="M6.5 13.5V10a2 2 0 0 1 2-2h1M17.5 10.5V14a2 2 0 0 1-2 2h-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
