/**
 * 拨号盘式金额输入组件
 *
 * 核心理念：通过缓冲区机制，避免直接修改真正的值
 * - 点击输入框弹出拨号盘
 * - 缓冲区显示当前金额（新建默认为 0）
 * - 按数字键修改缓冲区
 * - 点击确认后才将缓冲区的值写入真正的表单
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { TextInput as PaperInput, useTheme } from 'react-native-paper';

interface AmountDialPadInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

const MAX_AMOUNT = 999999.99;

export default function AmountDialPadInput({
  value,
  onChange,
  label = '金额（元）',
  disabled = false,
  error = false,
  testID = 'amount-input',
  accessibilityLabel = '金额输入',
}: AmountDialPadInputProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [buffer, setBuffer] = useState('0');

  // 格式化显示金额
  const formatDisplay = (val: number | undefined): string => {
    if (val === undefined || val === 0) return '';
    return String(val);
  };

  // 格式化缓冲区显示（带 ¥ 符号）
  const formatBufferDisplay = (buf: string): string => {
    const num = parseFloat(buf);
    if (isNaN(num)) return '¥0.00';
    return `¥${num.toFixed(2)}`;
  };

  // 打开拨号盘时初始化缓冲区
  const handleOpen = useCallback(() => {
    if (disabled) return;
    const initialBuffer = value !== undefined ? String(value) : '0';
    setBuffer(initialBuffer);
    setIsOpen(true);
  }, [value, disabled]);

  // 关闭拨号盘
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 输入数字
  const handleDigit = useCallback((digit: string) => {
    setBuffer((prev) => {
      // 防止多个小数点
      if (digit === '.' && prev.includes('.')) return prev;

      // 限制小数点后2位
      const parts = prev.split('.');
      if (parts.length === 2 && parts[1].length >= 2 && digit !== '.') return prev;

      // 限制最大长度（不包括小数点）
      const digitsOnly = prev.replace('.', '');
      if (digitsOnly.length >= 9 && digit !== '.') return prev;

      // 处理前导零
      if (prev === '0' && digit !== '.') return digit;

      const newBuffer = prev + digit;

      // 检查是否超过最大金额
      const num = parseFloat(newBuffer);
      if (!isNaN(num) && num > MAX_AMOUNT) return prev;

      return newBuffer;
    });
  }, []);

  // 退格删除
  const handleBackspace = useCallback(() => {
    setBuffer((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }, []);

  // 清空
  const handleClear = useCallback(() => {
    setBuffer('0');
  }, []);

  // 确认 - 将缓冲区值传出
  const handleConfirm = useCallback(() => {
    const num = parseFloat(buffer);
    onChange(isNaN(num) ? 0 : num);
    setIsOpen(false);
  }, [buffer, onChange]);

  // 渲染拨号盘按钮
  const DialButton = ({
    label,
    onPress,
    style,
    textStyle,
    testID: btnTestID,
  }: {
    label: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
    testID?: string;
  }) => (
    <TouchableOpacity
      style={[styles.dialButton, style]}
      onPress={onPress}
      testID={btnTestID}
    >
      <Text style={[styles.dialButtonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      {/* 输入框显示区域 - 点击打开拨号盘 */}
      <Pressable onPress={handleOpen} testID={testID}>
        <PaperInput
          label={label}
          value={formatDisplay(value)}
          editable={false}
          disabled={disabled}
          error={error}
          mode="outlined"
          left={<PaperInput.Affix text="¥" />}
          accessibilityLabel={accessibilityLabel}
          style={styles.input}
        />
      </Pressable>

      {/* 拨号盘弹窗 */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={handleClose} />

          <View style={styles.dialPadContainer}>
            {/* 显示区 - 缓冲区金额 */}
            <View style={styles.displayArea}>
              <Text style={styles.displayLabel}>金额</Text>
              <Text style={styles.displayAmount}>{formatBufferDisplay(buffer)}</Text>
            </View>

            {/* 拨号盘网格 */}
            <View style={styles.dialPad}>
              {/* 第一行：1 2 3 */}
              <View style={styles.dialRow}>
                <DialButton
                  label="1"
                  testID="dial-1"
                  onPress={() => handleDigit('1')}
                />
                <DialButton
                  label="2"
                  testID="dial-2"
                  onPress={() => handleDigit('2')}
                />
                <DialButton
                  label="3"
                  testID="dial-3"
                  onPress={() => handleDigit('3')}
                />
              </View>

              {/* 第二行：4 5 6 */}
              <View style={styles.dialRow}>
                <DialButton
                  label="4"
                  testID="dial-4"
                  onPress={() => handleDigit('4')}
                />
                <DialButton
                  label="5"
                  testID="dial-5"
                  onPress={() => handleDigit('5')}
                />
                <DialButton
                  label="6"
                  testID="dial-6"
                  onPress={() => handleDigit('6')}
                />
              </View>

              {/* 第三行：7 8 9 */}
              <View style={styles.dialRow}>
                <DialButton
                  label="7"
                  testID="dial-7"
                  onPress={() => handleDigit('7')}
                />
                <DialButton
                  label="8"
                  testID="dial-8"
                  onPress={() => handleDigit('8')}
                />
                <DialButton
                  label="9"
                  testID="dial-9"
                  onPress={() => handleDigit('9')}
                />
              </View>

              {/* 第四行：. 0 ⌫ */}
              <View style={styles.dialRow}>
                <DialButton
                  label="."
                  testID="dial-dot"
                  onPress={() => handleDigit('.')}
                />
                <DialButton
                  label="0"
                  testID="dial-0"
                  onPress={() => handleDigit('0')}
                />
                <DialButton
                  label="⌫"
                  testID="dial-backspace"
                  onPress={handleBackspace}
                  textStyle={styles.backspaceText}
                />
              </View>

              {/* 第五行：C 取消 确认 */}
              <View style={styles.dialRow}>
                <DialButton
                  label="C"
                  testID="dial-clear"
                  onPress={handleClear}
                  textStyle={styles.clearText}
                />
                <DialButton
                  label="取消"
                  testID="dial-cancel"
                  onPress={handleClose}
                  textStyle={styles.cancelText}
                />
                <DialButton
                  label="确认"
                  testID="dial-confirm"
                  onPress={handleConfirm}
                  style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                  textStyle={styles.confirmText}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  dialPadContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  displayArea: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  displayLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  displayAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  dialPad: {
    padding: 16,
  },
  dialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dialButton: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  backspaceText: {
    fontSize: 20,
    color: '#666',
  },
  clearText: {
    color: '#F44336',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#6200ee',
  },
  confirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
