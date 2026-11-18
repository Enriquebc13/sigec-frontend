import { PropertyImage } from "@/modules/property/domain/entities/property.entity";
import { useState } from "react";
import {
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export function PropertyImageCarousel({ images }: { images: PropertyImage[] }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  // Por si la cantidad de fotos cambia y el índice queda fuera de rango
  const current = Math.min(index, images.length - 1);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {images.map((image) => (
            <Image
              key={image.id}
              source={{ uri: image.url }}
              style={{ width, height: 160 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {images.length > 1 && (
        <>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {current + 1}/{images.length}
            </Text>
          </View>

          <View style={styles.dots}>
            {images.map((image, i) => (
              <View
                key={image.id}
                style={[styles.dot, i === current && styles.dotActive]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  counter: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  dots: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
});