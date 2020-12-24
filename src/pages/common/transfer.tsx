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
  Dimensions,
  StyleSheet
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SafeAreaView from 'react-native-safe-area-view';
import { StackNavigationProp } from '@react-navigation/stack';

import { CustomButton } from 'app/components/custom-button';
import {
  TransferAccount,
  TransferToken,
  TransferAmount,
  TransferRecipient
} from 'app/components/transfer';
import { ConfirmPopup } from 'app/components/modals';
import { LoadSVG } from 'app/components/load-svg';

import { theme } from 'app/styles';
import i18n from 'app/lib/i18n';
import { keystore } from 'app/keystore';
import { RootParamList } from 'app/navigator';
import { RouteProp } from '@react-navigation/native';
import { CommonStackParamList } from 'app/navigator/common';
import { toQA } from 'app/filters';
import { Transaction } from 'app/lib/controller';
import { TOKEN_ICONS } from 'app/config';
import { fromBech32Address } from 'app/utils';

type Prop = {
  navigation: StackNavigationProp<RootParamList>;
  route: RouteProp<CommonStackParamList, 'Transfer'>;
};

const { width } = Dimensions.get('window');
export const TransferPage: React.FC<Prop> = ({ navigation, route }) => {
  const accountState = keystore.account.store.useValue();
  const contactsState = keystore.contacts.store.useValue();
  const tokensState = keystore.token.store.useValue();
  const networkState = keystore.network.store.useValue();
  const gasState = keystore.gas.store.useValue();

  const [confirmModal, setConfirmModal] = React.useState(false);
  const [confirmError, setConfirmError] = React.useState<string>();
  const [selectedToken, setSelectedToken] = React.useState(0);
  const [selectedAccount, setSelectedAccount] = React.useState(accountState.selectedAddress);
  const [amount, setAmount] = React.useState('0');
  const [tx, setTx] = React.useState<Transaction>();
  const [recipient, setRecipient] = React.useState<string>(
    (route.params && route.params.recipient) || ''
  );

  const token = React.useMemo(
    () => tokensState[selectedToken],
    [selectedToken, tokensState]
  );
  const account = React.useMemo(
    () => accountState.identities[selectedAccount],
    [accountState, selectedAccount]
  );

  const handleSiging = React.useCallback(async(transaction: Transaction, cb) => {
    setConfirmError(undefined);
    try {
      await keystore.account.updateNonce(selectedAccount);
      const chainID = await keystore.zilliqa.getNetworkId();
      const keyPair = await keystore.getkeyPairs(account);

      transaction.setVersion(chainID);
      transaction.nonce = account.nonce + 1;
      transaction.sign(keyPair.privateKey);
      transaction.hash = await keystore.zilliqa.send(transaction);

      await keystore.account.increaseNonce(selectedAccount);
      await keystore.transaction.add(transaction);

      cb();
      setConfirmModal(false);
    } catch (err) {
      cb();
      setConfirmError(err.message);
    }
  }, [
    selectedAccount,
    account
  ]);

  React.useEffect(() => {
    try {
      const toAddr = fromBech32Address(recipient);
      const qa = toQA(amount, token.decimals);

      setTx(new Transaction(
        qa,
        gasState,
        account,
        toAddr
      ));
    } catch (err) {
      //
    }
  }, [
    setTx,
    token,
    account,
    amount,
    selectedAccount,
    recipient,
    gasState
  ]);

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView>
          <View style={styles.wrapper}>
            <TransferAccount
              accounts={accountState.identities}
              selected={selectedAccount}
              onSelect={setSelectedAccount}
            />
            <TransferToken
              account={accountState.identities[selectedAccount]}
              tokens={tokensState}
              selected={selectedToken}
              netwrok={networkState.selected}
              onSelect={setSelectedToken}
            />
          </View>
          <TransferRecipient
            style={{ ...styles.wrapper, marginTop: 30 }}
            accounts={accountState.identities}
            recipient={recipient}
            contacts={contactsState}
            onSelect={setRecipient}
          />
          <TransferAmount
            style={styles.wrapper}
            account={accountState.identities[selectedAccount]}
            token={token}
            gas={gasState}
            netwrok={networkState.selected}
            value={amount}
            onChange={setAmount}
          />
          <View style={{
            width: '100%',
            alignItems: 'center',
            marginTop: '10%'
          }}>
            <CustomButton
              disabled={!tx}
              style={{ width: width / 1.5 }}
              title={i18n.t('restore_btn')}
              onPress={() => setConfirmModal(true)}
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
      {tx ? (
        <ConfirmPopup
          transaction={tx}
          error={confirmError}
          decimals={token.decimals}
          account={account}
          title={i18n.t('confirm')}
          visible={confirmModal}
          onTriggered={() => setConfirmModal(false)}
          onConfirm={handleSiging}
        >
          <LoadSVG
            url={`${TOKEN_ICONS}/${token.symbol}.svg`}
            height="30"
            width="30"
          />
        </ConfirmPopup>
      ) : null}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black
  },
  wrapper: {
    backgroundColor: theme.colors.gray
  }
});
