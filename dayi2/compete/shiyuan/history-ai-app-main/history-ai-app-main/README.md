# 历史档案馆

沉浸式历史学习与人格画像分析应用。比赛版本中，项目内所有大模型接口统一使用 DeepSeek。

## 模型说明

- 对话生成：DeepSeek Chat Completions
- 场景与题目生成：DeepSeek Chat Completions
- 人格画像 Agent：DeepSeek Chat Completions
- 默认模型名：`deepseek-chat`，备用模型名：`deepseek-reasoner`
- RAG 检索向量：本地哈希向量，不调用其他外部大模型

## 本地运行

**Prerequisites:** Node.js

1. 安装依赖：`npm install`
2. 复制 `.env.example` 为 `.env.local`，填写 DeepSeek 与 Supabase 配置。
3. 启动项目：`npm run dev`
