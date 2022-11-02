import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import ColorPicker from 'react-native-wheel-color-picker'
import { View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
  Canvas,
  Circle,
  Path,
  Skia,
  ImageSVG,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface IPath {
  segments: String[];
  color?: string;
}

interface ICircle {
  x: number;
  y: number;
}
interface IStamp {
  x: number;
  y: number;
  color: string;
}

enum Tools {
  Pencil,
  Stamp,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#55FBDD',
  },
  icon: {
    fontSize: 40,
    textAlign: 'center',
  },
  paletteColor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginVertical: 5,
    zIndex: 2,
  },
  colorOptions: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: 'black',
    marginVertical: 5,
    zIndex: 1,
  },
  menuBoardContainer: {
    borderRadius: 10,
    backgroundColor: '#45B9A4',
    flexDirection: 'row',
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default function App() {
  const { width, height } = Dimensions.get('window');

  const paletteColors = ['red', 'green', 'blue', 'yellow'];

  const svgStar =
    '<svg class="star-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/2000/xlink" viewBox="0 0 200 200"><polygon id="star" fill="{{fillColor}}" points="100,0,129.38926261462365,59.54915028125263,195.10565162951536,69.09830056250526,147.55282581475768,115.45084971874736,158.77852522924732,180.90169943749473,100,150,41.2214747707527,180.90169943749476,52.447174185242325,115.45084971874738,4.894348370484636,69.09830056250527,70.61073738537632,59.549150281252636"></polygon></svg>';

  const ref = useRef()
  const [activePaletteColorIndex, setActivePaletteColorIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<Tools>(Tools.Pencil);
  const [paths, setPaths] = useState<IPath[]>([]);
  const [circles, setCircles] = useState<ICircle[]>([]);
  const [stamps, setStamps] = useState<IStamp[]>([]);

  // Quando o Reanimated for instalado, o Gesture Handler tentará ser executado no thread da interface do usuário
  // Não podemos fazer isso aqui porque estamos acessando o estado do componente, então precisamos definir runOnJS(true)

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(({ x, y }) => {
      if (activeTool === Tools.Pencil) {
        const newPaths = [...paths];
        newPaths[paths.length] = {
          segments: [],
          color: paletteColors[activePaletteColorIndex],
        };
        newPaths[paths.length].segments.push(`M ${x} ${y}`);
        setPaths(newPaths);
      }
    })
    .onUpdate(({ x, y }) => {
      if (activeTool === Tools.Pencil) {
        const index = paths.length - 1;
        const newPaths = [...paths];
        if (newPaths?.[index]?.segments) {
          newPaths[index].segments.push(`L ${x} ${y}`);
          setPaths(newPaths);
        }
      }
    })
    .onTouchesUp(() => {
      if (activeTool === Tools.Pencil) {
        const newPaths = [...paths];
        setPaths(newPaths);
      }
    })
    .minDistance(1);

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onStart(({ x, y }) => {
      if (activeTool === Tools.Stamp) {
        setStamps([
          ...stamps,
          {
            x: x - 25,
            y: y - 25,
            color: paletteColors[activePaletteColorIndex],
          },
        ]);
      }
    });

  const clearCanvas = () => {
    setPaths([]);
    setCircles([]);
    setStamps([]);
  };

  const paletteVisible = useSharedValue(false);
  const animatedPaletteStyle = useAnimatedStyle(() => {
    return {
      top: withSpring(paletteVisible.value ? -275 : -100),
      height: withTiming(paletteVisible.value ? 200 : 50),
      opacity: withTiming(paletteVisible.value ? 100 : 0, { duration: 100 }),
    };
  });

  const animatedSwatchStyle = useAnimatedStyle(() => {
    return {
      top: withSpring(paletteVisible.value ? -50 : 0),
      height: paletteVisible.value ? 0 : 50,
      opacity: withTiming(paletteVisible.value ? 0 : 100, { duration: 100 }),
    };
  });

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <GestureHandlerRootView>
          <View
            style={{
              height: height * 0.5,
              width: width * 0.95,
              borderRadius: 15,
              backgroundColor: 'white',
            }}
          >
            <GestureDetector gesture={tap}>
              <GestureDetector gesture={pan}>
                <Canvas style={{ flex: 1 }}>
                  {circles.map(({x, y}, index) => (
                    <Circle key={index} cx={x} cy={y} r={10} />
                  ))}
                  {paths.map(({ segments, color}, index) => (
                    <Path
                      key={index}
                      path={segments.join(' ')}
                      strokeWidth={5}
                      style="stroke"
                      color={color}
                    />
                  ))}
                  {stamps.map(({ color, x, y }, index) => {
                    const image = Skia.SVG.MakeFromString(
                      svgStar.replace('{{fillColor}}', color),
                    );

                    if (!image) return null;

                    return (
                      <ImageSVG
                        key={index}
                        width={50}
                        height={50}
                        x={x}
                        y={y}
                        svg={image}
                      />
                    );
                  })}
                </Canvas>
              </GestureDetector>
            </GestureDetector>
          </View>

          <View style={{ display: 'flex', height: height * 0.1, top: 20 }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Animated.View
                style={[
                  { padding: 10, position: 'absolute', width: 60 },
                  animatedPaletteStyle,
                ]}
              >
                {paletteColors.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setActivePaletteColorIndex(i);
                      paletteVisible.value = false;
                    }}
                  >
                    <View
                      style={[
                        {
                          backgroundColor: c,
                        },
                        styles.paletteColor,
                      ]}
                    ></View>
                  </TouchableOpacity>
                ))}
              </Animated.View>

              <View style={styles.menuBoardContainer}>
                <TouchableOpacity
                  onPress={() => {
                    paletteVisible.value !== true
                      ? (paletteVisible.value = true)
                      : (paletteVisible.value = false);
                  }}
                >
                  <Animated.View
                    style={[
                      {
                        backgroundColor: paletteColors[activePaletteColorIndex],
                      },
                      styles.colorOptions,
                      animatedSwatchStyle,
                    ]}
                  />
                </TouchableOpacity>

                <View>
                  {activeTool === Tools.Pencil ? (
                    <TouchableOpacity
                      onPress={() => setActiveTool(Tools.Stamp)}
                    >
                      <FontAwesome5
                        name="pencil-alt"
                        style={styles.icon}
                      ></FontAwesome5>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setActiveTool(Tools.Pencil)}
                    >
                      <FontAwesome5
                        name="stamp"
                        style={styles.icon}
                      ></FontAwesome5>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={clearCanvas}>
                  <Ionicons name="md-trash-outline" style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ColorPicker />
        </GestureHandlerRootView>
      </View>
    </>
  );
}
