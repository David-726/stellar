// 站点常量 —— 想改站点信息只需要动这个文件
export const SITE = {
  title: "Jounery2Stellar",
  // 导航栏左上角的短标志
  logo: "J2S",
  description: "深度学习 / FPGA / 生活记录",
  // 站点开始日期，用于页脚版权区间
  startDate: 2026,
  author: "JS",
  bio: "We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard.",
  links: [
    { name: "github", url: "https://github.com/David-726" },
    { name: "email", url: "mailto:david_726@qq.com" },
    { name: "rss", url: "/rss.xml" },
  ],
};

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
}
