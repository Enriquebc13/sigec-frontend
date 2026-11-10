import { GradientScreen } from "@/components/ui/GradientScreen";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    UIManager,
    View
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ====== COLOCA AQUÍ TUS IP ======
const LOCAL_URL = process.env.EXPO_PUBLIC_SIGEC_LOCAL_URL ?? "";
const PUBLIC_URL = process.env.EXPO_PUBLIC_SIGEC_PUBLIC_URL ?? "";
// =================================

const LOCAL_TIMEOUT_MS = 2000;

const FAQS = [
  {
    question: "¿Cómo solicitar un local, oficina o bodega?",
    answer:
      "Explora los espacios disponibles en SIGEC, selecciona el que sea de tu interés y utiliza la opción para realizar una solicitud. Completa la información solicitada y envíala para su revisión.",
  },
  {
    question: "¿Qué sucede después de enviar tu solicitud?",
    answer:
      "Una vez enviada, tu solicitud será registrada en el sistema para que el administrador pueda revisarla. Podrás consultar su estado desde el apartado de solicitudes de tu cuenta.",
  },
  {
    question: "¿Qué significa que tu solicitud esté pendiente?",
    answer:
      "Significa que tu solicitud fue recibida y todavía está en proceso de revisión. Deberás esperar a que el administrador actualice su estado.",
  },
];

// Intenta la IP local; si no responde a tiempo, usa la pública.
async function isReachable(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(url, { method: "HEAD", signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
// Agrega aquí tus capturas de la web (en assets/images)
const WEB_IMAGES = [
  require("@/assets/carrusel/sigec_web.png"),
  require("@/assets/carrusel/sigec_web_2.png"),
  require("@/assets/carrusel/sigec_web_3.png"),
  require("@/assets/carrusel/sigec_web_4.png"),
];

function ImageCarousel() {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  return (
    <View
      style={styles.carousel}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <FlatList
          data={WEB_IMAGES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item }) => (
            <Image
              source={item}
              style={{ width, height: 170, borderRadius: 12 }}
              resizeMode="cover"
            />
          )}
        />
      )}
      <View style={styles.dots}>
        {WEB_IMAGES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}
function FaqItem({
  question,
  answer,
  open,
  onPress,
}: {
  question: string;
  answer: string;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.faqItem}>
      <Pressable style={styles.faqHeader} onPress={onPress}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#D1C4E9"
        />
      </Pressable>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </View>
  );
}


export default function ClientInformationView() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [opening, setOpening] = useState(false);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const openSigecWeb = async () => {
    setOpening(true);
    try {
      const local = await isReachable(LOCAL_URL, LOCAL_TIMEOUT_MS);
      const target = local ? LOCAL_URL : PUBLIC_URL;
      try {
        await Linking.openURL(target);
      } catch {
        // Si falla la elegida, probamos con la otra
        await Linking.openURL(local ? PUBLIC_URL : LOCAL_URL);
      }
    } catch {
      Alert.alert("Error", "No se pudo abrir SIGEC Web. Inténtalo más tarde.");
    } finally {
      setOpening(false);
    }
  };

  return (
    <GradientScreen>
      {/* 1. Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="information-circle" size={32} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Información de SIGEC</Text>
      </View>

      {/* 2. Tarjeta de bienvenida */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>¿Qué es SIGEC?</Text>
        <Text style={styles.cardText}>
          SIGEC (Sistema Integral de Gestión de Espacios Comerciales) es una
          plataforma diseñada para facilitar la consulta y gestión de espacios
          comerciales, como locales, oficinas y bodegas.
        </Text>
        <Text style={[styles.cardText, { marginTop: 10 }]}>
          Nuestro objetivo es ayudarte a encontrar un espacio adecuado para tu
          negocio, permitiéndote conocer las opciones disponibles y realizar
          solicitudes de manera sencilla.
        </Text>
      </View>

      {/* 3. Tarjeta promocional */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>¡Descubre SIGEC desde nuestra versión web!</Text>
     <ImageCarousel />
        <Text style={styles.cardText}>
          Visita nuestra plataforma desde tu computadora y conoce los espacios
          comerciales disponibles. Disfruta de una experiencia más amplia y
          cómoda para explorar las opciones que tenemos para ti.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          onPress={openSigecWeb}
          disabled={opening}
        >
          {opening ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="globe-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Visitar SIGEC Web</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* 4. Preguntas frecuentes */}
      <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
      {FAQS.map((faq, i) => (
        <FaqItem
          key={faq.question}
          question={faq.question}
          answer={faq.answer}
          open={openIndex === i}
          onPress={() => toggleFaq(i)}
        />
      ))}
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  cardText: {
    color: "#D1C4E9",
    fontSize: 15,
    lineHeight: 22,
  },
  promoImage: {
    width: "100%",
    height: 170,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#7E57C2",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 4,
  },
  faqItem: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  faqAnswer: {
    color: "#D1C4E9",
    fontSize: 14,
    lineHeight: 21,
    paddingBottom: 14,
  },
  carousel: {
  marginBottom: 12,
},
dots: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 6,
  marginTop: 10,
},
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "rgba(255,255,255,0.3)",
},
dotActive: {
  backgroundColor: "#fff",
  width: 20,
},
});