# 杨红 · 湖北大学文学院 个人学术主页

静态站点，托管于 GitHub Pages：<https://yanghong20.github.io/>

## 目录结构

```
index.html          页面骨架
css/style.css       样式
js/app.js           渲染与路由逻辑
data/site.json      全站内容数据（profile + sections）
uploads/photo.jpg   个人照片
assets/favicon.svg  站点图标
如何更新主页.md      面向非技术用户的中文操作说明
```

## 修改内容

所有可编辑内容集中在 `data/site.json`：编辑该文件即可更新姓名、简介、研究方向、联系方式及各板块条目，无需改动 JS。

> **不熟悉 JSON 的话，请先读 [如何更新主页.md](./如何更新主页.md)**——里面有增删条目的分步示例和常见错误排查。

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

> 直接双击 `index.html` 以 `file://` 打开时，浏览器会因同源策略阻止 `fetch` 读取 `data/site.json`，页面将提示"数据加载失败"。请用本地服务器预览。

## 来源

由 https://yanghong-linguistics.app.workbuddy.host/ 迁移而来。原站点的数据来自服务端接口 `/api/site`，迁移后改为直接读取静态文件 `data/site.json`。
