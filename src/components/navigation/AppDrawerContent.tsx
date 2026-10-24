import { Drawer } from 'expo-router/drawer';
import React from 'react';
import {
    Image,
    ImageSourcePropType,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BaseDrawerContentProps = Parameters<
  NonNullable<React.ComponentProps<typeof Drawer>['drawerContent']>
>[0];

export type AppDrawerContentProps = BaseDrawerContentProps & {
  logo?: ImageSourcePropType;
};

const ACTIVE_COLOR = '#fff';
const INACTIVE_COLOR = '#bbb';

export function AppDrawerContent({
  state,
  descriptors,
  navigation,
  logo = require('../../../assets/images/Logo SIGEC_.png'),
}: AppDrawerContentProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={styles.imageContainer}>
        <Image source={logo} style={styles.image} resizeMode="contain" />
         <Text style={styles.title}>S I G E C</Text>
      </View>
     

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          if ((options.drawerItemStyle as any)?.display === 'none') return null;

          const focused = state.index === index;
          const label =
            typeof options.drawerLabel === 'string'
              ? options.drawerLabel
              : options.title ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, focused && styles.itemActive]}
            >
              <Text
                style={[styles.label, { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  image: { width: 150, height: 150 },
  item: {
    marginHorizontal: 10,
    marginVertical: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  title: {
    color:"#ffff",
    fontSize:20,
    fontWeight:"bold",
    marginTop:10
  },
  itemActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, },
  label: { fontSize: 20, fontWeight: 'bold', padding: 10 },
});