import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Platform,
  Animated,
  TouchableNativeFeedback,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles/components/HydrationBottle.styles';

// Creamos la versión animada de Rect
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const HydrationBottleCard = ({ hydration, dailyObjective, onAdd }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const ratio = Math.min(hydration / dailyObjective, 1);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    // Animación de llenado
    Animated.timing(fillAnim, {
      toValue: ratio,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const bottleHeight = 200;
  const strokeWidth = 4;
  const innerWidth = 80 - strokeWidth * 2;
  const innerHeight = bottleHeight - strokeWidth * 2;

  // Wrapper para ripple en Android o TouchableOpacity en iOS
  const ButtonWrapper = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

  const handleAddCustomAmount = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      onAdd({ amount, type: 'WATER', description: 'Agua' });
      setCustomAmount('');
    }
  };

  const handleAddPresetAmount = (amount) => {
    onAdd({ amount, type: 'WATER', description: 'Agua' });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Icon name="water-outline" size={24} color="#61dafb" />
        <Text style={styles.title}>Hidratación</Text>
      </View>

      <View style={styles.bottleWrapper}>
        <View style={styles.bottleContainer}>
          <Svg width={80} height={bottleHeight} viewBox={`0 0 80 ${bottleHeight}`}>
            <Defs>
              <ClipPath id="bottleClip">
                <Path
                  d={`
                    M20,0 h40 
                    a10,10 0 0 1 10,10 
                    v160 
                    a20,20 0 0 1 -20,20 
                    h-20 
                    a20,20 0 0 1 -20,-20 
                    v-160 
                    a10,10 0 0 1 10,-10 
                    z
                  `}
                />
              </ClipPath>
              <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#4c6ef5" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#3b5bdb" stopOpacity="0.9" />
              </LinearGradient>
              <LinearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
              </LinearGradient>
            </Defs>

            {/* Fondo de la botella con efecto de vidrio */}
            <Path
              d={`
                M20,0 h40 
                a10,10 0 0 1 10,10 
                v160 
                a20,20 0 0 1 -20,20 
                h-20 
                a20,20 0 0 1 -20,-20 
                v-160 
                a10,10 0 0 1 10,-10 
                z
              `}
              fill="#1a1a3a"
              opacity={0.3}
            />

            {/* Agua animada */}
            <AnimatedRect
              x={strokeWidth}
              y={fillAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [bottleHeight - strokeWidth, strokeWidth],
              })}
              width={innerWidth}
              height={fillAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, innerHeight],
              })}
              fill="url(#waterGrad)"
              clipPath="url(#bottleClip)"
            />

            {/* Efecto de brillo */}
            <Path
              d={`
                M25,5 
                q15,-3 30,0 
                v160 
                q-15,3 -30,0 
                z
              `}
              fill="url(#glassGrad)"
              clipPath="url(#bottleClip)"
            />

            {/* Burbujas decorativas (estáticas) */}
            <Circle cx="35" cy="120" r="3" fill="#ffffff" opacity={0.6} />
            <Circle cx="50" cy="140" r="2" fill="#ffffff" opacity={0.5} />
            <Circle cx="45" cy="100" r="2.5" fill="#ffffff" opacity={0.7} />

            {/* Contorno de la botella */}
            <Path
              d={`
                M20,0 h40 
                a10,10 0 0 1 10,10 
                v160 
                a20,20 0 0 1 -20,20 
                h-20 
                a20,20 0 0 1 -20,-20 
                v-160 
                a10,10 0 0 1 10,-10 
                z
              `}
              fill="none"
              stroke="#4c6ef5"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>

        <View style={styles.metrics}>
          <Text style={styles.metricValue}>{Math.round(hydration)} ml</Text>
          <Text style={styles.metricLabel}>de {Math.round(dailyObjective)} ml</Text>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentage}>{Math.round(ratio * 100)}%</Text>
            <View style={[styles.progressIndicator, { width: `${Math.round(ratio * 100)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.customInputContainer}>
        <TextInput
          style={styles.customInput}
          value={customAmount}
          onChangeText={setCustomAmount}
          placeholder="Cantidad en ml"
          placeholderTextColor="#8a8a8a"
          keyboardType="numeric"
          autoFocus={false}
          blurOnSubmit={true}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCustomAmount}
        >
          <Icon name="add-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.presetButtonsContainer}>
        <TouchableOpacity 
          style={styles.presetButton}
          onPress={() => handleAddPresetAmount(100)}
        >
          <Text style={styles.presetButtonText}>100 ml</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.presetButton}
          onPress={() => handleAddPresetAmount(250)}
        >
          <Text style={styles.presetButtonText}>250 ml</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.presetButton}
          onPress={() => handleAddPresetAmount(500)}
        >
          <Text style={styles.presetButtonText}>500 ml</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HydrationBottleCard;