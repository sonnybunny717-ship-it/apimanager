# API 魔法书

一个温柔治愈风的 **PWA（渐进式 Web 应用）**，用来在浏览器里管理你的各类 **API 站点名、分类、URL 与 Key**。数据默认保存在本机浏览器；可选通过 **GitHub Gist** 做云端备份与多设备同步。

---

## 功能一览

| 能力 | 说明 |
|------|------|
| **卡片列表** | 按分类浏览，展开后复制 URL / Key |
| **分类** | 普通、语音、生图、**其他**（如地图等杂项 API） |
| **星标置顶** | 常用条目可标星，在当前筛选结果内排在最前 |
| **搜索** | 点击分类行右侧半透明 **🔍**，底部弹出搜索条，按**站名**模糊匹配 |
| **云端同步** | 使用 GitHub Token + Gist：上传本地列表 / 从 Gist 拉取覆盖本地 |
| **主屏幕图标** | `manifest.json` + `icon.svg`，可「添加到主屏幕」 |

---

## 技术说明

- **纯静态前端**：单页 `index.html`（样式与脚本内联），无构建步骤。
- **本地存储**：`localStorage` 键名 `my_magic_apis`（JSON 数组）。
- **同步**：调用 GitHub REST API（`api.github.com/gists`），Gist 内文件名为 `magic_apis.json`。
- **离线缓存**：`sw.js` 对 `index.html`、`manifest.json` 做简单缓存（可按需扩展）。

---

## 本地运行

1. 用浏览器直接打开项目根目录下的 `index.html`，或  
2. 任意静态服务器托管本目录，例如：

```bash
# 若已安装 Python 3
python -m http.server 8080
```

然后访问 `http://localhost:8080/index.html`。

> **说明**：部分浏览器对 `file://` 下的 `fetch`/权限较严格，若云端同步异常，请尽量用 `http://localhost` 访问。

---

## 部署到 GitHub Pages

1. 将整个仓库推送到 GitHub。  
2. 在仓库 **Settings → Pages** 中选择分支与目录（通常为根目录或 `/docs`）。  
3. 确保以下文件随仓库一起发布（路径相对站点根目录正确即可）：

   - `index.html`
   - `manifest.json`
   - `icon.svg`
   - `sw.js`

访问 Pages 地址后，在移动设备 Safari：**分享 → 添加到主屏幕**，即可像 App 一样从桌面打开。

---

## 项目文件结构

```
api_manager_pwa/
├── index.html          # 主界面（列表、编辑、搜索、同步、星标等）
├── manifest.json       # PWA 清单（名称、主题色、图标）
├── icon.svg            # 应用图标（魔法书风格）
├── sw.js               # Service Worker（简单缓存）
├── PLAN-search-star-category.md   # 功能迭代计划备忘（可选阅读）
└── README.md           # 本说明
```

---

## 云端同步怎么用

1. 点击标题 **「API 魔法书」** 打开同步弹窗。  
2. 填写 **GitHub Personal Access Token**（需具备创建/编辑 Gist 的权限范围，按你账号设置为准）。  
3. **首次上传**：Gist ID 留空 → 上传成功后会自动写入并保存 Gist ID。  
4. **后续上传/下载**：填写已保存的 Gist ID 即可。

Token 与 Gist ID 会保存在浏览器 `localStorage`（键名如 `gh_token`、`gist_id`）。**请勿在公共设备上长期保存**，也不要把 Token 提交到公开仓库。

---

## 隐私与安全提示

- 所有 API Key 仅存在于你的浏览器本地存储及你自建的 Gist 中；**不要在公开场合分享 Gist 链接或截图**。  
- 建议将 Gist 设为 **非公开（private）**，并定期轮换 GitHub Token。

---

## 许可

个人学习与小工具使用即可；若二次分发，请自行注意第三方图标与字体在目标环境下的授权与显示效果。

---

祝你的咒语都收进云朵和花瓣里～
