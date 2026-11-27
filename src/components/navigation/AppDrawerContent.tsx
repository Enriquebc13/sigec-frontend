import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useRef } from 'react';
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
  /** Número a mostrar junto a cada opción (clave = nombre de la ruta). */
  counts?: Record<string, number | undefined>;
  /** Se llama cada vez que se abre el menú, para refrescar los números. */
  onOpen?: () => void;
};

const ACTIVE_COLOR = '#fff';
const INACTIVE_COLOR = '#bbb';

export function AppDrawerContent({
  state,
  descriptors,
  navigation,
  logo = require('../../../assets/images/Logo SIGEC_.png'),
  counts,
  onOpen,
}: AppDrawerContentProps) {
  const insets = useSafeAreaInsets();

  // Al abrir el menú se piden de nuevo los números (así no se ven viejos)
  const isOpen =
    state.history?.some((h) => h.type === 'drawer' && h.status === 'open') ?? false;

  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  });
  useEffect(() => {
    if (isOpen) onOpenRef.current?.();
  }, [isOpen]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={styles.imageContainer}>
        <Image source={logo} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>S I G E C</Text>
      </View>


      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const icono = options.drawerIcon;

          if ((options.drawerItemStyle as any)?.display === 'none') return null;

          const focused = state.index === index;
          const label =
            typeof options.drawerLabel === 'string'
              ? options.drawerLabel
              : options.title ?? route.name;

          const count = counts?.[route.name];

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, focused && styles.itemActive]}
              accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
            >
              {icono && (
                <View style={styles.icon}>
                  {icono({
                    focused,
                    color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
                    size: 22,
                  })}
                </View>
              )}
              <Text
                style={[styles.label, { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {label}
              </Text>
              {count !== undefined && (
                <View style={[styles.badge, focused && styles.badgeActive]}>
                  <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
                </View>
              )}
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
  flexDirection: "row",
  alignItems: "center",
  marginHorizontal: 10,
  marginVertical: 2,
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderRadius: 8,
},
  title: {
    color: "#ffff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10
  },
  itemActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, },
  label: { flex: 1, fontSize: 20, fontWeight: 'bold', paddingVertical: 10, paddingHorizontal: 6 },
  badge: {
    minWidth: 30,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.35)',
  },
  badgeActive: { backgroundColor: 'rgba(139,92,246,0.85)' },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  icon: {
  width: 35,
  alignItems: "center",
  justifyContent: "center",
},
});