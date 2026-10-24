export const drawerScreenOptions = (headerColor = '#5E35B1') => ({
  headerShown: true,
  drawerType: 'front' as const,
  headerStyle: { backgroundColor: headerColor },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const },
  drawerStyle: { backgroundColor: 'rgba(0,0,10,0.8)', width: 280 },
});