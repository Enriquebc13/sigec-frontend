import AntDesign from "@expo/vector-icons/AntDesign";
import { useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PropertyImage } from "../../../domain/entities/property.entity";

type Props = {
  images: PropertyImage[];
  /** Imagen con la que se abre el visor. */
  startIndex: number;
  onClose: () => void;
};

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

type ZoomableImageProps = {
  uri: string;
  width: number;
  height: number;
  zoomed: boolean;
  onZoomChange: (zoomed: boolean) => void;
};

/** Imagen con zoom: dos dedos o doble toque; ampliada se arrastra con uno. */
function ZoomableImage({
  uri,
  width,
  height,
  zoomed,
  onZoomChange,
}: ZoomableImageProps) {
  // "saved" guarda el valor final del gesto anterior
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      runOnJS(onZoomChange)(true);
    })
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, 1, MAX_SCALE);
    })
    .onEnd(() => {
      const next = scale.value < 1.05 ? 1 : scale.value;
      // Evita que la imagen quede fuera de la pantalla al reducirla
      const maxX = (width * (next - 1)) / 2;
      const maxY = (height * (next - 1)) / 2;
      savedX.value = clamp(x.value, -maxX, maxX);
      savedY.value = clamp(y.value, -maxY, maxY);
      savedScale.value = next;
      x.value = withTiming(savedX.value);
      y.value = withTiming(savedY.value);
      scale.value = withTiming(next);
      runOnJS(onZoomChange)(next > 1);
    });

  // Solo se activa con zoom, para no estorbar al deslizar entre imágenes
  const pan = Gesture.Pan()
    .enabled(zoomed)
    .maxPointers(1)
    .onStart(() => {
      savedX.value = x.value;
      savedY.value = y.value;
    })
    .onUpdate((event) => {
      const maxX = (width * (scale.value - 1)) / 2;
      const maxY = (height * (scale.value - 1)) / 2;
      x.value = clamp(savedX.value + event.translationX, -maxX, maxX);
      y.value = clamp(savedY.value + event.translationY, -maxY, maxY);
    })
    .onEnd(() => {
      savedX.value = x.value;
      savedY.value = y.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (!success) return;
      const next = savedScale.value > 1 ? 1 : DOUBLE_TAP_SCALE;
      savedScale.value = next;
      savedX.value = 0;
      savedY.value = 0;
      scale.value = withTiming(next);
      x.value = withTiming(0);
      y.value = withTiming(0);
      runOnJS(onZoomChange)(next > 1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
      <Animated.View style={[styles.page, { width, height }]}>
        <Animated.Image
          source={{ uri }}
          style={[{ width, height }, animatedStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function ImageViewerModal({ images, startIndex, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<PropertyImage>>(null);
  const [index, setIndex] = useState(startIndex);
  // Con zoom se bloquea el cambio de imagen
  const [zoomed, setZoomed] = useState(false);

  const goTo = (next: number) => {
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const hasPrevious = index > 0;
  const hasNext = index < images.length - 1;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose} // botón "atrás" de Android
    >
      {/* Necesario para que los gestos funcionen dentro de un Modal */}
      <GestureHandlerRootView style={styles.backdrop}>
        {/* Se pasa de imagen deslizando el dedo */}
        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={(image) => image.id}
          horizontal
          pagingEnabled
          scrollEnabled={!zoomed}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, i) => ({
            length: width,
            offset: width * i,
            index: i,
          })}
          scrollEventThrottle={16}
          onScroll={(event) => {
            const current = Math.round(
              event.nativeEvent.contentOffset.x / width,
            );
            setIndex(Math.min(Math.max(current, 0), images.length - 1));
          }}
          renderItem={({ item }) => (
            <ZoomableImage
              uri={item.url}
              width={width}
              height={height}
              zoomed={zoomed}
              onZoomChange={setZoomed}
            />
          )}
        />

        {/* Contador y botón de cerrar */}
        <View style={[styles.topBar, { top: insets.top + 12 }]}>
          <Text style={styles.counter}>
            {index + 1} / {images.length}
          </Text>
          <Pressable
            style={styles.roundButton}
            onPress={onClose}
            accessibilityLabel="Cerrar"
          >
            <AntDesign name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Flechas: anterior y siguiente */}
        {images.length > 1 && !zoomed && (
          <View style={[styles.bottomBar, { bottom: insets.bottom + 20 }]}>
            <Pressable
              style={[styles.roundButton, !hasPrevious && styles.disabled]}
              onPress={() => goTo(index - 1)}
              disabled={!hasPrevious}
              accessibilityLabel="Imagen anterior"
            >
              <AntDesign name="left" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.roundButton, !hasNext && styles.disabled]}
              onPress={() => goTo(index + 1)}
              disabled={!hasNext}
              accessibilityLabel="Imagen siguiente"
            >
              <AntDesign name="right" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.96)" },
  topBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  page: { overflow: "hidden" },
  counter: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  bottomBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(94,53,177,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.3 },
});