/**
 * Money 工具类测试
 */
import {
  fromYuan,
  toYuan,
  add,
  subtract,
  multiply,
  divide,
  format,
  parse,
  compare,
  abs,
  negate,
  SCALE,
} from '../../src/utils/Money';

describe('Money', () => {
  describe('fromYuan', () => {
    it('should convert yuan to cents', () => {
      expect(fromYuan(1)).toBe(100);
      expect(fromYuan(0.5)).toBe(50);
      expect(fromYuan(0.01)).toBe(1);
    });

    it('should handle large numbers', () => {
      expect(fromYuan(10000)).toBe(1000000);
    });

    it('should round correctly', () => {
      expect(fromYuan(0.005)).toBe(1); // 四舍五入
      expect(fromYuan(0.004)).toBe(0);
    });

    it('should handle zero', () => {
      expect(fromYuan(0)).toBe(0);
    });

    it('should throw on invalid input', () => {
      expect(() => fromYuan(Infinity)).toThrow();
      expect(() => fromYuan(NaN)).toThrow();
    });
  });

  describe('toYuan', () => {
    it('should convert cents to yuan', () => {
      expect(toYuan(100)).toBe(1);
      expect(toYuan(50)).toBe(0.5);
      expect(toYuan(1)).toBe(0.01);
    });

    it('should handle large numbers', () => {
      expect(toYuan(1000000)).toBe(10000);
    });

    it('should handle zero', () => {
      expect(toYuan(0)).toBe(0);
    });

    it('should throw on invalid input', () => {
      expect(() => toYuan(Infinity)).toThrow();
      expect(() => toYuan(NaN)).toThrow();
    });
  });

  describe('add', () => {
    it('should add two amounts', () => {
      expect(add(100, 200)).toBe(300);
      expect(add(0, 100)).toBe(100);
      expect(add(-100, 200)).toBe(100);
    });

    it('should throw on invalid input', () => {
      expect(() => add(Infinity, 100)).toThrow();
      expect(() => add(100, NaN)).toThrow();
    });
  });

  describe('subtract', () => {
    it('should subtract two amounts', () => {
      expect(subtract(300, 200)).toBe(100);
      expect(subtract(100, 100)).toBe(0);
      expect(subtract(100, 200)).toBe(-100);
    });

    it('should throw on invalid input', () => {
      expect(() => subtract(Infinity, 100)).toThrow();
      expect(() => subtract(100, NaN)).toThrow();
    });
  });

  describe('multiply', () => {
    it('should multiply amount', () => {
      expect(multiply(100, 2)).toBe(200);
      expect(multiply(100, 0.5)).toBe(50);
      expect(multiply(100, 0)).toBe(0);
    });

    it('should round result', () => {
      expect(multiply(100, 0.333)).toBe(33); // 33.3 -> 33
      expect(multiply(100, 0.335)).toBe(34); // 33.5 -> 34
    });

    it('should throw on invalid input', () => {
      expect(() => multiply(Infinity, 2)).toThrow();
      expect(() => multiply(100, NaN)).toThrow();
    });
  });

  describe('divide', () => {
    it('should divide amount', () => {
      expect(divide(100, 2)).toBe(50);
      expect(divide(100, 4)).toBe(25);
      expect(divide(100, 3)).toBe(33); // 四舍五入
    });

    it('should throw on division by zero', () => {
      expect(() => divide(100, 0)).toThrow('Division by zero');
    });

    it('should throw on invalid input', () => {
      expect(() => divide(Infinity, 2)).toThrow();
      expect(() => divide(100, NaN)).toThrow();
    });
  });

  describe('format', () => {
    it('should format amount with symbol', () => {
      expect(format(0)).toBe('¥0.00');
      expect(format(100)).toBe('¥1.00');
      expect(format(3550)).toBe('¥35.50');
      expect(format(1000000)).toBe('¥10000.00');
    });

    it('should format amount without symbol', () => {
      expect(format(100, false)).toBe('1.00');
      expect(format(3550, false)).toBe('35.50');
    });

    it('should throw on invalid input', () => {
      expect(() => format(Infinity)).toThrow();
    });
  });

  describe('parse', () => {
    it('should parse amount string', () => {
      expect(parse('0')).toBe(0);
      expect(parse('1')).toBe(100);
      expect(parse('35.50')).toBe(3550);
      expect(parse('0.01')).toBe(1);
    });

    it('should handle large numbers', () => {
      expect(parse('10000')).toBe(1000000);
    });

    it('should handle whitespace', () => {
      expect(parse('  100  ')).toBe(10000);
      expect(parse('\n35.50\n')).toBe(3550);
    });

    it('should throw on invalid input', () => {
      expect(() => parse('abc')).toThrow();
      expect(() => parse('')).toThrow();
      expect(() => parse('   ')).toThrow();
    });
  });

  describe('compare', () => {
    it('should compare amounts', () => {
      expect(compare(100, 200)).toBe(-1);
      expect(compare(200, 100)).toBe(1);
      expect(compare(100, 100)).toBe(0);
    });

    it('should throw on invalid input', () => {
      expect(() => compare(Infinity, 100)).toThrow();
      expect(() => compare(100, NaN)).toThrow();
    });
  });

  describe('abs', () => {
    it('should return absolute value', () => {
      expect(abs(100)).toBe(100);
      expect(abs(-100)).toBe(100);
      expect(abs(0)).toBe(0);
    });

    it('should throw on invalid input', () => {
      expect(() => abs(Infinity)).toThrow();
    });
  });

  describe('negate', () => {
    it('should return negated value', () => {
      expect(negate(100)).toBe(-100);
      expect(negate(-100)).toBe(100);
      expect(negate(0)).toBe(0);
    });

    it('should throw on invalid input', () => {
      expect(() => negate(Infinity)).toThrow();
    });
  });

  describe('precision', () => {
    it('should maintain 0.01 yuan precision', () => {
      // 0.01 元 = 1分
      expect(fromYuan(0.01)).toBe(1);
      expect(toYuan(1)).toBe(0.01);

      // 多次计算后保持精度
      const amount = fromYuan(0.01);
      const result = add(amount, amount);
      expect(result).toBe(2); // 2分
      expect(toYuan(result)).toBe(0.02);

      // 浮点数精度问题演示
      // 0.1 + 0.2 在浮点数中不等于 0.3
      // 但使用我们的工具类可以正确处理
      const a = fromYuan(0.1); // 10
      const b = fromYuan(0.2); // 20
      expect(add(a, b)).toBe(30); // 而不是 29.999...
    });
  });

  describe('edge cases', () => {
    it('should handle very small amounts', () => {
      expect(fromYuan(0.001)).toBe(0); // 小于0.005舍去
      expect(fromYuan(0.005)).toBe(1); // 四舍五入
    });

    it('should handle very large amounts', () => {
      const largeYuan = 999999999.99;
      const cents = fromYuan(largeYuan);
      expect(cents).toBe(99999999999);
      expect(toYuan(cents)).toBe(largeYuan);
    });

    it('should handle negative amounts', () => {
      expect(fromYuan(-1)).toBe(-100);
      expect(toYuan(-100)).toBe(-1);
      expect(add(-100, -200)).toBe(-300);
    });
  });
});