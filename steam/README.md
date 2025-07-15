# STEAM Agent

这是 STEAM Agent 项目的主要应用代码目录。

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库和 AI API 密钥

# 数据库设置
pnpm prisma generate
pnpm prisma migrate dev

# 构建向量索引
pnpm build:index

# 启动开发服务器
pnpm dev
```

## 可用脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm build:index` - 构建向量索引
- `pnpm prisma studio` - 打开数据库管理界面
- `pnpm prisma migrate dev` - 运行数据库迁移

## 项目结构

```
src/
├── mastra/           # Mastra 框架配置
│   ├── agents/       # AI 智能体定义
│   ├── tools/        # 工具函数
│   └── workflows/    # 工作流定义
├── rag/              # 向量检索系统
│   ├── loader.ts     # 数据加载器
│   └── vector-store.ts # 向量存储配置
└── scripts/          # 实用脚本
    └── build-index.ts # 索引构建脚本
```

详细文档请参阅项目根目录的 [README.md](../README.md)。 