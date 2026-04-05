/**
 * 账目表单验证 Schema
 */
import { z } from 'zod';

export const entryFormSchema = z.object({
  amount: z
    .number({ required_error: '请输入金额' })
    .positive('金额必须大于0')
    .max(1000000, '金额不能超过100万元'),
  type: z.enum(['income', 'expense'], {
    required_error: '请选择类型',
  }),
  description: z
    .string({ required_error: '请输入描述' })
    .min(1, '描述不能为空')
    .max(500, '描述最多500个字符'),
  date: z
    .string({ required_error: '请选择日期' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式无效'),
});

export type EntryFormData = z.infer<typeof entryFormSchema>;
