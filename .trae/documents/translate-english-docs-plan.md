# 英文文档翻译为中文 - 实现计划

## 项目概述
找到项目中的全部英文文档，将其翻译为中文。

## 已确认需要翻译的英文文档列表
| 序号 | 文件路径 | 状态 |
|------|----------|------|
| 1 | README.md | 已翻译 |
| 2 | AGENTS.md | 已翻译 |
| 3 | docs/code-map.md | 已翻译 |
| 4 | docs/dev-setup.md | 已翻译 |
| 5 | docs/risk-areas.md | 已翻译 |
| 6 | docs/CONTRIBUTING.md | 已翻译 |
| 7 | docs/architecture/README.md | 已翻译 |
| 8 | docs/architecture/container.md | 已翻译 |
| 9 | docs/architecture/context.md | 已翻译 |
| 10 | docs/designs/project-overview.md | 已翻译 |
| 11 | docs/api/README.md | 已翻译 |
| 12 | src/app/README.md | 已翻译 |
| 13 | src/server/README.md | 已翻译 |
| 14 | prompts/README.md | 已翻译 |
| 15 | prompts/feature-task.md | 已翻译 |
| 16 | prompts/bugfix-task.md | 已翻译 |
| 17 | prompts/migration-task.md | 已翻译 |
| 18 | scripts/README.md | 已翻译 |
| 19 | tests/e2e/README.md | 已翻译 |
| 20 | tests/integration/README.md | 已翻译 |
| 21 | tests/unit/README.md | 已翻译 |

## 已确认已是中文的文档（不需要翻译）
- docs/adr/ADR-001-local-first-architecture.md
- docs/adr/ADR-002-tech-stack-selection.md
- docs/adr/README.md
- docs/designs/README.md
- .trae/documents/bookkeeping-project-framework-setup.md
- .trae/rules/common.md

## [x] 任务 1: 翻译项目根目录的文档
- **Priority**: P0
- **Depends On**: None
- **Description**: 翻译 README.md 和 AGENTS.md
- **Success Criteria**: 两个文档完整翻译为中文，保持原有格式和结构
- **Test Requirements**:
  - `programmatic` TR-1.1: 文件内容完整，无遗漏
  - `human-judgement` TR-1.2: 翻译准确，专业术语正确
- **Notes**: 这两个文档是项目最重要的入口文档

## [x] 任务 2: 翻译 docs/ 目录下的核心文档
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**: 翻译 docs/code-map.md, docs/dev-setup.md, docs/risk-areas.md, docs/CONTRIBUTING.md
- **Success Criteria**: 四个文档完整翻译为中文，保持原有格式和结构
- **Test Requirements**:
  - `programmatic` TR-2.1: 文件内容完整，无遗漏
  - `human-judgement` TR-2.2: 翻译准确，专业术语正确
- **Notes**: 这些是开发和贡献者必读的核心文档

## [x] 任务 3: 翻译 docs/architecture/ 目录下的文档
- **Priority**: P1
- **Depends On**: 任务 2
- **Description**: 翻译 docs/architecture/README.md, docs/architecture/container.md, docs/architecture/context.md
- **Success Criteria**: 三个文档完整翻译为中文，保持原有格式和结构，Mermaid 图表保持不变
- **Test Requirements**:
  - `programmatic` TR-3.1: 文件内容完整，Mermaid 图表完整保留
  - `human-judgement` TR-3.2: 翻译准确，架构描述清晰
- **Notes**: 保持 Mermaid 代码块不变

## [x] 任务 4: 翻译 docs/designs/ 和 docs/api/ 目录下的文档
- **Priority**: P1
- **Depends On**: 任务 3
- **Description**: 翻译 docs/designs/project-overview.md, docs/api/README.md
- **Success Criteria**: 两个文档完整翻译为中文
- **Test Requirements**:
  - `programmatic` TR-4.1: 文件内容完整，代码示例保留
  - `human-judgement` TR-4.2: 翻译准确，API 文档清晰
- **Notes**: 保持代码示例和 JSON 格式不变

## [x] 任务 5: 翻译 src/app/ 和 src/server/ 目录下的 README
- **Priority**: P1
- **Depends On**: 任务 4
- **Description**: 翻译 src/app/README.md, src/server/README.md
- **Success Criteria**: 两个文档完整翻译为中文
- **Test Requirements**:
  - `programmatic` TR-5.1: 文件内容完整
  - `human-judgement` TR-5.2: 翻译准确，技术说明清晰
- **Notes**: 技术说明和命令保持原样

## [x] 任务 6: 翻译 prompts/ 目录下的文档
- **Priority**: P2
- **Depends On**: 任务 5
- **Description**: 翻译 prompts/README.md, prompts/feature-task.md, prompts/bugfix-task.md, prompts/migration-task.md
- **Success Criteria**: 四个文档完整翻译为中文
- **Test Requirements**:
  - `programmatic` TR-6.1: 文件内容完整
  - `human-judgement` TR-6.2: 翻译准确，任务模板清晰
- **Notes**: TODO 标记和模板结构保持原样

## [x] 任务 7: 翻译 scripts/ 和 tests/ 目录下的文档
- **Priority**: P2
- **Depends On**: 任务 6
- **Description**: 翻译 scripts/README.md, tests/e2e/README.md, tests/integration/README.md, tests/unit/README.md
- **Success Criteria**: 四个文档完整翻译为中文
- **Test Requirements**:
  - `programmatic` TR-7.1: 文件内容完整
  - `human-judgement` TR-7.2: 翻译准确，测试说明清晰
- **Notes**: 这些是辅助文档，最后翻译

## 翻译原则
1. 保持原有 Markdown 格式、标题层级、代码块等完全不变
2. 专业术语保持一致性（如 "Local-First", "SQLite", "Go" 等不翻译）
3. 技术命令、路径、URL 等保持原样
4. Mermaid 图表代码块完全保留
5. 翻译风格保持专业、简洁、准确
