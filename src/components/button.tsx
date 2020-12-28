/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2020 ZilPay
 */
import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity
} from 'react-native';

type Prop = {
  color: string;
  title: string;
  disabled: boolean;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
};

export const Button: React.FC<Prop> = ({
  style,
  title,
  disabled,
  color,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={[style, {
        opacity: disabled ? 0.2 : 1
      }]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.title, {
        color
      }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15
  },
  title: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 22
  }
});
