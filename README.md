# 杨红 · 湖北大学文学院 个人学术主页

静态站点，托管于 GitHub Pages：

- 中文版：<https://yanghong20.github.io/>
- English：<https://yanghong20.github.io/en.html>

## 目录结构

```
index.html            中文版页面骨架
en.html               英文版页面骨架（<html lang="en" data-lang="en">）
css/style.css         样式（含语言切换按钮与英文版字体规则）
js/app.js             渲染与路由逻辑，按页面 data-lang 自动切换语言与数据源
data/site.json        中文内容数据（profile + sections）
data/site-en.json     英文内容数据（结构与中文版完全一致）
uploads/portrait.jpg  个人照片
assets/favicon.svg    站点图标
如何更新主页.md        面向非技术用户的中文操作说明
```

## 中英双语机制

页面的语言由 `<html>` 标签上的 `data-lang` 决定，脚本据此选择数据文件与界面文案：

| 页面 | `data-lang` | 读取数据 | 导航栏语言按钮 |
|---|---|---|---|
| `index.html` | `zh` | `data/site.json` | EN → `en.html` |
| `en.html` | `en` | `data/site-en.json` | 中文 → `index.html` |

两套数据文件的 `id` 必须保持一致（`sec-pub`、`it-p1`…），否则英文版的栏目路由与搜索会失效。修改内容时**两个文件都要改**，只改一个会出现中英不一致。

## 修改内容

所有可编辑内容集中在 `data/site.json`（中文）与 `data/site-en.json`（英文）：编辑这两个文件即可更新姓名、简介、研究方向、联系方式及各板块条目，无需改动 JS。

> **不熟悉 JSON 的话，请先读 [如何更新主页.md](./如何更新主页.md)**——里面有增删条目的分步示例和常见错误排查。

## 本地预览

```bash
python3 -m http.server 8000
# 中文版 http://localhost:8000
# 英文版 http://localhost:8000/en.html
```

> 直接双击 `index.html` 以 `file://` 打开时，浏览器会因同源策略阻止 `fetch` 读取 `data/site.json`，页面将提示"数据加载失败"。请用本地服务器预览。

## 来源

由 https://yanghong-linguistics.app.workbuddy.host/ 迁移而来。原站点的数据来自服务端接口 `/api/site`，迁移后改为直接读取静态文件 `data/site.json`。
