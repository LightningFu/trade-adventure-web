# GitHub Pages 部署指南

本项目配置了 GitHub Actions 自动部署到 GitHub Pages。

## 部署步骤

### 1. 创建 GitHub 仓库

```bash
# 进入项目目录
cd /workspace/trade-adventure-web

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 商路风云 Web 版初始提交"

# 添加远程仓库 (替换 YOUR_USERNAME 为你的 GitHub 用户名)
git remote add origin https://github.com/YOUR_USERNAME/trade-adventure-web.git

# 推送代码
git branch -M main
git push -u origin main
```

### 2. 配置 GitHub Pages

1. 访问你的 GitHub 仓库
2. 进入 **Settings** → **Pages**
3. 在 "Build and deployment" 部分：
   - Source: **GitHub Actions**
4. 保存设置

### 3. 触发部署

推送代码到 `main` 分支后，GitHub Actions 会自动：

1. 检出代码
2. 安装依赖
3. 构建项目
4. 部署到 GitHub Pages

部署完成后，访问：`https://YOUR_USERNAME.github.io/trade-adventure-web`

## 手动验证部署

### 检查 Actions 状态

仓库 → Actions → 查看 "Deploy to GitHub Pages" workflow

### 查看部署日志

如果部署失败，点击失败的 workflow run 查看错误信息。

## 故障排除

### 部署失败

检查 `dist/` 目录是否正确生成：

```bash
npm run build
ls -la dist/
```

### 404 错误

确保 GitHub Pages 设置中 Source 选择了 GitHub Actions。

### 资源加载失败

检查 `vite.config.ts` 中的 `publicDir` 配置是否正确。

## 定制化

### 修改仓库名称

如果想用不同的仓库名称：

1. 重命名 GitHub 仓库
2. 更新 `vite.config.ts` 中的 base 路径：

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
});
```

3. 重新构建并推送
