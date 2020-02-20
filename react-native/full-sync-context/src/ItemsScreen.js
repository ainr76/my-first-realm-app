import React, {
  Component,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {Button, StyleSheet, FlatList} from 'react-native';
import Realm from 'realm';
import {RealmConsumer, RealmProvider, RealmQuery} from 'react-realm-context';
import {v4 as uuid} from 'uuid';

import {ItemView} from './ItemView';
import {AddItemModal} from './AddItemModal.js';

export const ItemsScreen = ({navigation, realm}) => {
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);

  const showAddItemModal = useCallback(() => {
    setAddItemModalVisible(true);
  }, []);

  const hideAddItemModal = useCallback(() => {
    setAddItemModalVisible(false);
  }, []);

  const onItemBodyChange = useCallback(
    (item, body) => {
      realm.write(() => {
        item.body = body;
      });
    },
    [realm],
  );

  const onItemDoneToggle = useCallback(
    item => {
      realm.write(() => {
        item.isDone = !item.isDone;
      });
    },
    [realm],
  );

  const onAddItem = useCallback(
    body => {
      realm.write(() => {
        realm.create('Item', {
          itemId: uuid().toUpperCase(),
          body,
          isDone: false,
          timestamp: new Date(),
        });
      });
      setAddItemModalVisible(false);
    },
    [realm],
  );

  // Setup the button to add items
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Button onPress={showAddItemModal} title="＋" />,
    });
  }, [navigation]);

  return (
    <>
      <RealmQuery type="Item" sort={['timestamp', true]}>
        {({results}) => (
          <FlatList
            style={styles.container}
            renderItem={({item}) => (
              <ItemView
                item={item}
                onBodyChange={onItemBodyChange.bind(null, item)}
                onDoneToggle={onItemDoneToggle.bind(null, item)}
              />
            )}
            data={results}
            keyExtractor={item => item.itemId}
          />
        )}
      </RealmQuery>
      <AddItemModal
        visible={addItemModalVisible}
        onCancel={hideAddItemModal}
        onSave={onAddItem}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
