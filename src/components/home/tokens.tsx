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
  View,
  StyleSheet,
  Text,
  Button,
  Dimensions,
  ScrollView
} from 'react-native';

import I18n from 'app/lib/i18n';
import { theme } from 'app/styles';

import { TokenCard } from 'app/components/token-card';
import { AddToken } from 'app/components/add-token';

import { keystore } from 'app/keystore';

const { width, height } = Dimensions.get('window');
export const HomeTokens: React.FC = () => {
  const tokensState = keystore.token.store.useValue();
  const settingsState = keystore.settings.store.useValue();
  const currencyState = keystore.currency.store.useValue();
  const netwrokState = keystore.network.store.useValue();
  const accountState = keystore.account.store.useValue();

  const tokensList = React.useMemo(
    () => tokensState.identities.filter(
      // Filtering the only selected netwrok tokens.
      (token) => Boolean(token.address[netwrokState.selected] && token.symbol !== 'ZIL')
    ),
    [netwrokState.selected]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {I18n.t('my_tokens')}
        </Text>
        <Button
          title={I18n.t('manage')}
          color={theme.colors.primary}
          onPress={() => null}
        />
      </View>
      <ScrollView>
        <View style={styles.list}>
          {tokensList.map((token, index) => (
            <TokenCard
              key={index}
              account={accountState.identities[accountState.selectedAddress]}
              token={token}
              currency={currencyState}
              net={netwrokState.selected}
              rate={settingsState.rate[currencyState]}
              style={styles.token}
            />
          ))}
          <AddToken style={styles.token}/>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',

    backgroundColor: theme.colors.background,

    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  list: {
    width: width - 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  token: {
    marginTop: 16
  },
  title: {
    color: theme.colors.white,
    fontSize: 20
  }
});
