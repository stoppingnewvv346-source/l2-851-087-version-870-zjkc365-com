纯静态电影网站生成说明

站点标题：国产高分电视剧-高分电影排行榜-全集高清在线播放
LOGO：国产高分剧集
解析影片数量：2000
生成详情页数量：2000
独立分类页数量：12

封面规则：第 N 条影片引用顶级目录 ./X.jpg，X = ((N - 1) % 150) + 1。
请将 1.jpg 到 150.jpg 放在网站顶级目录，与 index.html 同级。

播放说明：TXT 数据中未提供每部影片的独立 m3u8 字段，因此播放器代码已完整实现 HLS 初始化，并使用可替换的默认 HLS 源。
如需绑定真实影片源，可在详情页 data-stream 属性或 assets/site.js 中的 DEFAULT_HLS_STREAM 中替换。

入口页面：
- index.html 首页
- categories.html 分类总览
- rankings.html 排行榜
- movies.html 全站片库
- cat-*.html 独立分类页
- movie-0001.html 至 movie-2000.html 详情页
