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
| **加密云端同步** | 使用 GitHub Token + Gist：浏览器本地加密后上传 / 下载后在本机解密 |
| **主屏幕图标** | `manifest.json` + `icon.svg`，可「添加到主屏幕」 |

---

## 技术说明

- **纯静态前端**：单页 `index.html`（样式与脚本内联），无构建步骤。
- **本地存储**：`localStorage` 键名 `my_magic_apis`（JSON 数组）。
- **同步**：调用 GitHub REST API（`api.github.com/gists`），新 Gist 内文件名为 `magic_apis.encrypted.json`。
- **加密**：同步密码通过 PBKDF2-HMAC-SHA256 派生 AES-256-GCM 密钥；密码、站点地址和 API Key 均不会以明文上传。
- **离线缓存**：`sw.js` 对 `index.html`、`sync-crypto.js`、`manifest.json` 做简单缓存（可按需扩展）。

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
   - `sync-crypto.js`
   - `manifest.json`
   - `icon.svg`
   - `sw.js`

访问 Pages 地址后，在移动设备 Safari：**分享 → 添加到主屏幕**，即可像 App 一样从桌面打开。

---

## 项目文件结构

```
api_manager_pwa/
├── index.html          # 主界面（列表、编辑、搜索、同步、星标等）
├── sync-crypto.js      # 浏览器端同步加密/解密
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
3. 填写**同步密码**；如需在当前设备长期保存，可主动勾选“在这台设备记住同步密码”。
4. **首次上传**：Gist ID 留空 → 应用创建新的加密 Gist，并显示可复制的新 Gist ID。
5. **其他设备**：填写相同的 GitHub Token、加密 Gist ID 和同步密码，即可下载并解密。
6. **后续上传/下载**：继续使用同一个加密 Gist ID。错误密码或损坏密文不会覆盖本地数据。

GitHub Token 与 Gist ID 会按原有行为保存在浏览器 `localStorage`。同步密码默认不保存；只有主动勾选复选框后才会保存在当前浏览器。**请勿在公共设备上使用“记住同步密码”**，也不要把 GitHub Token 提交到仓库。

---

## 隐私与安全提示

- API Key 在浏览器中加密后才会写入新 Gist；Gist 只保存随机盐、IV 和密文。
- GitHub 的 Secret Gist 并非真正私有，因此仍不应公开分享 Gist 链接或截图。
- 旧版明文 Gist 的历史版本仍可能包含旧 Key。确认新加密 Gist 可在其他设备正常下载后，应删除旧 Gist，并轮换曾上传过的有效 Key。
- 忘记同步密码时，只要仍有一台设备保留本地数据，就能创建新的加密书库；若本地副本全部丢失，云端密文无法恢复。

---

## 验证加密逻辑

```bash
node --test tests/sync-crypto.test.js
```

---

## 许可

个人学习与小工具使用即可；若二次分发，请自行注意第三方图标与字体在目标环境下的授权与显示效果。

---

祝你的咒语都收进云朵和花瓣里～
