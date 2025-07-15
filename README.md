# STEAM Agent - 教育知识图谱智能助手

一个基于 Mastra 框架构建的 STEAM（科学、技术、工程、艺术、数学）教育知识图谱智能助手项目。该项目旨在通过自然语言处理和向量检索技术，为教育工作者和学习者提供智能化的知识查询和推理服务。

## 🌟 项目特色

- **知识图谱**：整合高中数学和物理知识点，构建结构化知识网络
- **向量检索**：基于语义相似度的智能知识检索
- **AI 智能体**：支持自然语言对话的教育助手
- **多模态工作流**：支持复杂的知识推理和查询流程
- **可扩展架构**：基于 Mastra 框架的模块化设计

## 📁 项目结构

```
steam-agent/
├── dataset/                    # 数据集目录
│   └── knowledge-graph/        # 知识图谱数据
│       ├── data-summery/       # 知识点汇总数据
│       └── graph/              # 图结构数据
│           ├── math_knowledge_graph_new.json
│           └── physics_knowledge_graph_new.json
├── steam/                      # 主要应用代码
│   ├── src/
│   │   ├── mastra/            # Mastra 配置
│   │   │   ├── agents/        # AI 智能体
│   │   │   ├── tools/         # 工具函数
│   │   │   └── workflows/     # 工作流
│   │   ├── rag/               # 向量检索系统
│   │   └── scripts/           # 脚本工具
│   ├── prisma/                # 数据库配置
│   └── package.json
└── prisma/                    # 全局数据库配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.9.0
- PostgreSQL 数据库
- pnpm 包管理器

### 1. 克隆项目

```bash
git clone <repository-url>
cd steam-agent
```

### 2. 安装依赖

```bash
cd steam
pnpm install
```

### 3. 环境配置

在 `steam` 目录下创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/steam_agent"

# AI 服务配置
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"

# 其他配置
MASTRA_APP_URL="http://localhost:4000"
```

## 🗄️ 数据库设置

### 启动 PostgreSQL

**使用 Docker：**
```bash
docker run --name steam-postgres \
  -e POSTGRES_DB=steam_agent \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

**使用本地安装：**
```bash
# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# 创建数据库
createdb steam_agent
```

### 数据库迁移

```bash
cd steam

# 生成 Prisma 客户端
pnpm prisma generate

# 运行数据库迁移
pnpm prisma migrate dev

# 查看数据库状态
pnpm prisma studio
```

### 数据库更新

当数据库模式发生变化时：

```bash
# 1. 修改 prisma/schema.prisma 文件

# 2. 创建新的迁移
pnpm prisma migrate dev --name describe_your_changes

# 3. 重新生成客户端
pnpm prisma generate

# 4. 重建索引（如果需要）
pnpm build:index
```

## 📊 数据索引构建

项目使用向量数据库进行语义检索，需要构建知识点和知识图谱的向量索引：

```bash
cd steam

# 构建向量索引
pnpm build:index
```

该命令会：
1. 加载知识点数据并生成向量嵌入
2. 处理知识图谱节点并建立索引
3. 将向量数据存储到 PostgreSQL 中

## 🔧 本地开发

### 启动开发服务器

```bash
cd steam

# 开发模式启动
pnpm dev
```

### 构建生产版本

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

### 可用脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm build:index` - 构建向量索引
- `pnpm prisma studio` - 打开数据库管理界面
- `pnpm prisma migrate dev` - 运行数据库迁移

## 🧪 API 使用示例

### 查询知识点

```typescript
// 使用自然语言查询
const response = await fetch('/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "什么是牛顿第二定律？",
    type: "knowledge_search"
  })
});
```

### 图谱推理

```typescript
// 基于知识图谱的关系推理
const response = await fetch('/api/graph', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "力与运动的关系",
    reasoning_type: "relationship"
  })
});
```

## 📈 数据管理

### 添加新的知识点

1. 将知识点数据添加到 `dataset/knowledge-connection/` 目录
2. 运行索引构建命令：`pnpm build:index`

### 更新知识图谱

1. 编辑相应的知识图谱 JSON 文件
2. 确保节点格式正确（包含 `id`, `label`, `properties`）
3. 确保边格式正确（包含 `source`, `target`, `label`）
4. 重建索引：`pnpm build:index`

### 数据备份

```bash
# 导出数据库
pg_dump steam_agent > backup.sql

# 恢复数据库
psql steam_agent < backup.sql
```

## 🛠️ 技术栈

- **框架**: [Mastra](https://mastra.ai/) - AI 应用开发框架
- **数据库**: PostgreSQL + Prisma ORM
- **向量检索**: pgvector 扩展
- **AI 模型**: OpenAI GPT / Google Gemini
- **语言**: TypeScript
- **包管理**: pnpm

## 📝 开发规范

### 代码风格

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 使用模块化架构组织代码

### 数据格式规范

**知识点格式：**
```json
{
  "id": "unique_id",
  "content": "知识点内容",
  "metadata": {
    "subject": "Physics",
    "grade": "高中",
    "difficulty": "中等"
  }
}
```

**知识图谱节点格式：**
```json
{
  "id": "node_id",
  "label": "节点标签",
  "properties": {
    "description": "节点描述",
    "category": "分类",
    "subject": "学科"
  }
}
```

**知识图谱边格式：**
```json
{
  "source": "source_node_id",
  "target": "target_node_id",
  "label": "关系类型",
  "properties": {
    "description": "关系描述"
  }
}
```

## 🐛 常见问题

### 1. 数据库连接失败
- 检查 PostgreSQL 服务是否启动
- 验证 `DATABASE_URL` 环境变量配置
- 确认数据库用户权限

### 2. 向量索引构建失败
- 确保 pgvector 扩展已安装
- 检查知识图谱 JSON 文件格式
- 验证 AI API 密钥配置

### 3. 依赖安装问题
- 使用 Node.js 20.9.0 或更高版本
- 清除缓存：`pnpm cache clean`
- 删除 `node_modules` 后重新安装

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 开启 Pull Request

## 📄 许可证

本项目采用 ISC 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 📧 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。

---

**注意**: 请确保在生产环境中妥善配置环境变量和安全设置。 