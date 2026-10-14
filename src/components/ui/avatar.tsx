import { Image, ImageSourcePropType, StyleSheet } from "react-native";

interface Props {
  url?: string;
  image?: ImageSourcePropType;
  size?: number;
  margin?: number;
}

export function Avatar({
  url,
  image,
  size = 200,
  margin = 40,
}: Props) {
  const imageSource = image ?? (url ? { uri: url } : undefined);

  return (
    <Image
      source={imageSource ?? require("@/assets/images/Unknown_person.jpg")}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginTop: margin,
        },
      ]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 3,
    borderColor: "white",
  },
});

