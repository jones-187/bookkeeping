# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: persistence.spec.ts >> 数据持久化 >> 编辑后持久化 >> 编辑类型后刷新页面，类型应该正确
- Location: e2e/specs/persistence.spec.ts:137:9

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('add-entry-fab') to be visible
    35 × locator resolved to hidden <button tabindex="0" role="button" type="button" aria-label="添加账目" data-testid="add-entry-fab" class="css-view-175oi2r r-touchAction-1otgn73 r-cursor-1loqt21 r-position-bnwqim r-transition-ctqt5z r-overflow-1udh08x">…</button>

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic:
    - generic:
      - generic:
        - link "账目流水, back" [ref=e7] [cursor=pointer]:
          - /url: /LedgerList
        - heading "编辑账目" [level=1] [ref=e10]
  - generic [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]: 类型
      - generic [ref=e19]:
        - button "支出" [ref=e21] [cursor=pointer]:
          - generic [ref=e22]:
            - generic [ref=e23]:
              - img: 󰁝
            - generic [ref=e24]: 支出
        - button "收入" [ref=e26] [cursor=pointer]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - img: 󰁅
            - generic [ref=e29]: 收入
    - generic [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic:
            - generic:
              - generic:
                - generic: 金额（元）
                - generic: 金额（元）
          - textbox "金额输入" [ref=e33]
        - generic [ref=e35]: ¥
      - generic [ref=e36]: 请输入金额
    - generic [ref=e37]:
      - generic [ref=e39]:
        - generic:
          - generic:
            - generic:
              - generic: 描述
              - generic: 描述
        - textbox "描述输入" [ref=e40]:
          - /placeholder: 例如：午餐、交通、工资等
      - generic [ref=e41]: 请输入描述
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic:
          - generic:
            - generic:
              - generic: 日期
              - generic: 日期
        - textbox "日期输入" [ref=e45]:
          - /placeholder: YYYY-MM-DD
          - text: 2026-04-05
      - button [ref=e48] [cursor=pointer]:
        - img: 󰃭
    - generic [ref=e49]:
      - button "更新" [active] [ref=e51] [cursor=pointer]:
        - generic [ref=e53]: 更新
      - button "删除" [ref=e55] [cursor=pointer]:
        - generic [ref=e57]: 删除
```

# Test source

```ts
  4   |  */
  5   | import { Page, Locator, expect } from '@playwright/test';
  6   | 
  7   | /**
  8   |  * 表单数据
  9   |  */
  10  | export interface EntryFormData {
  11  |   type: 'income' | 'expense';
  12  |   amount: number;
  13  |   description: string;
  14  |   date: string;
  15  | }
  16  | 
  17  | /**
  18  |  * 账目表单页 Page Object
  19  |  */
  20  | export class EntryFormPage {
  21  |   readonly page: Page;
  22  |   readonly typeSelector: Locator;
  23  |   readonly typeExpense: Locator;
  24  |   readonly typeIncome: Locator;
  25  |   readonly amountInput: Locator;
  26  |   readonly descriptionInput: Locator;
  27  |   readonly dateInput: Locator;
  28  |   readonly submitButton: Locator;
  29  |   readonly deleteButton: Locator;
  30  | 
  31  |   constructor(page: Page) {
  32  |     this.page = page;
  33  |     this.typeSelector = page.getByTestId('type-selector');
  34  |     this.typeExpense = page.getByTestId('type-expense');
  35  |     this.typeIncome = page.getByTestId('type-income');
  36  |     this.amountInput = page.getByTestId('amount-input');
  37  |     this.descriptionInput = page.getByTestId('description-input');
  38  |     this.dateInput = page.getByTestId('date-input');
  39  |     this.submitButton = page.getByTestId('submit-button');
  40  |     this.deleteButton = page.getByTestId('delete-button');
  41  |   }
  42  | 
  43  |   /**
  44  |    * 选择类型
  45  |    */
  46  |   async selectType(type: 'income' | 'expense'): Promise<void> {
  47  |     if (type === 'income') {
  48  |       await this.typeIncome.click();
  49  |     } else {
  50  |       await this.typeExpense.click();
  51  |     }
  52  |   }
  53  | 
  54  |   /**
  55  |    * 填写金额
  56  |    */
  57  |   async fillAmount(amount: number): Promise<void> {
  58  |     await this.amountInput.clear();
  59  |     await this.amountInput.fill(String(amount));
  60  |   }
  61  | 
  62  |   /**
  63  |    * 填写描述
  64  |    */
  65  |   async fillDescription(description: string): Promise<void> {
  66  |     await this.descriptionInput.clear();
  67  |     await this.descriptionInput.fill(description);
  68  |   }
  69  | 
  70  |   /**
  71  |    * 填写日期
  72  |    */
  73  |   async fillDate(date: string): Promise<void> {
  74  |     await this.dateInput.clear();
  75  |     await this.dateInput.fill(date);
  76  |   }
  77  | 
  78  |   /**
  79  |    * 填写完整表单
  80  |    */
  81  |   async fillForm(data: Partial<EntryFormData>): Promise<void> {
  82  |     if (data.type !== undefined) {
  83  |       await this.selectType(data.type);
  84  |     }
  85  |     if (data.amount !== undefined) {
  86  |       await this.fillAmount(data.amount);
  87  |     }
  88  |     if (data.description !== undefined) {
  89  |       await this.fillDescription(data.description);
  90  |     }
  91  |     if (data.date !== undefined) {
  92  |       await this.fillDate(data.date);
  93  |     }
  94  |   }
  95  | 
  96  |   /**
  97  |    * 提交表单
  98  |    */
  99  |   async submit(): Promise<void> {
  100 |     await this.submitButton.click();
  101 |     // 等待导航完成 - 检查是否在列表页或仍在表单页
  102 |     // 先等待表单页消失或 FAB 出现
  103 |     await Promise.race([
> 104 |       this.page.getByTestId('add-entry-fab').waitFor({ state: 'visible', timeout: 15000 }),
      |                                              ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  105 |       this.page.waitForURL('**/LedgerList', { timeout: 15000 }).catch(() => {}),
  106 |     ]);
  107 |     // 额外等待数据加载
  108 |     await this.page.waitForTimeout(1500);
  109 |   }
  110 | 
  111 |   /**
  112 |    * 点击删除按钮
  113 |    * 注意：删除有确认对话框，需要额外处理
  114 |    */
  115 |   async clickDelete(): Promise<void> {
  116 |     await this.deleteButton.click();
  117 |   }
  118 | 
  119 |   /**
  120 |    * 确认删除对话框
  121 |    */
  122 |   async confirmDelete(): Promise<void> {
  123 |     // Web 上 Alert.alert 在 React Native Web 中可能表现为 window.confirm
  124 |     // 等待返回列表页（通过检测列表元素而不是 URL）
  125 |     await this.page.getByTestId('add-entry-fab').waitFor({ state: 'visible', timeout: 10000 });
  126 |   }
  127 | 
  128 |   /**
  129 |    * 获取金额错误信息
  130 |    */
  131 |   async getAmountError(): Promise<string | null> {
  132 |     const errorLocator = this.amountInput.locator('xpath=../..').locator('text=/金额必须|金额为正/');
  133 |     if (await errorLocator.isVisible()) {
  134 |       return await errorLocator.textContent();
  135 |     }
  136 |     return null;
  137 |   }
  138 | 
  139 |   /**
  140 |    * 获取描述错误信息
  141 |    */
  142 |   async getDescriptionError(): Promise<string | null> {
  143 |     const errorLocator = this.descriptionInput.locator('xpath=../..').locator('text=/描述不能为空/');
  144 |     if (await errorLocator.isVisible()) {
  145 |       return await errorLocator.textContent();
  146 |     }
  147 |     return null;
  148 |   }
  149 | 
  150 |   /**
  151 |    * 获取日期错误信息
  152 |    */
  153 |   async getDateError(): Promise<string | null> {
  154 |     const errorLocator = this.dateInput.locator('xpath=../..').locator('text=/日期格式|日期不能/');
  155 |     if (await errorLocator.isVisible()) {
  156 |       return await errorLocator.textContent();
  157 |     }
  158 |     return null;
  159 |   }
  160 | 
  161 |   /**
  162 |    * 提交表单（用于验证错误场景，不等待返回列表页）
  163 |    */
  164 |   async submitExpectingError(): Promise<void> {
  165 |     await this.submitButton.click();
  166 |     // 等待一小段时间让验证错误显示
  167 |     await this.page.waitForTimeout(500);
  168 |   }
  169 | 
  170 |   /**
  171 |    * 断言表单有错误
  172 |    */
  173 |   async assertHasError(): Promise<void> {
  174 |     // 提交按钮应该还在页面上（表单未提交成功）
  175 |     await expect(this.submitButton).toBeVisible();
  176 |   }
  177 | }
  178 | 
```