# 阶段 1 实施计划：本地账目流水记录

目标：完成账目流水的增删改查功能，包括 Service 层和 UI 层。

---

## 技术决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| UI 组件库 | React Native Paper | Material Design，成熟稳定，文档完善 |
| 表单处理 | react-hook-form | 性能好，验证集成方便 |
| 导航 | @react-navigation/native | React Native 标准方案 |
| 开发策略 | 串行开发 | 先完成 Service 层，再做 UI 层 |

---

## 第一部分：Service 层 (BACK-006)

### 1.1 创建 LedgerEntryService

**文件**: `src/app/src/services/LedgerEntryService.ts`

**接口设计**:
```typescript
interface CreateEntryInput {
  amount: number;      // 元（浮点数）
  type: 'income' | 'expense';
  description: string;
  date: string;        // YYYY-MM-DD
}

interface UpdateEntryInput {
  id: string;
  amount?: number;
  type?: 'income' | 'expense';
  description?: string;
  date?: string;
}

class LedgerEntryService {
  async create(input: CreateEntryInput): Promise<LedgerEntry>
  async update(input: UpdateEntryInput): Promise<LedgerEntry | null>
  async delete(id: string): Promise<boolean>
  async getById(id: string): Promise<LedgerEntry | null>
  async getList(filter?: LedgerEntryFilter): Promise<LedgerEntry[]>
  async getSummary(filter?: LedgerEntryFilter): Promise<Summary>
}
```

### 1.2 业务规则验证

| 规则 | 错误信息 |
|------|----------|
| 金额 > 0 | "金额必须大于0" |
| 描述非空且 <= 500字符 | "描述不能为空，最多500字" |
| 日期不能是未来 | "日期不能晚于今天" |
| 类型必须是 income/expense | "类型无效" |

### 1.3 错误处理

```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class EntryNotFoundError extends Error {
  constructor(id: string) {
    super(`Entry not found: ${id}`);
    this.name = 'EntryNotFoundError';
  }
}
```

### 1.4 单元测试

**文件**: `src/app/__tests__/services/LedgerEntryService.test.ts`

测试用例：
- 创建账目（收入/支出）
- 更新账目
- 删除账目
- 验证规则（金额、日期、描述）
- 错误处理

---

## 第二部分：UI 层 (BACK-007~010)

### 2.1 依赖安装

```bash
npm install react-native-paper
npm install react-hook-form @hookform/resolvers zod
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

### 2.2 目录结构

```
src/app/src/
├── screens/
│   ├── LedgerListScreen.tsx      # 账目列表
│   ├── AddEntryScreen.tsx        # 添加账目
│   └── EditEntryScreen.tsx       # 编辑账目
├── components/
│   ├── EntryCard.tsx             # 账目卡片
│   ├── EntryForm.tsx             # 表单组件（复用）
│   └── EmptyState.tsx            # 空状态
├── navigation/
│   └── AppNavigator.tsx          # 导航配置
└── hooks/
    └── useEntries.ts             # 数据获取 hook
```

### 2.3 UI 组件规范

**颜色**:
- 收入：`#4CAF50` (绿色)
- 支出：`#F44336` (红色)

**金额显示**:
- 使用 `Money.format()` 格式化
- 收入显示 `+¥100.00`
- 支出显示 `-¥50.00`

### 2.4 页面设计

#### LedgerListScreen
- 顶部：总览卡片（本月收入/支出/结余）
- 中间：账目列表（按日期分组）
- 底部：浮动添加按钮
- 下拉刷新

#### AddEntryScreen / EditEntryScreen
- 金额输入（数字键盘）
- 类型切换（收入/支出 Toggle）
- 日期选择器
- 描述输入（多行）
- 保存/删除按钮

---

## 第三部分：集成

### 3.1 连接 Service 和 UI

```typescript
// hooks/useEntries.ts
import { ledgerEntryService } from '../services/LedgerEntryService';

export function useEntries(filter?: LedgerEntryFilter) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ledgerEntryService.getList(filter)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [filter]);

  return { entries, loading, refresh: () => {/* ... */} };
}
```

### 3.2 导航配置

```typescript
type RootStackParamList = {
  LedgerList: undefined;
  AddEntry: undefined;
  EditEntry: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
```

### 3.3 集成测试

- 添加账目 → 列表显示新记录
- 编辑账目 → 列表更新
- 删除账目 → 列表移除
- 离线操作正常

---

## 执行顺序

```
Step 1: 实现 LedgerEntryService
  ├── 创建 Service 文件
  ├── 实现业务逻辑和验证
  ├── 添加错误类型
  └── 编写单元测试

Step 2: 安装 UI 依赖
  └── 安装 paper, hook-form, navigation

Step 3: 实现 UI 组件
  ├── 创建导航结构
  ├── 实现列表页
  ├── 实现表单组件
  └── 实现添加/编辑页

Step 4: 集成
  ├── 连接 Service 和 UI
  ├── 添加状态管理
  └── 端到端测试
```

---

## 验收标准

### Service 层
- [ ] 所有 CRUD 方法正常工作
- [ ] 业务验证规则生效
- [ ] 单元测试覆盖率 > 80%

### UI 层
- [ ] 列表正确显示账目
- [ ] 表单验证正确
- [ ] 导航跳转正常
- [ ] 收入/支出颜色区分

### 集成
- [ ] 完整流程可操作
- [ ] 离线可用
- [ ] 数据持久化正确
